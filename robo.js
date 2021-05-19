const wppconnect = require('@wppconnect-team/wppconnect');


let http = require('http'),
    port = process.env.PORT || process.argv[2] || 8080;


var userStages = [];


let server = http.createServer(function (req, res) {

    const myTokenStore = new wppconnect.tokenStore.FileTokenStore({
        decodeFunction: JSON.parse,
        encodeFunction: JSON.stringify,
        encoding: 'utf8',
        fileExtension: '.json',
        path: './tokens',
    });

    wppconnect.create({
        session: 'test',
        tokenStore: myTokenStore,
        catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {

        },
        statusFind: (statusSession, session) => {
            console.log('Status Session: ', statusSession, '\n');
            console.log('Session name: ', session, '\n');
        },
        folderNameToken: 'tokens',
        headless: true,
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: true,
        browserArgs: [
            '--log-level=3',
            '--no-default-browser-check',
            '--disable-site-isolation-trials',
            '--no-experiments',
            '--ignore-gpu-blacklist',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-default-apps',
            '--enable-features=NetworkService',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-webgl',
            '--disable-threaded-animation',
            '--disable-threaded-scrolling',
            '--disable-in-process-stack-traces',
            '--disable-histogram-customizer',
            '--disable-gl-extensions',
            '--disable-composited-antialiasing',
            '--disable-canvas-aa',
            '--disable-3d-apis',
            '--disable-accelerated-2d-canvas',
            '--disable-accelerated-jpeg-decoding',
            '--disable-accelerated-mjpeg-decode',
            '--disable-app-list-dismiss-on-blur',
            '--disable-accelerated-video-decode',
        ],
        disableSpins: true,
        disableWelcome: true,
        updatesLog: true,
        autoClose: 60000,
        waitForLogin: true,
        createPathFileToken: true,
    })
        .then((client) => start(client))
        .catch((error) => console.log(error));

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello robowahts on Heroku!', 'utf-8');
    res.end();
});

server.listen(port, function () {
    console.log('app up on port: ' + port);
});



function start(client) {
    client.onMessage((message) => {
        console.log('Mensagem digitada pelo usuário: ' + message.body);
        //stages(client, message);
    });
}


