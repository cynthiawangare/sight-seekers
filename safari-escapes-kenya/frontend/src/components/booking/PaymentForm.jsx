import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../ui/Button';
import paymentService from '../../services/paymentService';

const METHODS = ['Stripe', 'M-Pesa'];

export default function PaymentForm({ bookingId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [method, setMethod] = useState('Stripe');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStripe = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const { clientSecret } = await paymentService.createStripeIntent({ bookingId, amount, currency: 'usd' });
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (stripeError) throw new Error(stripeError.message);
      if (paymentIntent.status === 'succeeded') onSuccess(paymentIntent.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMpesa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await paymentService.mpesaStkPush({ phone, amount, bookingId });
      onSuccess('mpesa-pending');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {METHODS.map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              method === m ? 'bg-blue-primary text-white border-blue-primary' : 'border-gray-mid text-gray-600'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {method === 'Stripe' && (
        <form onSubmit={handleStripe} className="space-y-4">
          <div className="border border-gray-mid rounded-lg p-4">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={loading || !stripe}>
            {loading ? 'Processing...' : 'Pay with Card'}
          </Button>
        </form>
      )}

      {method === 'M-Pesa' && (
        <form onSubmit={handleMpesa} className="space-y-4">
          <input
            type="tel"
            placeholder="254712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border border-gray-mid rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-light"
          />
          <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
            {loading ? 'Sending STK Push...' : 'Pay with M-Pesa'}
          </Button>
        </form>
      )}
    </div>
  );
}
