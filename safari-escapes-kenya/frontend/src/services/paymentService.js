import api from './api';

export const createStripeIntent = async (bookingId, amount) => {
  const { data } = await api.post('/api/v1/payments/stripe/create-intent', { bookingId, amount });
  return data;
};

export const initiateMpesa = async (phone, amount, bookingRef, bookingId) => {
  const { data } = await api.post('/api/v1/payments/mpesa/initiate', {
    phone, amount, bookingRef, bookingId,
  });
  return data;
};

export const sendConfirmationEmail = async ({ packageName, bookingRef, travelers, total, method }) => {
  const { data } = await api.post('/api/v1/payments/send-confirmation', {
    packageName, bookingRef, travelers, total, method,
  });
  return data;
};
