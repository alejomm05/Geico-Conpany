// src/firebase.js
const admin = require('firebase-admin');

// Debug: Verifica variables
console.log("Firebase Config:", {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Nuevo
});

const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "geico-conpany.appspot.com" // Ejemplo
};

admin.initializeApp(firebaseConfig);

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Prueba de conexión inmediata
db.collection('test').doc('test').get()
  .then(() => console.log("✅ Conexión a Firestore exitosa"))
  .catch(e => console.error("❌ Error en Firestore:", e));

module.exports = { admin, db, bucket };