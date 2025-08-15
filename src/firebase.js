// src/firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// === VALIDACIÓN DE VARIABLES DE ENTORNO ===
const requiredEnv = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET'
];

const missing = requiredEnv.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ Faltan variables de entorno:', missing);
  throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
}

// === LIMPIEZA Y FORMATEO DE LA CLAVE PRIVADA ===
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Reemplazar \\n por \n (saltos de línea reales)
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

// Asegurarse de que tiene los delimitadores
if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
  privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey;
}
if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
  privateKey = privateKey + '\n-----END PRIVATE KEY-----';
}

// === CONFIGURACIÓN DE FIREBASE ===
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey
};

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Ej: 'geico-conpany.appspot.com'
};

// === INICIALIZAR FIREBASE ===
if (admin.apps.length === 0) {
  admin.initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado correctamente');
} else {
  console.log('🔁 Firebase ya estaba inicializado');
}

// === REFERENCIAS ===
const db = admin.firestore();
const bucket = admin.storage().bucket();

// === PRUEBA DE CONEXIÓN OPCIONAL (puede causar errores si se llama muchas veces)
// Comentado para evitar problemas en inicialización
// db.listCollections().then(() => console.log('✅ Conexión a Firestore exitosa')).catch(err => console.error('❌ Error conexión Firestore:', err));

module.exports = { admin,db, bucket };