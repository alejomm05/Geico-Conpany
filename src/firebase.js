// src/firebase.js

const admin = require('firebase-admin');
const serviceAccount = require('./../geico-conpany-firebase-adminsdk-fbsvc-3291cdb1e2.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://geico-conpany.firebasestorage.app' 
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  db,
  bucket
};