const router = require('express').Router();
const Listing = require('../models/Listing');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getPhotoUrl } = require('../services/storageService');
const { validateListing } = require('../utils/validators');
const { CATEGORIES, CONDITIONS } = require('../utils/constants');

// List with filters
router.get('/', async (req, res, next) => {
  try {
    const { category, condition, search, sort, page = 1, minPrice, maxPrice } = req.query;
    const limit = 20;
    const offset = (Number(page) - 1) * limit;
    const result = await Listing.list({ category, condition, search, sort, limit, offset, minPrice, maxPrice });
    res.json({ ...result, page: Number(page), perPage: limit });
  } catch (err) {
    next(err);
  }
});

// Get constants for forms
router.get('/constants', (req, res) => {
  res.json({ categories: CATEGORIES, conditions: CONDITIONS });
});

// My listings (must be before /:id)
router.get('/my/all', requireAuth, async (req, res, next) => {
  try {
    const listings = await Listing.findBySeller(req.session.userId);
    res.json({ listings });
  } catch (err) {
    next(err);
  }
});

// Expire old listings (manual trigger, must be before /:id)
router.post('/admin/expire', async (req, res, next) => {
  try {
    const count = await Listing.expireOld();
    res.json({ expired: count });
  } catch (err) {
    next(err);
  }
});

// Get single listing
router.get('/:id', async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    await Listing.incrementViews(req.params.id);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// Create listing
router.post('/', requireAuth, upload.array('photos', 8), async (req, res, next) => {
  try {
    const errors = validateListing(req.body);
    if (errors) return res.status(400).json({ errors });

    const photos = (req.files || []).map(f => getPhotoUrl(f.filename));

    const listing = await Listing.create({
      ...req.body,
      seller_id: req.session.userId,
      price_cents: Number(req.body.price_cents),
      photos,
    });

    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// Update listing
router.put('/:id', requireAuth, upload.array('photos', 8), async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.photos = req.files.map(f => getPhotoUrl(f.filename));
    }
    if (updates.price_cents) updates.price_cents = Number(updates.price_cents);

    const listing = await Listing.update(req.params.id, req.session.userId, updates);
    if (!listing) return res.status(404).json({ error: 'Listing not found or not yours' });
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// Delete (set status to removed)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const listing = await Listing.update(req.params.id, req.session.userId, { status: 'removed' });
    if (!listing) return res.status(404).json({ error: 'Listing not found or not yours' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
