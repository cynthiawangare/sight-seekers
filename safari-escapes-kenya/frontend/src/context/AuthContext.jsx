import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
} from '../firebase/auth';
import { auth, db } from '../firebase/config';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Force-refresh token to get latest custom claims
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const isAdminUser = tokenResult.claims.admin === true;

          // Fetch Firestore profile
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));

          setUser(firebaseUser);
          setUserProfile(profileSnap.exists() ? profileSnap.data() : null);
          setIsAdmin(isAdminUser);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser(firebaseUser);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const { user: fbUser } = await signInWithEmail(email, password);
    return fbUser;
  };

  const signup = async (email, password, profileData) => {
    const { user: fbUser } = await signUpWithEmail(email, password);
    const userDoc = {
      email,
      first_name: profileData.firstName || '',
      last_name: profileData.lastName || '',
      phone: profileData.phone || '',
      nationality: profileData.nationality || '',
      role: 'user',
      created_at: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', fbUser.uid), userDoc);
    setUserProfile(userDoc);
    return fbUser;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: fbUser } = await signInWithPopup(auth, provider);
    // Create Firestore doc if first login
    const profileSnap = await getDoc(doc(db, 'users', fbUser.uid));
    if (!profileSnap.exists()) {
      const nameParts = (fbUser.displayName || '').split(' ');
      const userDoc = {
        email: fbUser.email,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        phone: '',
        nationality: '',
        role: 'user',
        created_at: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', fbUser.uid), userDoc);
    }
    return fbUser;
  };

  const logout = () => signOut();

  const getToken = () => user?.getIdToken() || Promise.resolve(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        logout,
        getToken,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
