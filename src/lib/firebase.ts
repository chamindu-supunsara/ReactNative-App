import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0mQA5_rXUC0ohc0FHORqr499j44tsOS0",
  authDomain: "eventapp-b1853.firebaseapp.com",
  projectId: "eventapp-b1853",
  storageBucket: "eventapp-b1853.firebasestorage.app",
  messagingSenderId: "169275803625",
  appId: "1:169275803625:web:cf40523d0f55f37c226d78",
  measurementId: "G-3KS7T7CVCM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
