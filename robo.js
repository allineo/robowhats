const wppconnect = require('@wppconnect-team/wppconnect');
const firebaseadmin = require('firebase-admin');


const firebaseServiceAccount = require('./robowhats-a9c82-firebase-adminsdk-cwr9k-634467143f.json');
firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(firebaseServiceAccount)
});
const db = firebaseadmin.firestore();

var userStages = [];

wppconnect.create({ 
    session: 'session', //Pass the name of the client you want to start the bot
    catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
      console.log('Number of attempts to read the qrcode: ', attempts);
      console.log('Terminal qrcode: ', asciiQR);
      console.log('base64 image string qrcode: ', base64Qrimg);
      console.log('urlCode (data-ref): ', urlCode);
    },
    statusFind: (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
    headless: true, // Headless chrome
    devtools: false, // Open devtools by default
    useChrome: true, // If false will use Chromium instance
    debug: false, // Opens a debug session
    logQR: true, // Logs QR automatically in terminal
    browserWS: '', // If u want to use browserWSEndpoint
    browserArgs: [''], // Parameters to be added into the chrome browser instance
    puppeteerOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
    }, // Will be passed to puppeteer.launch
    disableWelcome: false, // Option to disable the welcoming message which appears in the beginning
    updatesLog: true, // Logs info updates automatically in terminal
    autoClose: 60000, // Automatically closes the wppconnect only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
    tokenStore: 'file', // Define how work with tokens, that can be a custom interface
    folderNameToken: './tokens', //folder name when saving tokens
 })
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
