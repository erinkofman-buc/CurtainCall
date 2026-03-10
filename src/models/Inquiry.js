const db = require('../config/database');

const Inquiry = {
  async create({ listingId, buyerId, sellerId, message }) {
    const { rows } = await db.query(
      `INSERT INTO inquiries (listing_id, buyer_id, seller_id, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [listingId, buyerId, sellerId, message]
    );
    return rows[0];
  },

  async findByBuyer(buyerId) {
    const { rows } = await db.query(
      `SELECT i.*, l.title as listing_title, l.photos, u.display_name as seller_name
       FROM inquiries i
       JOIN listings l ON i.listing_id = l.id
       JOIN users u ON i.seller_id = u.id
       WHERE i.buyer_id = $1
       ORDER BY i.created_at DESC`,
      [buyerId]
    );
    return rows;
  },

  async findBySeller(sellerId) {
    const { rows } = await db.query(
      `SELECT i.*, l.title as listing_title, l.photos, u.display_name as buyer_name
       FROM inquiries i
       JOIN listings l ON i.listing_id = l.id
       JOIN users u ON i.buyer_id = u.id
       WHERE i.seller_id = $1
       ORDER BY i.created_at DESC`,
      [sellerId]
    );
    return rows;
  },

  async updateStatus(id, sellerId, status) {
    const { rows } = await db.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 AND seller_id = $3 RETURNING *',
      [status, id, sellerId]
    );
    return rows[0] || null;
  },
};

module.exports = Inquiry;
