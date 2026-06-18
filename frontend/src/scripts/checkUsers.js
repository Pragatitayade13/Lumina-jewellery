import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "mock-key",
  authDomain: "jewellery-app.firebaseapp.com",
  projectId: "jewellery-management-system-54321", // Just guessing, I need the real config
};
// I can just read the config from src/config/firebase.js
