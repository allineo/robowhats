
// https://github.com/pedroslopez/whatsapp-web.js


const { Client } = require('whatsapp-web.js');
//const qrCode = require('qrcode-terminal');
const fs = require('fs');


const SESSION_FILE_PATH = './session.json';

let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}


//const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });

//const client = new Client();
/*{
   // session: 'whatswebtest',
    qrTimeoutMs: 0
    //puppeteer: { headless: false }
});*/

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    qrTimeoutMs: 0,
    session: sessionData
});

client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on('qr', (qr) => {
    // qrCode.generate(qr, {small: true});
    console.log('', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body.toLowerCase() == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();



