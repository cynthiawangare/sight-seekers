import {
  collection, query, where, getDocs, getDoc, doc,
  addDoc, updateDoc, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const packagesRef = () => collection(db, 'packages');

export const getPackages = async (filters = {}) => {
  let q = query(packagesRef(), where('is_active', '==', true));
  if (filters.tourType) {
    q = query(packagesRef(), where('is_active', '==', true), where('tour_type', '==', filters.tourType));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getPackageBySlug = async (slug) => {
  const q = query(packagesRef(), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
};

export const getPackageById = async (packageId) => {
  const snap = await getDoc(doc(db, 'packages', packageId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const getPackageItinerary = async (packageId) => {
  const itineraryRef = collection(db, 'packages', packageId, 'itinerary');
  const q = query(itineraryRef, orderBy('day_number'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getFeaturedPackages = async () => {
  const q = query(packagesRef(), where('is_featured', '==', true), where('is_active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createPackage = async (data) => {
  return addDoc(packagesRef(), { ...data, created_at: serverTimestamp() });
};

export const updatePackage = async (id, data) => {
  return updateDoc(doc(db, 'packages', id), { ...data, updated_at: serverTimestamp() });
};

export const deactivatePackage = async (id) => {
  return updateDoc(doc(db, 'packages', id), { is_active: false });
};
