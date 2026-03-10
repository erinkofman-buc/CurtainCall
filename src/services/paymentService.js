const env = require('../config/env');
const { PLATFORM_FEE_PERCENT } = require('../utils/constants');

function getStripe() {
  return require('stripe')(env.stripeSecretKey);
}

async function createConnectAccount(email) {
  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'CA',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  return account.id;
}

async function createOnboardingLink(accountId, returnUrl, refreshUrl) {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  });
  return link.url;
}

async function createCheckoutSession({ listingId, listingTitle, amountCents, sellerStripeId, successUrl, cancelUrl }) {
  const stripe = getStripe();
  const feeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'cad',
        product_data: { name: listingTitle },
        unit_amount: amountCents,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: feeCents,
      transfer_data: { destination: sellerStripeId },
    },
    metadata: { listing_id: listingId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

async function handleWebhook(payload, signature) {
  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  return event;
}

module.exports = { createConnectAccount, createOnboardingLink, createCheckoutSession, handleWebhook };
