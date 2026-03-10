const router = require('express').Router();
const path = require('path');

const pages = ['browse', 'listing', 'sell', 'account', 'login', 'signup', 'about', 'terms', 'how-it-works'];

pages.forEach(page => {
  router.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', `${page}.html`));
  });
});

module.exports = router;
