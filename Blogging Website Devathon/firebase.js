import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { doc, setDoc, addDoc, getFirestore, getDoc, getDocs, deleteDoc, query, where, orderBy, updateDoc, collection, serverTimestamp, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";

const firebaseConfig = {
  // YOUR API KEYS HERE //
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage();

export {auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, addDoc, db, getDoc, getDocs, deleteDoc, query, where, orderBy, updateDoc, collection, serverTimestamp, storage , getStorage, ref, getDownloadURL, uploadBytes, deleteObject, increment, onSnapshot };