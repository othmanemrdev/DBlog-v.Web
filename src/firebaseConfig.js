// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB947yTwUQpjF6Faynh7pPA6AsyWo4W1ag",
  authDomain: "blog-with-nosql.firebaseapp.com",
  databaseURL: "https://blog-with-nosql-default-rtdb.firebaseio.com",
  projectId: "blog-with-nosql",
  storageBucket: "blog-with-nosql.appspot.com",
  messagingSenderId: "166732301409",
  appId: "1:166732301409:web:10c020f1837a1b7ce21620",
  measurementId: "G-4RQGS54BHW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);