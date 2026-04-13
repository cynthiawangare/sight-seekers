require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Security
app.use(helmet());
app.use(morgan('dev'));

// Raw body for Stripe webhooks (must be before express.json())
app.use('/api/v1/payments/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
  })
);

// Routes
const paymentRoutes = require('./routes/payments.routes');
const adminRoutes = require('./routes/admin.routes');
const cancellationRoutes = require('./routes/cancellations.routes');

app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cancellations', cancellationRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'Sight Seekers API' }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
