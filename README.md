# CurtainCall

Peer-to-peer costume resale marketplace for Canadian performers — dancers, figure skaters, gymnasts.

## Stack

- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** Vanilla HTML/CSS/JS (no build step)
- **Payments:** Stripe Connect (test mode)
- **Shipping:** Shippo (test mode)
- **AI:** Claude API for song suggestions + listing descriptions (mock mode available)

## Quick Start

```bash
# Prerequisites: Node.js 18+, PostgreSQL 16+

# 1. Create database
createdb curtaincall

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Run migrations
npm run migrate

# 5. Seed sample data
npm run seed

# 6. Start server
npm run dev
# Visit http://localhost:3000
```

## Demo Accounts

All seed accounts use password: `password123`

| Email | Name | Location |
|-------|------|----------|
| sarah@example.com | Sarah Chen | Toronto, ON |
| maya@example.com | Maya Okafor | Vancouver, BC |
| emma@example.com | Emma Tremblay | Montreal, QC |
| lily@example.com | Lily Nguyen | Calgary, AB |
| ava@example.com | Ava Morrison | Ottawa, ON |

## Project Structure

```
server.js              Express entry point
src/
  config/              Database + env config
  middleware/          Auth, uploads, rate limiting, errors
  routes/              API routes (auth, listings, inquiries, payments, shipping, AI)
  services/            Business logic (email, AI, payments, shipping, storage)
  models/              Database models (User, Listing, Inquiry)
  utils/               Validators, constants
migrations/            SQL migrations + runner
seeds/                 Sample data
public/                Frontend (HTML, CSS, JS)
tests/                 Smoke tests
```

## Features

- Browse and search costumes by category, condition, price
- Create listings with photos, measurements, performance history
- AI-powered listing descriptions and song suggestions
- Secure payments via Stripe Connect (8% platform fee)
- Shipping label generation via Shippo
- User dashboard with listing management and inquiry tracking

## License

ISC
