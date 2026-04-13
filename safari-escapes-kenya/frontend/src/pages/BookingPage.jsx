import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPackageById, getPackageItinerary } from '../services/packageService';
import { createBooking } from '../services/bookingService';
import { createStripeIntent, initiateMpesa } from '../services/paymentService';
import { getBookingById } from '../services/bookingService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Lock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const KES_RATE = 130;

const inputStyle = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12,
  padding: '14px 16px', fontSize: 14, fontFamily: "'Outfit', sans-serif",
  color: 'var(--charcoal)', background: 'white', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  appearance: 'none',
};

const labelStyle = {
  display: 'block', fontFamily: "'Outfit', sans-serif", fontSize: 13,
  fontWeight: 600, color: 'var(--charcoal)', marginBottom: 8, letterSpacing: '0.02em',
};

function focusInput(e) {
  e.currentTarget.style.borderColor = 'var(--gold)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.12)';
}
function blurInput(e) {
  e.currentTarget.style.borderColor = '#E5E7EB';
  e.currentTarget.style.boxShadow = 'none';
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not selected';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const todayStr = new Date().toISOString().split('T')[0];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = ['Trip Details', 'Review & Pay', 'Confirmed'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48, padding: '24px 0' }}>
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Circle */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
            flexShrink: 0,
            background: i < current ? 'var(--sage)' : i === current ? 'var(--earth)' : 'white',
            color: i <= current ? 'white' : 'var(--stone)',
            border: i > current ? '2px solid #E5E7EB' : 'none',
            transition: 'all 0.3s',
          }}>
            {i < current ? <Check size={16} strokeWidth={3} /> : i + 1}
          </div>
          {/* Label */}
          <span style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 14,
            fontWeight: i === current ? 600 : 400,
            color: i < current ? 'var(--sage)' : i === current ? 'var(--charcoal)' : 'var(--stone)',
            whiteSpace: 'nowrap',
          }} className="step-label">
            {step}
          </span>
          {/* Connector */}
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2, maxWidth: 80, minWidth: 40,
              background: i < current ? 'var(--sage)' : '#E5E7EB',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Stripe Form ──────────────────────────────────────────────────────────────
function StripePaymentForm({ booking, onSuccess, formRef }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    try {
      const totalInDollars = booking.total_price / 100;
      const { clientSecret } = await createStripeIntent(booking.id, totalInDollars);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (error) throw new Error(error.message);
      if (paymentIntent.status === 'succeeded') onSuccess();
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef} id="stripe-form">
      <div style={{ border: '1.5px solid #E5E7EB', borderRadius: 12, padding: 16, background: 'white' }}>
        <CardElement options={{ style: { base: { fontSize: '15px', color: '#1c1917', fontFamily: 'Outfit, sans-serif' } } }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <Lock size={12} color="var(--stone)" />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--stone)' }}>
          Your payment is secured by Stripe
        </span>
      </div>
      {/* Hidden submit button — triggered by right column CTA */}
      <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
    </form>
  );
}

// ─── M-Pesa Form ─────────────────────────────────────────────────────────────
function MpesaForm({ booking, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sent, setSent] = useState(false);
  const amountKES = Math.round((booking.total_price / 100) * KES_RATE);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await initiateMpesa(phone, booking.total_price / 100, booking.booking_reference, booking.id);
      setSent(true);
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const updated = await getBookingById(booking.id);
          if (updated?.payment_status === 'completed') {
            clearInterval(poll);
            onSuccess();
          }
        } catch {}
        if (attempts >= 24) {
          clearInterval(poll);
          toast.error('M-Pesa timeout. Please try again or use another payment method.');
          setIsProcessing(false);
          setSent(false);
        }
      }, 5000);
    } catch (err) {
      toast.error(err.message || 'M-Pesa initiation failed');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>M-Pesa Phone Number</label>
        <input
          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="254XXXXXXXXX" required
          style={inputStyle} onFocus={focusInput} onBlur={blurInput}
        />
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--stone)', marginTop: 6 }}>
          Enter number with country code (254...)
        </p>
      </div>
      <div style={{ background: 'var(--mist)', borderRadius: 12, padding: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)' }}>Amount in KES:</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--charcoal)' }}>
          KES {amountKES.toLocaleString()}
        </span>
      </div>
      <button
        type="submit" disabled={isProcessing}
        className="btn-earth"
        style={{ width: '100%', justifyContent: 'center', marginTop: 16, height: 52, fontSize: 15, opacity: isProcessing ? 0.7 : 1 }}
      >
        {isProcessing ? '⏳ Waiting for M-Pesa...' : 'Send M-Pesa Request'}
      </button>
      {sent && (
        <div style={{ background: '#D1FAE5', borderRadius: 12, padding: 16, marginTop: 16, color: '#065F46', fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
          📱 Check your phone for the M-Pesa prompt
        </div>
      )}
    </form>
  );
}

