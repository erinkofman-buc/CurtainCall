const { CATEGORIES, CONDITIONS, PROVINCES } = require('./constants');

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

function validateDisplayName(name) {
  if (!name || typeof name !== 'string') return 'Display name is required';
  if (name.trim().length < 2) return 'Display name must be at least 2 characters';
  if (name.length > 100) return 'Display name must be under 100 characters';
  return null;
}

function validateListing(data) {
  const errors = {};
  if (!data.title || data.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (data.title && data.title.length > 200) errors.title = 'Title must be under 200 characters';
  if (!data.category || !CATEGORIES.includes(data.category)) errors.category = 'Valid category is required';
  if (!data.condition || !CONDITIONS.includes(data.condition)) errors.condition = 'Valid condition is required';
  if (!data.price_cents || !Number.isInteger(Number(data.price_cents)) || Number(data.price_cents) < 100) {
    errors.price_cents = 'Price must be at least $1.00';
  }
  if (data.province && !PROVINCES.find(p => p.code === data.province)) {
    errors.province = 'Invalid province';
  }
  return Object.keys(errors).length ? errors : null;
}

function validateInquiry(data) {
  if (!data.message || data.message.trim().length < 10) {
    return 'Message must be at least 10 characters';
  }
  return null;
}

module.exports = { validateEmail, validatePassword, validateDisplayName, validateListing, validateInquiry };
