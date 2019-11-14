
// Load the http module to create an http server.
let http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  var device_info = new BSDeviceInfo();
  response.writeHead(200, {"Content-Type": "text/html"});
  response.end(serverResponse);
  var ip = request.connection.remoteAddress;
  //document.getElementById("Ip").innerHTML+="Server responded to: "+ ip + "<br>";
  //console.log("Server responded to request from " + ip);
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Display it on brightsign browser
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
var message = "Server running at: " + addresses[0] + ":8000<br>";
//document.getElementById("Ip").innerHTML+= message;

// Print message on console
console.log(message);
console.log(BS);

let serverResponse = "\"Device Information:\n\" + device_info.model + \"\n\" + device_info.bootVersion + \"\n\"+\"<br><button type=\"button\" onclick=\"passThrough(0,setVolume)">Mute</button>";       

function passThrough(args, aCallback){
  aCallback(args);
}