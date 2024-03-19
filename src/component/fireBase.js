// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import the authentication module
import { getAnalytics } from "firebase/analytics";
import { getStorage  } from "firebase/storage"; // Import the storage module
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfIxA-8Qii-CJ4_3uGqQyxJGQI6HDLX2w",
  authDomain: "filemanager-f7ce4.firebaseapp.com",
  projectId: "filemanager-f7ce4",
  storageBucket: "filemanager-f7ce4.appspot.com",
  messagingSenderId: "857276354431",
  appId: "1:857276354431:web:8e5e459d916311cf81d44a",
  measurementId: "G-HT3GDCQZVG"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Export other Firebase services if needed
export { analytics };
