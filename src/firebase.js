import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8_T6Yucf32hIwvtqgsPvbdIajLmAs_cg",
  authDomain: "healthtracker-19535.firebaseapp.com",
  projectId: "healthtracker-19535",
  storageBucket: "healthtracker-19535.appspot.com",
  messagingSenderId: "582958758381",
  appId: "1:582958758381:web:6f22254fd1c46b30708fe4",
  measurementId: "G-FENP77ZBB7"
};

const app = initializeApp(firebaseConfig);
export default getFirestore();