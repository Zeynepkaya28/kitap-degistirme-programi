const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "your-project-id.appspot.com"
});

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  db,
  auth,
  storage
}; 