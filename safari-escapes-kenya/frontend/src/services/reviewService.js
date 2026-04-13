import {
  collection, query, where, getDocs, addDoc, updateDoc,
  deleteDoc, doc, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const getPackageReviews = async (packageId) => {
  const q = query(
    collection(db, 'reviews'),
    where('package_id', '==', packageId),
    where('is_visible', '==', true),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getFeaturedReviews = async () => {
  const q = query(
    collection(db, 'reviews'),
    where('is_visible', '==', true),
    orderBy('created_at', 'desc'),
    limit(6)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createReview = async (reviewData) => {
  return addDoc(collection(db, 'reviews'), {
    ...reviewData,
    is_verified: false,
    is_visible: true,
    created_at: serverTimestamp(),
  });
};

export const updateReviewVisibility = async (reviewId, isVisible) => {
  return updateDoc(doc(db, 'reviews', reviewId), { is_visible: isVisible });
};

export const deleteReview = async (reviewId) => {
  return deleteDoc(doc(db, 'reviews', reviewId));
};
