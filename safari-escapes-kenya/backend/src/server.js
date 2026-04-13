require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Test Firebase Admin connection on startup
try {
  const { adminDb } = require('./config/firebase-admin');
  console.log('✅ Firebase Admin SDK initialized');
} catch (err) {
  console.error('❌ Firebase Admin SDK failed to initialize:', err.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Sight Seekers API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Client URL:  ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
