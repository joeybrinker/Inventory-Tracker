import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDhq9j2v_q3VIv8Thwxx4VM_iNGE2o-lCY",
    authDomain: "inventory-tracker-d0e64.firebaseapp.com",
    projectId: "inventory-tracker-d0e64",
    storageBucket: "inventory-tracker-d0e64.appspot.com",
    messagingSenderId: "668623977143",
    appId: "1:668623977143:web:d6963ec723b2fdd242eb32",
  };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };