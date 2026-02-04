// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
// (ver instrucciones en README.md)

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDgBZEoRxd6TcTxfEDDs_60cj_Hq9mreJE",
  authDomain: "matriz-intranet.firebaseapp.com",
  projectId: "matriz-intranet",
  storageBucket: "matriz-intranet.firebasestorage.app",
  messagingSenderId: "454436525624",
  appId: "1:454436525624:web:037a178feb09de3f0138cd",
  measurementId: "G-9P4Y9XWG7X"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