// ─── Itinerary Accordion ──────────────────────────────────────────────────────
function ItineraryAccordion({ itinerary }) {
  const [openDay, setOpenDay] = useState(null);

  if (!itinerary.length) return null;

  return (
    <div style={{ marginTop: 32, textAlign: 'left' }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 16 }}>
        Your Itinerary
      </h3>
      {itinerary.map((day, idx) => {
        const isOpen = openDay === idx;
        return (
          <div key={day.id || idx} style={{ border: '1px solid #F0EDE6', borderRadius: 16, marginBottom: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenDay(isOpen ? null : idx)}
              style={{
                width: '100%', padding: '18px 24px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', background: 'white', cursor: 'pointer', border: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  background: 'var(--earth)', color: 'white', borderRadius: 100,
                  padding: '4px 12px', fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600,
                }}>
                  Day {day.day_number || idx + 1}
                </span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--charcoal)' }}>
                  {day.title || `Day ${idx + 1}`}
                </span>
              </div>
              <ChevronDown
                size={18} color="var(--stone)"
                style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
              />
            </button>
            {isOpen && (
              <div style={{ padding: '0 24px 20px', background: 'var(--mist)' }}>
                {day.description && (
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, lineHeight: 1.6, color: 'var(--charcoal)', paddingTop: 16 }}>
                    {day.description}
                  </p>
                )}
                {day.activities?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {day.activities.map((act, i) => (
                      <span key={i} style={{
                        background: 'white', borderRadius: 100, padding: '4px 12px',
                        fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--charcoal)',
                        border: '1px solid #E5E7EB',
                      }}>
                        {act}
                      </span>
                    ))}
                  </div>
                )}
                {(day.accommodation || day.meals) && (
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: 'var(--stone)', marginTop: 12 }}>
                    {day.accommodation && `🏨 ${day.accommodation}`}
                    {day.accommodation && day.meals && '  ·  '}
                    {day.meals && `🍽 ${[day.meals?.breakfast && 'B', day.meals?.lunch && 'L', day.meals?.dinner && 'D'].filter(Boolean).join('/')}`}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState(null);
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [itinerary, setItinerary] = useState([]);
  const [tripDetails, setTripDetails] = useState({
    travelDate: '',
    travelers: location.state?.travelers || 2,
    accommodationType: 'hotel',
    specialRequests: '',
  });

  const step1FormRef = useRef(null);
  const stripeFormRef = useRef(null);

  useEffect(() => {
    getPackageById(packageId)
      .then(setPkg)
      .catch(() => navigate('/'))
      .finally(() => setIsLoading(false));
  }, [packageId]);

  useEffect(() => {
    if (step === 2 && pkg) {
      getPackageItinerary(pkg.id).then(setItinerary).catch(() => {});
    }
  }, [step, pkg]);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!tripDetails.travelDate) { toast.error('Please select a travel date'); return; }
    setIsLoading(true);
    try {
      const created = await createBooking({
        userId: user.uid,
        packageId: pkg.id,
        packageName: pkg.name,
        pricePerPerson: pkg.price_per_person,
        numTravelers: tripDetails.travelers,
        travelDate: tripDetails.travelDate,
        accommodationType: tripDetails.accommodationType,
        specialRequests: tripDetails.specialRequests,
      });
      setBooking(created);
      setStep(1);
    } catch (err) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep(2);
    toast.success('Payment successful! Booking confirmed 🦁');
  };

  if (isLoading && !pkg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ivory)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--earth)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!pkg) return null;

  const basePrice = pkg.price_per_person * tripDetails.travelers;
  const discount = booking?.is_first_booking ? Math.round(basePrice * 0.15) : 0;
  const total = basePrice - discount;
  const displayTotal = booking ? booking.total_price / 100 : total;

  const showRightColCTA = step === 0 || (step === 1 && paymentMethod === 'card');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 48px 80px' }} className="booking-container">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'var(--stone)', fontFamily: "'Outfit', sans-serif", fontSize: 14,
            cursor: 'pointer', border: 'none', background: 'none', padding: 0,
            marginBottom: 32, transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--charcoal)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--stone)')}
        >
          <ArrowLeft size={16} />
          Back to Package
        </button>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }} className="booking-grid">

          {/* ── LEFT COLUMN ── */}
          <AnimatePresence mode="wait">

            {/* STEP 1 — Trip Details */}
            {step === 0 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div style={{ background: 'white', borderRadius: 24, border: '1px solid #F0EDE6', padding: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} className="booking-card">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--charcoal)', margin: 0 }}>
                    Trip Details
                  </h2>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)', marginTop: 4, marginBottom: 0 }}>
                    Tell us about your trip
                  </p>
                  <div style={{ height: 1, background: '#F0EDE6', margin: '24px 0' }} />

                  <form ref={step1FormRef} onSubmit={handleStep1Submit}>

                    {/* Travel Date */}
                    <div style={{ marginBottom: 28 }}>
                      <label style={labelStyle}>Travel Date</label>
                      <input
                        type="date"
                        value={tripDetails.travelDate}
                        onChange={(e) => setTripDetails({ ...tripDetails, travelDate: e.target.value })}
                        min={todayStr}
                        required
                        style={inputStyle}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                    </div>

                    {/* Travelers counter */}
                    <div style={{ marginBottom: 28 }}>
                      <label style={labelStyle}>Number of Travelers</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', width: 'fit-content' }}>
                        <button
                          type="button"
                          onClick={() => setTripDetails({ ...tripDetails, travelers: Math.max(1, tripDetails.travelers - 1) })}
                          style={{ width: 48, height: 52, background: 'var(--mist)', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--charcoal)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--mist)')}
                        >
                          −
                        </button>
                        <div style={{
                          width: 80, height: 52, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 600, color: 'var(--charcoal)',
                          borderLeft: '1.5px solid #E5E7EB', borderRight: '1.5px solid #E5E7EB',
                        }}>
                          {tripDetails.travelers}
                        </div>
                        <button
                          type="button"
                          onClick={() => setTripDetails({ ...tripDetails, travelers: Math.min(pkg.max_travelers || 20, tripDetails.travelers + 1) })}
                          style={{ width: 48, height: 52, background: 'var(--mist)', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--charcoal)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--mist)')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Accommodation */}
                    <div style={{ marginBottom: 28 }}>
                      <label style={labelStyle}>Accommodation Type</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="accom-grid">
                        {[
                          { key: 'hotel', emoji: '🏨', title: 'Hotel', sub: 'Lodge or tented camp' },
                          { key: 'airbnb', emoji: '🏡', title: 'Airbnb', sub: 'Local home stay' },
                        ].map(({ key, emoji, title, sub }) => {
                          const selected = tripDetails.accommodationType === key;
                          return (
                            <button
                              key={key} type="button"
                              onClick={() => setTripDetails({ ...tripDetails, accommodationType: key })}
                              style={{
                                border: `2px solid ${selected ? 'var(--earth)' : '#E5E7EB'}`,
                                borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12,
                                background: selected ? '#FEF3C7' : 'white', textAlign: 'left',
                              }}
                            >
                              <span style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</span>
                              <div>
                                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--charcoal)' }}>{title}</div>
                                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--stone)' }}>{sub}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div style={{ marginBottom: 0 }}>
                      <label style={labelStyle}>
                        Special Requests{' '}
                        <span style={{ fontWeight: 400, color: 'var(--stone)' }}>(optional)</span>
                      </label>
                      <textarea
                        value={tripDetails.specialRequests}
                        onChange={(e) => setTripDetails({ ...tripDetails, specialRequests: e.target.value })}
                        rows={4}
                        placeholder="Dietary requirements, accessibility needs, celebrations..."
                        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                    </div>

                  </form>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Review & Pay */}
            {step === 1 && booking && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <div style={{ background: 'white', borderRadius: 24, border: '1px solid #F0EDE6', padding: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} className="booking-card">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--charcoal)', margin: 0 }}>
                    Review & Pay
                  </h2>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)', marginTop: 4, marginBottom: 0 }}>
                    Choose your payment method
                  </p>
                  <div style={{ height: 1, background: '#F0EDE6', margin: '24px 0' }} />

                  {/* Booking summary */}
                  <div style={{ background: 'var(--mist)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--charcoal)', margin: '0 0 16px' }}>
                      {pkg.name}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                      {[
                        { label: 'TRAVEL DATE', value: formatDate(tripDetails.travelDate) },
                        { label: 'TRAVELERS', value: `${tripDetails.travelers} ${tripDetails.travelers === 1 ? 'person' : 'people'}` },
                        { label: 'ACCOMMODATION', value: tripDetails.accommodationType === 'hotel' ? '🏨 Hotel' : '🏡 Airbnb' },
                        { label: 'DURATION', value: `${pkg.duration_days || pkg.duration || '—'} Days` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--stone)', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, color: 'var(--charcoal)' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment method tabs */}
                  <div style={{ background: 'var(--mist)', borderRadius: 12, padding: 4, display: 'flex', gap: 4, marginBottom: 24 }}>
                    {[
                      { key: 'card', label: '💳 Card' },
                      { key: 'mpesa', label: '📱 M-Pesa' },
                    ].map(({ key, label }) => {
                      const active = paymentMethod === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setPaymentMethod(key)}
                          style={{
                            flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
                            cursor: 'pointer', transition: 'all 0.2s',
                            background: active ? 'white' : 'transparent',
                            color: active ? 'var(--charcoal)' : 'var(--stone)',
                            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment content */}
                  {paymentMethod === 'card' && (
                    <Elements stripe={stripePromise}>
                      <StripePaymentForm booking={booking} onSuccess={handlePaymentSuccess} formRef={stripeFormRef} />
                    </Elements>
                  )}

                  {paymentMethod === 'mpesa' && (
                    <MpesaForm booking={booking} onSuccess={handlePaymentSuccess} />
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Confirmed */}
            {step === 2 && booking && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <div style={{ background: 'white', borderRadius: 24, border: '1px solid #F0EDE6', padding: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', textAlign: 'center' }} className="booking-card">

                  {/* Success circle */}
                  <div style={{
                    width: 80, height: 80, background: '#D1FAE5', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                    animation: 'popIn 0.5s ease forwards',
                  }}>
                    <Check size={36} color="#065F46" strokeWidth={3} />
                  </div>

                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 16 }}>
                    Booking Confirmed! 🦁
                  </h2>

                  <div style={{ display: 'inline-block', background: 'var(--mist)', borderRadius: 12, padding: '16px 24px', marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--earth)', letterSpacing: '0.05em' }}>
                      REF: {booking.booking_reference}
                    </span>
                  </div>

                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: 'var(--stone)', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 32px' }}>
                    A confirmation email has been sent to your inbox with your full itinerary and guide contacts.
                  </p>

                  {/* Itinerary accordion */}
                  <ItineraryAccordion itinerary={itinerary} />

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }} className="confirm-actions">
                    <button onClick={() => window.print()} className="btn-outline" style={{ gap: 8 }}>
                      🖨 Print Itinerary
                    </button>
                    <button onClick={() => navigate('/')} className="btn-earth" style={{ gap: 8 }}>
                      🏠 Back to Home
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── RIGHT COLUMN — Sticky Summary Card ── */}
          <div style={{ position: 'sticky', top: 100, height: 'fit-content' }} className="summary-col">
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #F0EDE6', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              {/* Package image */}
              {pkg.images?.[0] && (
                <img
                  src={pkg.images[0]}
                  alt={pkg.name}
                  style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                  className="summary-img"
                />
              )}

              <div style={{ padding: 28 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: 'var(--charcoal)', margin: 0 }}>
                  {pkg.name}
                </h3>
                {pkg.tour_type && (
                  <span style={{
                    display: 'inline-block', background: 'var(--mist)', borderRadius: 100,
                    padding: '4px 12px', fontFamily: "'Outfit', sans-serif", fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--stone)', marginTop: 8,
                  }}>
                    {pkg.tour_type}
                  </span>
                )}

                {/* Info list */}
                <div style={{ marginTop: 20 }}>
                  {[
                    { icon: '📅', label: 'Date', value: tripDetails.travelDate ? formatDate(tripDetails.travelDate) : 'Not selected' },
                    { icon: '👥', label: 'Travelers', value: `${tripDetails.travelers} ${tripDetails.travelers === 1 ? 'person' : 'people'}` },
                    { icon: '⏱', label: 'Duration', value: `${pkg.duration_days || pkg.duration || '—'} Days` },
                    { icon: '🏨', label: 'Stay', value: tripDetails.accommodationType === 'hotel' ? 'Hotel' : 'Airbnb' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F0E8' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)' }}>{icon} {label}</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, color: 'var(--charcoal)', textAlign: 'right', maxWidth: 160 }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div style={{ background: 'var(--mist)', borderRadius: 16, padding: 20, marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)' }}>
                      Base price
                    </span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--charcoal)' }}>
                      ${pkg.price_per_person} × {tripDetails.travelers} = ${basePrice.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--sage)' }}>
                        First trip discount 🎉
                      </span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--sage)', fontWeight: 500 }}>
                        −${discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div style={{ height: 1, borderTop: '1px dashed #D1C9B8', margin: '12px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>Total</span>
                    <div style={{ textAlign: 'right' }}>
                      {discount > 0 && (
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: 'var(--stone)', textDecoration: 'line-through' }}>
                          ${basePrice.toLocaleString()}
                        </div>
                      )}
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>
                        ${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {discount > 0 && (
                    <div style={{ marginTop: 12, background: '#FEF3C7', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: 'var(--earth)' }}>
                        ⭐ 15% first booking discount applied!
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA button */}
                {step === 0 && (
                  <button
                    onClick={() => step1FormRef.current?.requestSubmit()}
                    disabled={isLoading}
                    className="btn-earth"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 24, height: 56, fontSize: 16, fontWeight: 600, opacity: isLoading ? 0.7 : 1 }}
                  >
                    {isLoading ? 'Creating booking...' : 'Continue to Payment →'}
                  </button>
                )}

                {step === 1 && paymentMethod === 'card' && (
                  <button
                    onClick={() => stripeFormRef.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))}
                    className="btn-earth"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 24, height: 56, fontSize: 16, fontWeight: 600 }}
                  >
                    <Lock size={16} />
                    Pay ${(booking.total_price / 100).toFixed(2)} Now 🔒
                  </button>
                )}

                {/* Security badges */}
                {step < 2 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                    {[
                      { icon: '🔒', label: 'Secure Checkout' },
                      { icon: '↩️', label: 'Free Cancellation' },
                      { icon: '✓', label: 'Instant Confirmation' },
                    ].map(({ icon, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12 }}>{icon}</span>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: 'var(--stone)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 900px) {
          .booking-grid { grid-template-columns: 1fr !important; }
          .summary-col { position: static !important; order: -1; }
          .summary-img { height: 160px !important; }
        }
        @media (max-width: 768px) {
          .booking-container { padding: 24px 20px 60px !important; }
        }
        @media (max-width: 480px) {
          .booking-card { padding: 24px !important; }
          .booking-card h2 { font-size: 24px !important; }
          .step-label { display: none; }
          .accom-grid { grid-template-columns: 1fr !important; }
          .confirm-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
