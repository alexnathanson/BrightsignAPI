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
  console.log('global!!!');
  console.log(req.body);

  if(Object.keys(req.body)[0] == "ip"){
    sendPost('global','ip',req.body.ip);
  } else if (Object.keys(req.body)[0] == "reboot"){
    sendPost('comm','reboot',req.body.reboot);
  } else if (Object.keys(req.body)[0] == "mute"){
    sendPost('mute','true',req.body.mute);
  } else if (Object.keys(req.body)[0] == "unmute"){
    sendPost('mute','false',req.body.unmute);
  } else if (Object.keys(req.body)[0] == "hide"){

  } else if (Object.keys(req.body)[0] == "show"){

  } else if (Object.keys(req.body)[0] == "ipToggle"){
    sendPost('comm','ip',req.body.ipToggle);
  } /*else if (Object.keys(req.body)[0] == "sync"){

    sendGet(req.body.sync + ":8000/file",(res)=>{
      sendPost('triggerSync', ???, req.body.sync);
    }, )
  }*/
  
  res.end("global command " + Object.keys(req.body)[0] +" sent");
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

  //readFile();

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
  console.log(netInfo);

  let newData = JSON.stringify(netInfo, null, 2);
  /*fs.writeFile(fileName, newData, (err) => {
      if (err) throw err;
      console.log('Data written to file');
  });*/

  writeFile(newData);
}


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

function sendGet(dst, callback){

  http.get(dst, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data));
      callback(data);
    });

    resp.on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
}