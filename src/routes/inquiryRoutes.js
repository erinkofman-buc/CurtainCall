const router = require('express').Router();
const Inquiry = require('../models/Inquiry');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { validateInquiry } = require('../utils/validators');
const { sendInquiryNotification } = require('../services/emailService');

// Send inquiry
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { listingId, message } = req.body;
    const msgErr = validateInquiry({ message });
    if (msgErr) return res.status(400).json({ error: msgErr });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.seller_id === req.session.userId) {
      return res.status(400).json({ error: 'Cannot inquire on your own listing' });
    }

    const inquiry = await Inquiry.create({
      listingId,
      buyerId: req.session.userId,
      sellerId: listing.seller_id,
      message,
    });

    // Notify seller
    const buyer = await User.findById(req.session.userId);
    const seller = await User.findById(listing.seller_id);
    await sendInquiryNotification(seller.email, buyer.display_name, listing.title);

    res.status(201).json({ inquiry });
  } catch (err) {
    next(err);
  }
});

// My sent inquiries
router.get('/sent', requireAuth, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.findByBuyer(req.session.userId);
    res.json({ inquiries });
  } catch (err) {
    next(err);
  }
});

// Inquiries on my listings
router.get('/received', requireAuth, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.findBySeller(req.session.userId);
    res.json({ inquiries });
  } catch (err) {
    next(err);
  }
});

// Update inquiry status
router.put('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['responded', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const inquiry = await Inquiry.updateStatus(req.params.id, req.session.userId, status);
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ inquiry });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
