let WebSocketServer = require('ws').Server;
//let WebSocketServer = require('websocket').server;
//let http = require('http');

let express    =    require('express');
let app        =    express();

app.use(express.static('/storage/sd/controlInterface'));

//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/controlInterface/css'));
app.use('/js', express.static(__dirname + '/controlInterface/js'));
app.use('/images', express.static(__dirname + '/controlInterface/images'));

/*app.get('/',function(req,res){
    res.send(controlInterface/index.html);
});*/

let server     =    app.listen(8000,function(){
    console.log("We have started our server on port 8000");
});

/************web sockets stuff********************************/
/*let hServer = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

hServer.listen(8081, function() {
    console.log((new Date()) + ' Server is listening on port 8081');
});

wsServer = new WebSocketServer({
    httpServer: hServer,
    autoAcceptConnections: true
});

let connections = new Array;          // list of connections to the server

wsServer.on('connect', function(request) {
    //console.log(request);
    connections.push(request); // add this client to the connections array

    //let connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connections[connections.length-1].on('message', function(message) {
        console.log('Received Message: ');
        //console.log(message);
        //recMessage(message);
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            //recMessage(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        }
    });
    connections[connections.length-1].on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connections[connections.length-1].remoteAddress + ' disconnected.');
    });
});
*/

let SERVER_PORT = 8081;               // port number for the webSocket server
let wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
let connections = new Array;          // list of connections to the server

wss.on('connection', handleConnection);
 
wss.on('Hello server', ()=>{
  console.log("hello!");
});

function handleConnection(client) {
  console.log("New Connection"); // you have a new client

  connections.push(client); // add this client to the connections array
  client.send("connection made");

  client.on('message', recMessage); // when a client sends a message,
 
  client.on('close', function() { // when a client closes its connection
    console.log("connection closed"); // print it out
    let position = connections.indexOf(client); // get the client's position in the array
    connections.splice(position, 1); // and delete it from the array
  });
}

function recMessage(message){
  console.log("received message!");

  if (message == "reboot"){
    BS.reboot();
  } else if (message == "screen"){
    BS.asyncScreenShot();
  } else if (message == "ip"){
    BS.hideIP();
  }
}