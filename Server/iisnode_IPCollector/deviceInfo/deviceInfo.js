//console logs available at localhost/node/deviceInfo/iisnode/

let express = require('express');
const fs = require('fs');
let bodyParser = require("body-parser");

const http = require('http')

let app = express.createServer();
//let app = express
//app.createServer();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


let fileName = 'deviceInfo.json';
let netInfo;

app.post('/node/deviceInfo/checkin/ip',function(req,res){
  console.log(req.body);
  findReplace(req.body);
  res.end("checked in");
});

//added 1/29
app.post('/node/deviceInfo/checkin/global',function(req,res){
  console.log('global!');
  console.log(req.body);
  sendPost('global','ip',req.body.ip);
  res.end("global command sent");
});

app.listen(process.env.PORT);

readFile();

function readFile(){
  fs.readFile(fileName, (err, data) => {
      if (err) throw err;
      netInfo = JSON.parse(data);
      //console.log(netInfo[0]);
  });
}

function writeFile(newStuff){
  fs.writeFile(fileName, newStuff, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}

//check the existing file and up entry or add new entry
function findReplace(data){

  readFile();

  let exists = false;

  for(let n=0; n<netInfo.length; n++){
    if(Object.keys(netInfo[n])[0] == Object.keys(data)[0]){
      console.log("found existing entry");
      netInfo[n]=data;
      exists = true;
      break;
    }
  }
  if (!exists) {
    //make new entry
    console.log("new entry");
    netInfo.push(data);
  }
  //console.log(netInfo);

  let newData = JSON.stringify(netInfo, null, 2);
  /*fs.writeFile(fileName, newData, (err) => {
      if (err) throw err;
      console.log('Data written to file');
  });*/

  writeFile(newData);
}

/* added 1/29 */

//send the message
function sendPost(aType, aMess, anIp){

  let data = JSON.stringify({
    [aType]: aMess
  })

  let options = {
    hostname: anIp,
    port: 8000,
    path: '/command',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      //process.stdout.write(d)
      process.env.PORT
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()

}