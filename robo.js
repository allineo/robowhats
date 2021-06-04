const wppconnect = require('@wppconnect-team/wppconnect');
const firebaseadmin = require('firebase-admin');


const firebaseServiceAccount = require('./robowhats-a9c82-firebase-adminsdk-cwr9k-634467143f.json');
firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(firebaseServiceAccount)
});
const db = firebaseadmin.firestore();

var userStages = [];

wppconnect.create()
    .then((client) => start(client))
    .catch((error) => console.log(error));


function start(client) {
    client.onMessage((message) => {
        console.log('*Usuário atual* from:' + message.from); 
        console.log('Mensagem digitada pelo usuário: ' + message.body);
        queryUserByPhone(client, message);
    });
}

async function queryUserByPhone(client, message) {
    let phone = (message.from).replace(/[^\d]+/g, '');
    let userid = null, userdata = null;
    const queryRef = await db.collection('usuarios')
        .where('whatsapp', '==', phone)
        .get();
    if (queryRef.empty) {
        saveUser(client, message);
    } else {
        queryRef.forEach((user) => {
            userid = user.id;
            userdata = user.data();
            console.log('Usuário corrente: ' + userid);
            stages(client, message, userid, userdata);
        });
    }
}


//  Stages = ola  >>  nome  >>  cpf  >>  fim
async function stages(client, message, userid, userdata) {
    if (userStages[message.from] == undefined) {
        sendWppMessage(client, message.from, 'Bem vindo ao Robô de Whatsapp do AppBasicão!');
    }
    if (userdata['nome'] == undefined) {
        if (userStages[message.from] == undefined) {
            sendWppMessage(client, message.from, 'Digite seu *NOME*:');
            userStages[message.from] = 'nome';
        } else {
            userdata['nome'] = message.body;
            updateUser(userid, userdata);
            sendWppMessage(client, message.from, 'Obrigada, ' + message.body);
            sendWppMessage(client, message.from, 'Digite seu *CPF*:');
            userStages[message.from] = 'cpf';
        }

    } else if (userdata['cpf'] == undefined) {
        if (userStages[message.from] == undefined) {
            sendWppMessage(client, message.from, 'Digite seu *CPF*:');
            userStages[message.from] = 'cpf';
        } else {
            userdata['cpf'] = (message.body).replace(/[^\d]+/g, '');
            updateUser(userid, userdata);
            sendWppMessage(client, message.from, 'Obrigada por informar seu CPF: ' + message.body);
            sendWppMessage(client, message.from, 'Fim');
            userStages[message.from] = 'fim';
        }

    } else {
        if (userStages[message.from] == undefined) {
            userStages[message.from] = 'fim';
        }
        sendWppMessage(client, message.from, 'Fim');
    }
}


function sendWppMessage(client, sendTo, text) {
    client.sendText(sendTo, text)
        .then((result) => {
            // console.log('SUCESSO: ', result); 
        })
        .catch((erro) => {
            console.error('ERRO: ', erro);
        });
}

async function saveUser(client, message) {
    let pushname = '';
    if (message['sender']['pushname'] != undefined) {
        pushname = message['sender']['pushname'];
    }
    let user = {
        'date': firebaseadmin.firestore.Timestamp.fromDate(new Date()),
        'pushname': pushname,
        'whatsapp': (message.from).replace(/[^\d]+/g, '')
    }
    const newUserRegister = await db.collection('usuarios').add(user);
    console.log('Novo usuário cadastrado: ' + newUserRegister.id);
    stages(client, message, newUserRegister.id, user);
    return newUserRegister.id;
}

async function updateUser(userid, userdata) {
    const userRegister = await db.collection('usuarios').doc(userid).set(userdata);
    return userRegister;
}
