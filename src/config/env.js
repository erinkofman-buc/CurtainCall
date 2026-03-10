require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/curtaincall',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret',
  mockEmail: process.env.MOCK_EMAIL === 'true',
  mockAI: process.env.MOCK_AI === 'true',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  shippoApiKey: process.env.SHIPPO_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  claudeApiKey: process.env.CLAUDE_API_KEY,
};
