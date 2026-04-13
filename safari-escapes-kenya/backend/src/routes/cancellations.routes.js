const router = require('express').Router();
const { sendCancellationRequest } = require('../services/email.service');
const { adminDb } = require('../config/firebase-admin');

// POST /api/v1/cancellations/request
router.post('/request', async (req, res, next) => {
  try {
    const { full_name, email, phone, booking_ref, package_name, travel_date, reason, additional_info } = req.body;

    if (!full_name || !email || !booking_ref || !package_name || !travel_date || !reason) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Save to Firestore
    await adminDb.collection('cancellations').add({
      full_name, email,
      phone: phone || '',
      booking_ref,
      package_name,
      travel_date,
      reason,
      additional_info: additional_info || '',
      status: 'new',
      created_at: new Date(),
    });

    // Send emails (best-effort)
    sendCancellationRequest({
      full_name, email, phone, booking_ref,
      package_name, travel_date, reason, additional_info,
    }).catch(() => {});

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
