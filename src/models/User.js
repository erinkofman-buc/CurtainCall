const db = require('../config/database');

const User = {
  async create({ email, passwordHash, displayName, province, city }) {
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, display_name, province, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, display_name, province, city, created_at`,
      [email, passwordHash, displayName, province || null, city || null]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id, email, display_name, province, city, stripe_account_id, email_verified, weekly_digest, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async update(id, fields) {
    const allowed = ['display_name', 'province', 'city', 'stripe_account_id', 'email_verified', 'weekly_digest'];
    const updates = [];
    const values = [];
    let i = 1;
    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = $${i}`);
        values.push(val);
        i++;
      }
    }
    if (updates.length === 0) return null;
    updates.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, email, display_name, province, city, stripe_account_id, email_verified, created_at`,
      values
    );
    return rows[0] || null;
  },

  async setMagicToken(email, token, expiresAt) {
    await db.query(
      'UPDATE users SET magic_token = $1, magic_token_expires = $2 WHERE email = $3',
      [token, expiresAt, email]
    );
  },

  async findByMagicToken(token) {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE magic_token = $1 AND magic_token_expires > NOW()',
      [token]
    );
    return rows[0] || null;
  },
};

module.exports = User;
