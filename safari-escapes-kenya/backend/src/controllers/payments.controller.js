const stripeService = require('../services/stripe.service');
const paypalService = require('../services/paypal.service');
const mpesaService = require('../services/mpesa.service');
const PaymentModel = require('../models/payment.model');
const stripe = require('../config/stripe');

exports.createStripeIntent = async (req, res, next) => {
  try {
    const { bookingId, amount, currency } = req.body;
    const paymentIntent = await stripeService.createPaymentIntent({ amount, currency });
    await PaymentModel.create({
      bookingId,
      userId: req.user.id,
      provider: 'stripe',
      providerRef: paymentIntent.id,
      amount,
      currency,
      status: 'pending',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};

exports.stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    await stripeService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

exports.createPaypalOrder = async (req, res, next) => {
  try {
    const { bookingId, amount, currency } = req.body;
    const order = await paypalService.createOrder({ amount, currency });
    await PaymentModel.create({
      bookingId,
      userId: req.user.id,
      provider: 'paypal',
      providerRef: order.id,
      amount,
      currency,
      status: 'pending',
    });
    res.json({ orderId: order.id });
  } catch (err) {
    next(err);
  }
};

exports.capturePaypalOrder = async (req, res, next) => {
  try {
    const capture = await paypalService.captureOrder(req.params.orderId);
    await PaymentModel.updateStatusByRef(req.params.orderId, 'paid');
    res.json({ capture });
  } catch (err) {
    next(err);
  }
};

exports.mpesaStkPush = async (req, res, next) => {
  try {
    const { phone, amount, bookingId } = req.body;
    const result = await mpesaService.initiateStkPush({ phone, amount });
    await PaymentModel.create({
      bookingId,
      userId: req.user.id,
      provider: 'mpesa',
      providerRef: result.CheckoutRequestID,
      amount,
      currency: 'KES',
      status: 'pending',
    });
    res.json({ checkoutRequestId: result.CheckoutRequestID });
  } catch (err) {
    next(err);
  }
};

exports.mpesaCallback = async (req, res, next) => {
  try {
    await mpesaService.handleCallback(req.body);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    next(err);
  }
};
