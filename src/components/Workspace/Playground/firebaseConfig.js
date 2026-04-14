import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAoyid-IeEEJriJbvHjtF1ptWUmcDH0gmQ",
    authDomain: "crdt-03.firebaseapp.com",
    projectId: "crdt-03",
    storageBucket: "crdt-03.firebasestorage.app",
    messagingSenderId: "4718582918",
    appId: "1:4718582918:web:3da3b38e77baf6c1630507",
    measurementId: "G-VRDD11VLEB"
  };
  
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const database = getFirestore(app);

export const saveCodeToFirestore = async (roomId, code) => {
  try {
    await setDoc(doc(db, "rooms", roomId), { code }, { merge: true });
    console.log("Code saved to Firestore",roomId);
  } catch (error) {
    console.error("Error saving to Firestore:", error);
  }
};

export const loadCodeFromFirestore = async (roomId) => {
  try {
    const docSnap = await getDoc(doc(db, "rooms", roomId));
    if (docSnap.exists()) {
      console.log("Loaded from Firestore:", docSnap.data().code);
      return docSnap.data().code;
    } else {
      console.log("No code found in Firestore");
      return "";
    }
  } catch (error) {
    console.error("Error loading from Firestore:", error);
    return "";
  }
};