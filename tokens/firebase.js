const firebaseadmin = require('firebase-admin');

const firebaseServiceAccount = require('../robowhats-a9c82-firebase-adminsdk-cwr9k-634467143f.json');
firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(firebaseServiceAccount)
});
const db = firebaseadmin.firestore();

exports.queryUserByPhone = async function (phone) {
    var userdata = null;
    try {
        const queryRef = await db.collection('usuarios')
            .where('whatsapp', '==', phone)
            .get();
        if (!queryRef.empty) {
            queryRef.forEach((user) => {
                userdata = user.data();
                userdata['id'] = user.id;
            });
        }
    } catch (_error) {
        console.log(_error);
    }
    return userdata;
}

exports.save = async function (user) {
    user['date'] = firebaseadmin.firestore.Timestamp.fromDate(new Date());
    let newRegister = await db.collection('usuarios').add(user);
    user['id'] = newRegister.id;
    return user;
}

exports.update = async function (userdata) {
    try {
        const userRegister = await db.collection('usuarios').doc(userdata['id']).set(userdata);
        return userRegister;
    } catch (_error) {
        console.log(_error);
    }
}

