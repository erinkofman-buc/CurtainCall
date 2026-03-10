# CurtainCall — Project Rules

## What This Is
Peer-to-peer costume resale marketplace for Canadian performers (dancers, figure skaters, gymnasts). Portfolio piece built demo-to-production.

## Stack
- Node.js + Express + PostgreSQL + vanilla HTML/CSS/JS
- No build step, no framework

## Code Rules
- All prices stored as INTEGER cents (price_cents), never floats
- All IDs are UUIDs
- All SQL uses parameterized queries ($1, $2) — never string interpolation
- Services use mock/real pattern: check env vars (MOCK_EMAIL, MOCK_AI), log to console when mocked
- Function signatures and return shapes identical in mock and real mode
- Error handler middleware catches all — routes use next(err)
- Auth via express-session + connect-pg-simple

## Design Rules
- Mobile-first, test at 375px
- Min 20px body text, 48px tap targets
- Color palette: curtain-red (#8B2252), spotlight-gold (#C9A96E), stage-black (#1A1A2E), cream (#FFF8F0), blush (#F5E6E0)
- Fonts: Playfair Display (headings), Source Sans 3 (body)
- High contrast, warm tones — accessibility priority

## File Conventions
- Routes: src/routes/*Routes.js
- Models: src/models/*.js — static methods, return plain objects
- Services: src/services/*Service.js
- Migrations: migrations/NNN_description.sql
- Frontend JS: public/js/*.js — vanilla, no framework
- CSS: public/css/ — vars.css (tokens), base.css, components.css, pages.css

## Testing
- smoke.js hits all endpoints, verifies status codes
- Manual browser test at 375px after each phase

## Git
- Commit after each completed phase
- Conventional-ish messages: "phase 0: scaffolding", "phase 1: auth system"
