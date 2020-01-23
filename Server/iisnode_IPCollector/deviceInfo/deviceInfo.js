//console logs available at localhost/node/deviceInfo/iisnode/

let express = require('express');
const fs = require('fs');
let bodyParser = require("body-parser");

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
  res.end("checked in at");
});

app.listen(process.env.PORT);


fs.readFile(fileName, (err, data) => {
    if (err) throw err;
    netInfo = JSON.parse(data);
    //console.log(netInfo[0]);
});

//check the existing file and up entry or add new entry
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
  //console.log(netInfo);

  let newData = JSON.stringify(netInfo, null, 2);
  fs.writeFile(fileName, newData, (err) => {
      if (err) throw err;
      console.log('Data written to file');
  });
}