/*NOT PRESENTLY RUNNING
creates a web socket client to talk to main server
*/

//let WebSocketServer = require('ws').Server;
let WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8081, function() {
    console.log((new Date()) + ' Server is listening on port 8081');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            recMessage(message.utf8Data);
        }
        /*else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }*/
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
/*let SERVER_PORT = 8081;               // port number for the webSocket server
let wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
let connections = new Array;          // list of connections to the server

wss.on('connection', handleConnection);
 
wss.on('Hello server', ()=>{
  console.log("hello!");
});

function handleConnection(client) {
  console.log("New Connection:"); // you have a new client

  connections.push(client); // add this client to the connections array
  client.send("connection made");

  client.on('message', recMessage); // when a client sends a message,
 
  client.on('close', function() { // when a client closes its connection
    console.log("connection closed"); // print it out
    var position = connections.indexOf(client); // get the client's position in the array
    connections.splice(position, 1); // and delete it from the array
  });
  
}*/

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