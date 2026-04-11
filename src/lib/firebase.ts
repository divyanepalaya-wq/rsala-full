import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyASuuXyBqkdcJh98mAufdaYuNaxhudawrw",
  authDomain: "r-sala.firebaseapp.com",
  projectId: "r-sala",
  storageBucket: "r-sala.firebasestorage.app",
  messagingSenderId: "186491749971",
  appId: "1:186491749971:web:213f5abc105ccf4dc0e8a6",
  measurementId: "G-1E50Y8FHKR",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics only runs in supported browser environments
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
});

export default app;
