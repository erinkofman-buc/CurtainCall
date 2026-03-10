const env = require('../config/env');

async function sendEmail({ to, subject, html }) {
  if (env.mockEmail) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body: ${html.substring(0, 200)}...`);
    return { id: 'mock-email-id', success: true };
  }

  // Real mode: use Resend
  const { Resend } = require('resend');
  const resend = new Resend(env.resendApiKey);
  const { data, error } = await resend.emails.send({
    from: 'CurtainCall <noreply@curtaincall.ca>',
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
}

async function sendMagicLink(email, token) {
  const link = `http://localhost:${env.port}/api/auth/magic-verify?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'Your CurtainCall login link',
    html: `<p>Click to log in: <a href="${link}">${link}</a></p><p>This link expires in 15 minutes.</p>`,
  });
}

async function sendInquiryNotification(sellerEmail, buyerName, listingTitle) {
  return sendEmail({
    to: sellerEmail,
    subject: `New inquiry on "${listingTitle}"`,
    html: `<p>${buyerName} is interested in your listing "${listingTitle}". Log in to CurtainCall to respond.</p>`,
  });
}

module.exports = { sendEmail, sendMagicLink, sendInquiryNotification };
