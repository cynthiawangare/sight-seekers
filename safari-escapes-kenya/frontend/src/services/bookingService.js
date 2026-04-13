import {
  collection, query, where, getDocs, getDoc, addDoc,
  updateDoc, doc, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const generateBookingRef = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'SEK-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export const createBooking = async (bookingData) => {
  const { userId, packageId, packageName, pricePerPerson, numTravelers, travelDate, accommodationType, specialRequests } = bookingData;

  // Check if first booking for 15% discount
  const existingQ = query(
    collection(db, 'bookings'),
    where('user_id', '==', userId),
    limit(1)
  );
  const existingSnap = await getDocs(existingQ);
  const isFirstBooking = existingSnap.empty;

  const basePrice = pricePerPerson * numTravelers * 100; // in cents
  const discountAmount = isFirstBooking ? Math.round(basePrice * 0.15) : 0;
  const totalPrice = basePrice - discountAmount;

  const booking = {
    user_id: userId,
    package_id: packageId,
    package_name: packageName,
    booking_reference: generateBookingRef(),
    travel_date: travelDate,
    num_travelers: numTravelers,
    accommodation_type: accommodationType || 'hotel',
    special_requests: specialRequests || '',
    price_per_person: pricePerPerson * 100,
    base_price: basePrice,
    discount_amount: discountAmount,
    total_price: totalPrice,
    is_first_booking: isFirstBooking,
    status: 'pending',
    payment_status: 'pending',
    created_at: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'bookings'), booking);
  return { id: docRef.id, ...booking };
};

export const getUserBookings = async (userId) => {
  const q = query(
    collection(db, 'bookings'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getBookingById = async (bookingId) => {
  const snap = await getDoc(doc(db, 'bookings', bookingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateBookingStatus = async (bookingId, status) => {
  return updateDoc(doc(db, 'bookings', bookingId), { status, updated_at: serverTimestamp() });
};
