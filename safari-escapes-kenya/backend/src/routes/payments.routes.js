const router = require('express').Router();
const authMiddleware = require('../middleware/auth.middleware');
const { adminDb } = require('../config/firebase-admin');
const { createPaymentIntent, constructWebhookEvent } = require('../services/stripe.service');
const { initiateSTKPush } = require('../services/mpesa.service');
const { sendBookingConfirmation, sendPaymentReceipt } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

// ─── STRIPE ───────────────────────────────────────────────────
// POST /api/v1/payments/stripe/create-intent
router.post('/stripe/create-intent', authMiddleware, async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'bookingId and amount are required' });
    }
    const paymentId = uuidv4();
    const result = await createPaymentIntent({
      amount,
      currency: 'usd',
      bookingId,
      userId: req.user.uid,
    });

    // Save pending payment record to Firestore
    await adminDb.collection('payments').doc(paymentId).set({
      payment_id: paymentId,
      booking_id: bookingId,
      user_id: req.user.uid,
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: 'stripe',
      payment_intent_id: result.paymentIntentId,
      status: 'pending',
      created_at: adminDb.constructor.Timestamp ? adminDb.constructor.Timestamp.now() : new Date(),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/payments/stripe/webhook (raw body, public)
router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature failed: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { bookingId, userId } = paymentIntent.metadata;

    try {
      // Find and update payment record
      const paymentsSnap = await adminDb.collection('payments')
        .where('payment_intent_id', '==', paymentIntent.id)
        .limit(1)
        .get();

      if (!paymentsSnap.empty) {
        const paymentDoc = paymentsSnap.docs[0];
        await paymentDoc.ref.update({
          status: 'completed',
          transaction_id: paymentIntent.id,
          updated_at: new Date(),
        });
      }

      // Update booking status
      if (bookingId) {
        const bookingRef = adminDb.collection('bookings').doc(bookingId);
        const bookingSnap = await bookingRef.get();
        if (bookingSnap.exists) {
          await bookingRef.update({ status: 'confirmed', payment_status: 'completed' });
          const bookingData = bookingSnap.data();
          // Get user email
          const userSnap = await adminDb.collection('users').doc(userId).get();
          if (userSnap.exists) {
            await sendBookingConfirmation(userSnap.data().email, {
              ...bookingData,
              booking_reference: bookingData.booking_reference,
            }).catch(console.error);
          }
        }
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  res.json({ received: true });
});

// ─── M-PESA ───────────────────────────────────────────────────
// POST /api/v1/payments/mpesa/initiate
router.post('/mpesa/initiate', authMiddleware, async (req, res, next) => {
  try {
    const { phone, amount, bookingRef, bookingId } = req.body;
    const result = await initiateSTKPush({ phone, amount, bookingRef });

    // Save pending payment
    const paymentId = uuidv4();
    await adminDb.collection('payments').doc(paymentId).set({
      payment_id: paymentId,
      booking_id: bookingId,
      user_id: req.user.uid,
      amount: Math.round(amount * 130), // convert USD to KES cents
      currency: 'kes',
      payment_method: 'mpesa',
      checkout_request_id: result.CheckoutRequestID,
      status: 'pending',
      created_at: new Date(),
    });

    res.json({ checkoutRequestId: result.CheckoutRequestID, paymentId });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/payments/mpesa/callback (public — Safaricom webhook)
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body?.stkCallback;
    const resultCode = stkCallback?.ResultCode;
    const checkoutRequestId = stkCallback?.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const getMeta = (name) => callbackMetadata.find(i => i.Name === name)?.Value;
      const mpesaReceiptNumber = getMeta('MpesaReceiptNumber');
      const amount = getMeta('Amount');

      // Find pending payment by checkoutRequestId
      const paymentsSnap = await adminDb.collection('payments')
        .where('checkout_request_id', '==', checkoutRequestId)
        .limit(1)
        .get();

      if (!paymentsSnap.empty) {
        const paymentDoc = paymentsSnap.docs[0];
        const bookingId = paymentDoc.data().booking_id;

        await paymentDoc.ref.update({
          status: 'completed',
          transaction_id: mpesaReceiptNumber,
          updated_at: new Date(),
        });

        if (bookingId) {
          await adminDb.collection('bookings').doc(bookingId).update({
            status: 'confirmed',
            payment_status: 'completed',
          });
        }
      }
    } else {
      // Payment failed
      const paymentsSnap = await adminDb.collection('payments')
        .where('checkout_request_id', '==', checkoutRequestId)
        .limit(1)
        .get();
      if (!paymentsSnap.empty) {
        await paymentsSnap.docs[0].ref.update({ status: 'failed' });
      }
    }
  } catch (err) {
    console.error('M-Pesa callback error:', err);
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// ─── BOOKING CONFIRMATION EMAIL ───────────────────────────────
// POST /api/v1/payments/send-confirmation
router.post('/send-confirmation', authMiddleware, async (req, res, next) => {
  try {
    const { packageName, bookingRef, travelers, total, method } = req.body;
    const userEmail = req.user.email;

    await sendBookingConfirmation(userEmail, {
      booking_reference: bookingRef,
      package_name: packageName,
      travel_date: 'To be confirmed',
      num_travelers: travelers,
      total_price: Math.round(total * 100),
      payment_method: method,
    });

    res.json({ sent: true });
  } catch (err) {
    console.error('Confirmation email error:', err.message);
    // Don't fail the request — email is best-effort
    res.json({ sent: false, error: err.message });
  }
});

module.exports = router;
