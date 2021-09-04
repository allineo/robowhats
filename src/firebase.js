const firebaseadmin = require('firebase-admin');


const firebaseServiceAccount = require('../robowhats-a9c82-firebase-adminsdk-cwr9k-634467143f.json');
firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(firebaseServiceAccount)
});
const db = firebaseadmin.firestore();


exports.save = async function (user) {
    user['date'] = firebaseadmin.firestore.Timestamp.fromDate(new Date());
    let newRegister = await db.collection('usuarios').add(user);
    user['id'] = newRegister.id;
    return user;
}