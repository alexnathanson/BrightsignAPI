//this node server is used to collect IP addresses from active brightsigns on the network

//currently will not autorun

'use strict';

//WILL THIS WORK WITH MULTIPLE CONNECTIONS?

const fs = require('fs');
let express    =    require('express');
let app        =    express();
let bodyParser     =         require("body-parser");

let postPort = 8081;
let server     =    app.listen(postPort,function(){
    console.log("We have started our server on port "+ postPort);
});

let fileName = 'deviceNetworkInfo.json';
let netInfo;

fs.readFile(fileName, (err, data) => {
    if (err) throw err;
    netInfo = JSON.parse(data);
    //console.log(netInfo[0]);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',function(req,res){
  console.log(req.body);

});

app.post('/',function(req,res){
  console.log(req.body);

  findReplace(req.body);
  res.end("yes");
});


function findReplace(data){
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
  fs.writeFile(fileName, newData, (err) => {
      if (err) throw err;
      console.log('Data written to file');
  });
}