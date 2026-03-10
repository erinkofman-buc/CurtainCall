const router = require('express').Router();
const { getSongSuggestions, generateDescription } = require('../services/aiService');

// Get song suggestions for a listing
router.post('/songs', async (req, res, next) => {
  try {
    const { category, title, description } = req.body;
    if (!category) return res.status(400).json({ error: 'Category required' });
    const songs = await getSongSuggestions(category, title, description);
    res.json({ songs });
  } catch (err) {
    next(err);
  }
});

// Generate listing description
router.post('/describe', async (req, res, next) => {
  try {
    const { category, title, condition, size_label, performance_history } = req.body;
    if (!category) return res.status(400).json({ error: 'Category required' });
    const description = await generateDescription(category, { title, condition, size_label, performance_history });
    res.json({ description });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
