const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../..', '.env')
});

const { adminAuth, adminDb } = require('../config/firebase-admin');

async function setAdminClaim() {
  try {
    const email = 'admin@sightseekers.com';

    // Get user by email
    const user = await adminAuth.getUserByEmail(email);
    console.log('Found user:', user.uid);

    // Set custom claim
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    console.log('✅ Admin claim set for:', email);

    // Create/update Firestore document
    await adminDb.collection('users').doc(user.uid).set({
      email: email,
      first_name: 'Safari',
      last_name: 'Admin',
      role: 'admin',
      created_at: new Date(),
    }, { merge: true });
    console.log('✅ Firestore user document created');

    // Verify the claim was set
    const updatedUser = await adminAuth.getUser(user.uid);
    console.log('Custom claims:', updatedUser.customClaims);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

setAdminClaim();
