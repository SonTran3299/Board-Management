// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdmUoAWGieQsa6G8OKIwLah3qonin5rVI",
  authDomain: "board-management-database.firebaseapp.com",
  databaseURL: "https://board-management-database-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "board-management-database",
  storageBucket: "board-management-database.firebasestorage.app",
  messagingSenderId: "442886149877",
  appId: "1:442886149877:web:bf52a5f1691560955857bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export {database, auth};