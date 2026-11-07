import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCO8mP9Eh7HWui1MkrNKex4vyn3gxogwWE',
  authDomain: 'dr-ibrahim-hub.firebaseapp.com',
  projectId: 'dr-ibrahim-hub',
  storageBucket: 'dr-ibrahim-hub.firebasestorage.app',
  messagingSenderId: '575450923011',
  appId: '1:575450923011:web:31a8921f08e5b754c40e36',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const ADMIN_EMAIL = 'dr.ibrahim@mus-hub.com';
