import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createEnquiry = async ({ name, email, phone, wechat, travel_date, travelers, message, package_id, package_name, package_slug }) => {
  const ref = await addDoc(collection(db, 'enquiries'), {
    name,
    email,
    phone,
    wechat: wechat || '',
    travel_date,
    travelers,
    message,
    package_id: package_id || '',
    package_name: package_name || '',
    package_slug: package_slug || '',
    status: 'new',
    created_at: serverTimestamp(),
  });
  return ref.id;
};

export const getEnquiries = async () => {
  const snap = await getDocs(query(collection(db, 'enquiries'), orderBy('created_at', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
