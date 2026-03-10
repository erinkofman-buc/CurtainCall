const router = require('express').Router();
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Listing = require('../models/Listing');
const db = require('../config/database');
const env = require('../config/env');
const { createConnectAccount, createOnboardingLink, createCheckoutSession, handleWebhook } = require('../services/paymentService');
const { PLATFORM_FEE_PERCENT } = require('../utils/constants');

// Create Stripe Connect account for seller
router.post('/connect/create', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (user.stripe_account_id) {
      return res.json({ accountId: user.stripe_account_id, exists: true });
    }

    const accountId = await createConnectAccount(user.email);
    await User.update(user.id, { stripe_account_id: accountId });

    const link = await createOnboardingLink(
      accountId,
      `http://localhost:${env.port}/account?stripe=complete`,
      `http://localhost:${env.port}/account?stripe=refresh`
    );

    res.json({ accountId, onboardingUrl: link });
  } catch (err) {
    next(err);
  }
});

// Get onboarding link (if already have account)
router.get('/connect/onboarding', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user.stripe_account_id) {
      return res.status(400).json({ error: 'No Stripe account. Create one first.' });
    }

    const link = await createOnboardingLink(
      user.stripe_account_id,
      `http://localhost:${env.port}/account?stripe=complete`,
      `http://localhost:${env.port}/account?stripe=refresh`
    );

    res.json({ onboardingUrl: link });
  } catch (err) {
    next(err);
  }
});

// Create checkout session for buying
router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ error: 'Listing not available' });
    if (listing.seller_id === req.session.userId) return res.status(400).json({ error: 'Cannot buy your own listing' });

    const seller = await User.findById(listing.seller_id);
    if (!seller.stripe_account_id) {
      return res.status(400).json({ error: 'Seller has not set up payments yet' });
    }

    const session = await createCheckoutSession({
      listingId: listing.id,
      listingTitle: listing.title,
      amountCents: listing.price_cents,
      sellerStripeId: seller.stripe_account_id,
      successUrl: `http://localhost:${env.port}/listing?id=${listing.id}&purchased=true`,
      cancelUrl: `http://localhost:${env.port}/listing?id=${listing.id}`,
    });

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = await handleWebhook(req.body, sig);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const listingId = session.metadata.listing_id;
      const amountCents = session.amount_total;
      const feeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100);

      // Record transaction
      await db.query(
        `INSERT INTO transactions (listing_id, buyer_id, seller_id, amount_cents, platform_fee_cents, stripe_payment_id, status)
         SELECT $1, $2, seller_id, $3, $4, $5, 'completed' FROM listings WHERE id = $1`,
        [listingId, session.client_reference_id, amountCents, feeCents, session.payment_intent]
      );

      // Mark listing as sold
      await db.query("UPDATE listings SET status = 'sold' WHERE id = $1", [listingId]);
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
