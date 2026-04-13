const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async ({ amount, currency = 'usd', bookingId, userId }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert dollars to cents
    currency,
    metadata: { bookingId, userId },
  });
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

const constructWebhookEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

module.exports = { createPaymentIntent, constructWebhookEvent, stripe };
