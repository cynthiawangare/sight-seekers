const axios = require('axios');

const PAYPAL_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const getAccessToken = async () => {
  const { data } = await axios.post(
    `${PAYPAL_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return data.access_token;
};

const createOrder = async ({ amount, currency = 'USD', bookingId }) => {
  const token = await getAccessToken();
  const { data } = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: currency, value: String(amount.toFixed(2)) },
        custom_id: bookingId,
      }],
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data;
};

const captureOrder = async (orderId) => {
  const token = await getAccessToken();
  const { data } = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data;
};

module.exports = { createOrder, captureOrder };
