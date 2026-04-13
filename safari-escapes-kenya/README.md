# Sight Seekers 🦁

A full-stack tour & travel booking platform for world-class Kenyan safaris, targeting Chinese and Kenyan tourists.

## Tech Stack
- **Frontend**: React 18 + Vite, TailwindCSS, React Router v6
- **Database**: Firebase Firestore (NoSQL, cloud-hosted)
- **Auth**: Firebase Authentication (email/password + Google)
- **Storage**: Firebase Storage (images, avatars)
- **Backend**: Node.js + Express (payments only)
- **Payments**: Stripe, PayPal, M-Pesa Daraja API

## Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project named `sight-seekers`
3. Enable **Firestore Database** (Native mode)
4. Enable **Authentication** → Email/Password + Google
5. Enable **Storage**
6. Go to **Project Settings → General** → copy your web app config
7. Go to **Project Settings → Service Accounts** → Generate new private key (for backend)

## Environment Variables

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env` and fill in:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sight-seekers
VITE_FIREBASE_STORAGE_BUCKET=sight-seekers.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_API_URL=http://localhost:5000
```

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and fill in:
```
PORT=5000
FIREBASE_PROJECT_ID=sight-seekers
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@sight-seekers.iam.gserviceaccount.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_PASSKEY=...
MPESA_SHORTCODE=...
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
```

## Running Locally

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

No Docker needed — Firebase is cloud-hosted!

## Seeding Firestore

After setting up your Firebase project and backend `.env`:
```bash
cd backend
npm run seed
```

This seeds:
- 4 safari packages with full itineraries
- 6 sample reviews
- 1 admin user (admin@sightseekers.com / Admin@Sightseekers2024)

## Firestore Rules Deployment

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Payment Provider Setup

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Copy publishable key (frontend) and secret key (backend)
3. Set up webhook endpoint: `POST /api/v1/payments/stripe/webhook`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**Test cards:**
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- UnionPay: `6200 0000 0000 0005`

### PayPal
1. Create app at [developer.paypal.com](https://developer.paypal.com)
2. Copy Client ID and Secret

### M-Pesa
1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create Daraja app
3. Get Consumer Key, Consumer Secret, Passkey
4. Set callback URL (requires public HTTPS URL — use ngrok for local dev)

## Admin Setup

After running `npm run seed`:
1. Admin user: `admin@sightseekers.com` / `Admin@Sightseekers2024`
2. Firebase custom claim `{ admin: true }` is automatically set
3. Access admin panel at `/admin`

To promote another user to admin:
- Log in as admin → Admin Panel → Users → Make Admin

## Project Structure

```
sight-seekers/
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # AuthContext, BookingContext
│   │   ├── firebase/      # Firebase config, auth helpers
│   │   ├── hooks/         # useAuth, usePackages, useBooking
│   │   ├── pages/         # Page components
│   │   ├── services/      # Firestore service functions
│   │   └── utils/         # Formatters, validators
│   ├── .env.example
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── config/        # firebase-admin.js
│   │   ├── middleware/    # auth, admin middleware
│   │   ├── routes/        # payments, admin routes
│   │   ├── seeds/         # seedFirestore.js
│   │   └── services/      # stripe, paypal, mpesa, email
│   └── .env.example
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
└── CLAUDE.md
```
