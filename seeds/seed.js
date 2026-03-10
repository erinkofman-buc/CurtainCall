const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

const USERS = [
  { email: 'sarah@example.com', displayName: 'Sarah Chen', province: 'ON', city: 'Toronto' },
  { email: 'maya@example.com', displayName: 'Maya Okafor', province: 'BC', city: 'Vancouver' },
  { email: 'emma@example.com', displayName: 'Emma Tremblay', province: 'QC', city: 'Montreal' },
  { email: 'lily@example.com', displayName: 'Lily Nguyen', province: 'AB', city: 'Calgary' },
  { email: 'ava@example.com', displayName: 'Ava Morrison', province: 'ON', city: 'Ottawa' },
];

const LISTINGS = [
  {
    title: 'Classical White Swan Tutu',
    description: 'Stunning white pancake tutu used in Swan Lake production. Hand-sewn with 12 layers of tulle, Swarovski crystal bodice detailing. Worn for one season only.',
    category: 'ballet',
    condition: 'like-new',
    bust_cm: 82, waist_cm: 62, hip_cm: 88, torso_cm: 40,
    size_label: 'S',
    performance_history: 'Worn in National Ballet School spring showcase 2025. 3 performances total.',
    accessories: 'Matching feather headpiece included',
    price_cents: 28500,
    transparency_pledge: true,
    sellerIndex: 0,
  },
  {
    title: 'Red Jazz Competition Costume',
    description: 'Show-stopping red sequin jazz costume. Two-piece with crop top and high-waisted shorts. Built-in nude mesh panels. Competition-ready.',
    category: 'jazz',
    condition: 'gently-used',
    bust_cm: 78, waist_cm: 60,
    size_label: 'XS',
    performance_history: 'Used in 3 regional competitions (2024-2025 season). One small repair on left shoulder strap, professionally done.',
    price_cents: 15000,
    transparency_pledge: true,
    sellerIndex: 1,
  },
  {
    title: 'Emerald Figure Skating Dress',
    description: 'Beautiful emerald green skating dress with hand-placed rhinestones. Stretch velvet bodice, layered chiffon skirt. Catches the light beautifully on ice.',
    category: 'figure-skating',
    condition: 'like-new',
    bust_cm: 80, waist_cm: 64, hip_cm: 86,
    size_label: 'M',
    performance_history: 'Worn for one season in Skate Canada qualifiers.',
    accessories: 'Matching hair scrunchie and gloves',
    price_cents: 32000,
    transparency_pledge: true,
    sellerIndex: 2,
  },
  {
    title: 'Lyrical Contemporary Bodysuit',
    description: 'Flowing nude mesh and burgundy bodysuit for contemporary or lyrical. Beautiful draping detail on one shoulder. Very flattering cut.',
    category: 'contemporary',
    condition: 'new-with-tags',
    bust_cm: 84, waist_cm: 66, hip_cm: 90,
    size_label: 'M',
    price_cents: 12000,
    sellerIndex: 3,
  },
  {
    title: 'Musical Theatre Showgirl Set',
    description: 'Glamorous black and gold showgirl costume from a Cabaret production. Sequin corset top, feather-trimmed skirt, and matching arm cuffs.',
    category: 'musical-theatre',
    condition: 'gently-used',
    bust_cm: 86, waist_cm: 68,
    size_label: 'M',
    performance_history: 'Community theatre Cabaret production, 8 shows. Some feathers could use refreshing.',
    accessories: 'Arm cuffs and headpiece included',
    price_cents: 18500,
    transparency_pledge: true,
    sellerIndex: 0,
  },
  {
    title: 'Gymnastics Competition Leotard - Purple Galaxy',
    description: 'Stunning purple holographic leotard with crystal embellishments. Long sleeves, competition cut. Custom-made by GK Elite.',
    category: 'gymnastics',
    condition: 'like-new',
    bust_cm: 76, waist_cm: 58, torso_cm: 38,
    size_label: 'XS',
    performance_history: 'Worn in 2 provincial-level competitions.',
    price_cents: 22000,
    sellerIndex: 4,
  },
  {
    title: 'Tap Dance Tuxedo Costume',
    description: 'Classic black and white tuxedo-style tap costume. Fitted jacket with tails, high-waisted dance pants. Great Gatsby vibes.',
    category: 'tap',
    condition: 'gently-used',
    bust_cm: 88, waist_cm: 70, hip_cm: 94, inseam_cm: 76,
    size_label: 'L',
    performance_history: 'End-of-year recital and one competition.',
    price_cents: 9500,
    sellerIndex: 1,
  },
  {
    title: 'Ballroom Latin Dress - Fiery Orange',
    description: 'Vibrant orange and red Latin ballroom dress with fringe skirt for maximum movement. Open back, fitted through bodice. Incredible on the dance floor.',
    category: 'ballroom',
    condition: 'well-loved',
    bust_cm: 82, waist_cm: 64, hip_cm: 88,
    size_label: 'S',
    performance_history: 'Used for 2 competition seasons. Fringe is still full and flowing. Minor wear on inside lining.',
    accessories: 'Matching earrings',
    price_cents: 14000,
    transparency_pledge: true,
    sellerIndex: 3,
  },
];

async function seed() {
  console.log('Seeding database...');

  // Check if already seeded
  const { rows: existing } = await db.query('SELECT COUNT(*) FROM users');
  if (parseInt(existing[0].count) > 0) {
    console.log('Database already has data. Skipping seed.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('password123', 12);

  // Create users
  const userIds = [];
  for (const u of USERS) {
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, display_name, province, city, email_verified)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      [u.email, passwordHash, u.displayName, u.province, u.city]
    );
    userIds.push(rows[0].id);
    console.log(`  Created user: ${u.displayName}`);
  }

  // Create listings
  for (const l of LISTINGS) {
    await db.query(
      `INSERT INTO listings (seller_id, title, description, category, condition,
        bust_cm, waist_cm, hip_cm, torso_cm, inseam_cm, size_label,
        performance_history, accessories, price_cents, photos, transparency_pledge)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        userIds[l.sellerIndex], l.title, l.description, l.category, l.condition,
        l.bust_cm || null, l.waist_cm || null, l.hip_cm || null,
        l.torso_cm || null, l.inseam_cm || null, l.size_label || null,
        l.performance_history || null, l.accessories || null,
        l.price_cents, JSON.stringify(['/img/placeholder.jpg']),
        l.transparency_pledge || false,
      ]
    );
    console.log(`  Created listing: ${l.title}`);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
