const router = require('express').Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const { adminAuth, adminDb } = require('../config/firebase-admin');

// POST /api/v1/admin/set-admin-claim
// Body: { uid, isAdmin: true/false }
router.post('/set-admin-claim', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { uid, isAdmin } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid is required' });

    await adminAuth.setCustomUserClaims(uid, { admin: !!isAdmin });

    // Update Firestore user document role field
    await adminDb.collection('users').doc(uid).update({
      role: isAdmin ? 'admin' : 'user',
    });

    res.json({ success: true, uid, admin: !!isAdmin });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
