const wppconnect = require('@wppconnect-team/wppconnect');


let http = require('http'),
    port = process.env.PORT || process.argv[2] || 8080;


var userStages = [];


let server = http.createServer(function (req, res) {

    wppconnect.create()
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


