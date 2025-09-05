// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDW-cVI2wo6w0S2FbBKTeMEjP1Kqib3Ykw",
  authDomain: "lumora-e4bbd.firebaseapp.com",
  projectId: "lumora-e4bbd",
  storageBucket: "lumora-e4bbd.appspot.com", //
  messagingSenderId: "382468357057",
  appId: "1:382468357057:web:c6aa628dba9aac20c5cd40",
  measurementId: "G-5X8ZLWT4JH"
};

// Inicializa la app
const app = initializeApp(firebaseConfig);

// Exporta Firestore y app
const db = getFirestore(app);
export { db, app }; // ✅ AÑADIDO app
