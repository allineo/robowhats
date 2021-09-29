const { Client } = require('whatsapp-web.js');
const qrCode = require('qrcode-terminal');

//const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });

const client = new Client();
/*{
   // session: 'whatswebtest',
    qrTimeoutMs: 0
    //puppeteer: { headless: false }
});*/

client.on('qr', (qr) => {
   // qrCode.generate(qr, {small: true});
    console.log('', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();
