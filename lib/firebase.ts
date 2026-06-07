import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAYBY0Ixe5ZudU_cEmsjDNHOkCBs8AZ1Us',
  authDomain: 'financial-management-23eab.firebaseapp.com',
  projectId: 'financial-management-23eab',
  storageBucket: 'financial-management-23eab.firebasestorage.app',
  messagingSenderId: '154053765777',
  appId: '1:154053765777:web:6f3095c5d1c3ad6967ad30',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
