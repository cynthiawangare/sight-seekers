# CLAUDE.md — Sight Seekers (Firebase Edition)

## Project Overview
Full-stack tour & travel booking platform specializing in Kenyan safaris,
targeting Chinese and Kenyan tourists. Built with React (Vite), Node.js
(Express for payments only), and Firebase (Firestore + Auth + Storage).

## Tech Stack
- **Frontend**: React 18 + Vite, TailwindCSS, React Router v6, Axios
- **Database**: Firebase Firestore (NoSQL, cloud-hosted, real-time)
- **Auth**: Firebase Authentication (email/password + Google sign-in)
- **Storage**: Firebase Storage (package images, user avatars)
- **Backend**: Node.js + Express (ONLY for payment webhooks & M-Pesa)
- **Payments**: Stripe (Visa, UnionPay), PayPal SDK, M-Pesa Daraja API
- **Admin SDK**: firebase-admin (backend only)

## Firebase Project Setup
- Project ID: sight-seekers
- Firestore Database: Native mode
- Auth providers: Email/Password, Google
- Storage bucket: sight-seekers.appspot.com

## Firestore Collections
- /users/{userId}              → user profiles + role
- /packages/{packageId}        → tour packages
- /packages/{packageId}/itinerary/{dayId}  → day-by-day itinerary
- /bookings/{bookingId}        → booking records
- /payments/{paymentId}        → payment records
- /reviews/{reviewId}          → traveler reviews

## User Roles (via Firestore + Firebase Custom Claims)
1. **guest**  — Browse only (no auth required)
2. **user**   — Book, pay, review (Firebase Auth + Firestore role: 'user')
3. **admin**  — Full access (Firebase custom claim: admin: true)

## Color Palette (CSS Variables)
- --blue-primary: #1A5276
- --blue-light: #2E86C1
- --brown-primary: #6E4B2A
- --brown-light: #A0724A
- --white: #FAFAFA
- --gray-light: #F2F3F4
- --gray-mid: #BDC3C7

## Key Conventions
- Firebase Auth UID is the user's document ID in /users collection
- All Firestore writes go through service files (never direct in components)
- Backend Express server ONLY handles: Stripe webhooks, PayPal capture,
  M-Pesa STK push & callback (Firebase Admin SDK used here for writes)
- Use snake_case for Firestore field names
- Component files: PascalCase. Utility/service files: camelCase
- All money stored in lowest denomination (cents for USD, cents for KES)

## Environment Variables
### Frontend (.env)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=
VITE_API_URL=http://localhost:5000

### Backend (.env)
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=sight-seekers
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@sight-seekers.iam.gserviceaccount.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

## Running Locally
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev

# No Docker needed — Firebase is cloud-hosted!

## Important Notes
- Get Firebase service account key from Firebase Console →
  Project Settings → Service Accounts → Generate new private key
- Set admin custom claim via backend seed script
- Airbnb integration is an external redirect (no API key needed)
- Firebase free Spark plan works for development;
  upgrade to Blaze plan for production (Cloud Functions + M-Pesa callbacks)
