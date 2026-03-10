const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const db = require('../config/database');
const { createLabel, getTracking } = require('../services/shippingService');

// Create shipping label
router.post('/label', requireAuth, async (req, res, next) => {
  try {
    const { transactionId, fromAddress, toAddress } = req.body;

    // Verify transaction belongs to this seller
    const { rows } = await db.query(
      'SELECT * FROM transactions WHERE id = $1 AND seller_id = $2',
      [transactionId, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });

    const label = await createLabel({ fromAddress, toAddress });

    await db.query(
      `INSERT INTO shipments (transaction_id, tracking_number, carrier, label_url, status)
       VALUES ($1, $2, $3, $4, 'label_created')`,
      [transactionId, label.tracking_number, label.carrier || 'unknown', label.label_url]
    );

    res.json({ label });
  } catch (err) {
    next(err);
  }
});

// Add manual tracking
router.post('/manual-tracking', requireAuth, async (req, res, next) => {
  try {
    const { transactionId, trackingNumber, carrier } = req.body;

    const { rows } = await db.query(
      'SELECT * FROM transactions WHERE id = $1 AND seller_id = $2',
      [transactionId, req.session.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });

    await db.query(
      `INSERT INTO shipments (transaction_id, tracking_number, carrier, manual_tracking, status)
       VALUES ($1, $2, $3, true, 'shipped')`,
      [transactionId, trackingNumber, carrier]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Get tracking info
router.get('/track/:transactionId', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM shipments WHERE transaction_id = $1',
      [req.params.transactionId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No shipment found' });

    const shipment = rows[0];
    if (!shipment.manual_tracking && shipment.carrier && shipment.tracking_number) {
      const tracking = await getTracking(shipment.carrier, shipment.tracking_number);
      return res.json({ shipment, tracking });
    }

    res.json({ shipment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
