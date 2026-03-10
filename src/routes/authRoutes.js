const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { validateEmail, validatePassword, validateDisplayName } = require('../utils/validators');
const { sendMagicLink } = require('../services/emailService');
const { authLimiter } = require('../middleware/rateLimiter');

// Sign up
router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const { email, password, displayName, province, city } = req.body;

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ error: passErr });

    const nameErr = validateDisplayName(displayName);
    if (nameErr) return res.status(400).json({ error: nameErr });

    const existing = await User.findByEmail(email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName: displayName.trim(),
      province,
      city,
    });

    req.session.userId = user.id;
    res.status(201).json({ user: { id: user.id, email: user.email, display_name: user.display_name } });
  } catch (err) {
    next(err);
  }
});

// Log in
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findByEmail(email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.userId = user.id;
    res.json({ user: { id: user.id, email: user.email, display_name: user.display_name } });
  } catch (err) {
    next(err);
  }
});

// Log out
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    if (!req.session.userId) return res.json({ user: null });
    const user = await User.findById(req.session.userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Magic link request (mock: logs to console)
router.post('/magic-link', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ error: emailErr });

    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If that email is registered, a login link has been sent.' });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await User.setMagicToken(email.toLowerCase(), token, expires);
    await sendMagicLink(email, token);

    res.json({ message: 'If that email is registered, a login link has been sent.' });
  } catch (err) {
    next(err);
  }
});

// Magic link verify
router.get('/magic-verify', async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const user = await User.findByMagicToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid or expired token' });

    // Clear token
    await User.setMagicToken(user.email, null, null);
    req.session.userId = user.id;
    res.redirect('/account');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
