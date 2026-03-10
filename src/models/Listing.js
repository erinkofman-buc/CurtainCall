const db = require('../config/database');

const Listing = {
  async create(data) {
    const { rows } = await db.query(
      `INSERT INTO listings (seller_id, title, description, category, condition,
        bust_cm, waist_cm, hip_cm, torso_cm, inseam_cm, size_label,
        performance_history, accessories, price_cents, photos, transparency_pledge, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        data.seller_id, data.title, data.description || null,
        data.category, data.condition,
        data.bust_cm || null, data.waist_cm || null, data.hip_cm || null,
        data.torso_cm || null, data.inseam_cm || null, data.size_label || null,
        data.performance_history || null, data.accessories || null,
        data.price_cents, JSON.stringify(data.photos || []),
        data.transparency_pledge || false, data.status || 'active',
      ]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT l.*, u.display_name as seller_name, u.city as seller_city, u.province as seller_province
       FROM listings l JOIN users u ON l.seller_id = u.id
       WHERE l.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async list({ category, condition, search, sort, limit = 20, offset = 0, status = 'active', minPrice, maxPrice } = {}) {
    const conditions = ['l.status = $1'];
    const values = [status];
    let i = 2;

    if (category) {
      conditions.push(`l.category = $${i}`);
      values.push(category);
      i++;
    }
    if (condition) {
      conditions.push(`l.condition = $${i}`);
      values.push(condition);
      i++;
    }
    if (search) {
      conditions.push(`l.search_vector @@ plainto_tsquery('english', $${i})`);
      values.push(search);
      i++;
    }
    if (minPrice) {
      conditions.push(`l.price_cents >= $${i}`);
      values.push(Number(minPrice));
      i++;
    }
    if (maxPrice) {
      conditions.push(`l.price_cents <= $${i}`);
      values.push(Number(maxPrice));
      i++;
    }

    const orderMap = {
      newest: 'l.created_at DESC',
      oldest: 'l.created_at ASC',
      price_low: 'l.price_cents ASC',
      price_high: 'l.price_cents DESC',
    };
    const orderBy = orderMap[sort] || 'l.created_at DESC';

    values.push(Number(limit), Number(offset));
    const { rows } = await db.query(
      `SELECT l.*, u.display_name as seller_name
       FROM listings l JOIN users u ON l.seller_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}
       LIMIT $${i} OFFSET $${i + 1}`,
      values
    );

    // Get total count for pagination
    const countResult = await db.query(
      `SELECT COUNT(*) FROM listings l WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2)
    );

    return { listings: rows, total: parseInt(countResult.rows[0].count) };
  },

  async findBySeller(sellerId) {
    const { rows } = await db.query(
      'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC',
      [sellerId]
    );
    return rows;
  },

  async update(id, sellerId, fields) {
    const allowed = [
      'title', 'description', 'category', 'condition',
      'bust_cm', 'waist_cm', 'hip_cm', 'torso_cm', 'inseam_cm', 'size_label',
      'performance_history', 'accessories', 'price_cents', 'photos',
      'ai_song_suggestions', 'status', 'transparency_pledge',
    ];
    const updates = [];
    const values = [];
    let i = 1;
    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = $${i}`);
        values.push(key === 'photos' || key === 'ai_song_suggestions' ? JSON.stringify(val) : val);
        i++;
      }
    }
    if (updates.length === 0) return null;
    updates.push('updated_at = NOW()');
    values.push(id, sellerId);
    const { rows } = await db.query(
      `UPDATE listings SET ${updates.join(', ')} WHERE id = $${i} AND seller_id = $${i + 1} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async incrementViews(id) {
    await db.query('UPDATE listings SET view_count = view_count + 1 WHERE id = $1', [id]);
  },

  async expireOld() {
    const { rowCount } = await db.query(
      "UPDATE listings SET status = 'expired' WHERE status = 'active' AND expires_at < NOW()"
    );
    return rowCount;
  },
};

module.exports = Listing;
