const wppconnect = require('@wppconnect-team/wppconnect');


var userStages = [];


wppconnect.create()
    .then((client) => start(client))
    .catch((error) => console.log(error));



function start(client) {
    client.onMessage((message) => {
        console.log('Mensagem digitada pelo usuário: ' + message.body);
        stages(client, message);
    });
}

//  Stages = Olá  >>  Nome  >>  CPF  >> Fim
function stages(client, message) {
    stage = userStages[message.from];
    switch (stage) {
        case 'Nome':
            const nome = message.body;
            sendWppMessage(client, message.from, 'Obrigada, ' + nome);
            sendWppMessage(client, message.from, 'Digite seu *CPF*:');
            userStages[message.from] = 'CPF';
            break;
        case 'CPF':
            const cpf = message.body;
            sendWppMessage(client, message.from, 'Obrigada por informar seu CPF: ' + cpf);
            sendWppMessage(client, message.from, 'Fim');
            userStages[message.from] = 'Fim';
            break;
        case 'Fim':
            sendWppMessage(client, message.from, 'Fim');
            break;
        default: // Olá 
            console.log('*Usuário atual* from:' + message.from + ' pushname:' + message.sender.pushname);
            sendWppMessage(client, message.from, 'Bem vindo ao Robô de Whatsapp do AppBasicão!');
            sendWppMessage(client, message.from, 'Digite seu *NOME*:');
            userStages[message.from] = 'Nome';
    }
}


function sendWppMessage(client, sendTo, text) {
    client
        .sendText(sendTo, text)
        .then((result) => {
            // console.log('SUCESSO: ', result); 
        })
        .catch((erro) => {
            console.error('ERRO: ', erro);
        });
}

