const http = require('http');

const BASE = 'http://localhost:3000';

const tests = [
  { name: 'Landing page', url: '/', status: 200 },
  { name: 'Browse page', url: '/browse', status: 200 },
  { name: 'Login page', url: '/login', status: 200 },
  { name: 'Signup page', url: '/signup', status: 200 },
  { name: 'About page', url: '/about', status: 200 },
  { name: 'Terms page', url: '/terms', status: 200 },
  { name: 'How It Works page', url: '/how-it-works', status: 200 },
  { name: 'API: listings', url: '/api/listings', status: 200 },
  { name: 'API: constants', url: '/api/listings/constants', status: 200 },
  { name: 'API: auth me (no session)', url: '/api/auth/me', status: 200 },
  { name: 'API: inquiries sent (no auth)', url: '/api/inquiries/sent', status: 401 },
  { name: 'API: my listings (no auth)', url: '/api/listings/my/all', status: 401 },
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const status = await getStatus(test.url);
      if (status === test.status) {
        console.log(`  PASS: ${test.name} (${status})`);
        passed++;
      } else {
        console.log(`  FAIL: ${test.name} — expected ${test.status}, got ${status}`);
        failed++;
      }
    } catch (err) {
      console.log(`  FAIL: ${test.name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed out of ${tests.length} tests`);
  process.exit(failed > 0 ? 1 : 0);
}

function getStatus(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE}${path}`, (res) => {
      res.resume();
      resolve(res.statusCode);
    }).on('error', reject);
  });
}

runTests();
