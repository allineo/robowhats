const wppconnect = require('@wppconnect-team/wppconnect');
const firebasedb = require('./firebase.js');

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
    var userdata = await firebasedb.queryUserByPhone(phone);
    if (userdata == null) {
        userdata = await saveUser(client, message);
    }
    console.log('Usuário corrente: ' + userdata['id']);
    stages(client, message, userdata);
}


//  Stages = ola  >>  nome  >>  cpf  >>  fim
async function stages(client, message, userdata) {
    if (userStages[message.from] == undefined) {
        sendWppMessage(client, message.from, 'Bem vindo ao Robô de Whatsapp do AppBasicão!');
    }
    if (userdata['nome'] == undefined) {
        if (userStages[message.from] == undefined) {
            sendWppMessage(client, message.from, 'Digite seu *NOME*:');
            userStages[message.from] = 'nome';
        } else {
            userdata['nome'] = message.body;
            firebasedb.updateUser(userdata);
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
            firebasedb.updateUser(userdata);
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

async function saveUser(message) {
    let user = {
        'pushname': (message['sender']['pushname'] != undefined) ? message['sender']['pushname'] : '',
        'whatsapp': (message.from).replace(/[^\d]+/g, '')
    }
    const newUser = firebasedb.save(user);
    return newUser;
}
