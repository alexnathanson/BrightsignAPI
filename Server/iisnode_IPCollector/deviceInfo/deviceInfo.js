//console logs available at localhost/node/deviceInfo/iisnode/

//mediaContentRoot is the directory where all the folders for each device are located
//this string must end with a "/"
let mediaContentRoot = '/inetpub/wwwroot/';
/*let mediaContentRoot = 'D:/BrightsignAPI/Server/'
*/
//media subdirectory is the name for the subdirectory for the actual files, if no subdirectory in use set it as an empty string
let mediaSubDirectory = '/media/';

let express = require('express');
const fs = require('fs');
let bodyParser = require("body-parser");

//const router = express.Router();

const http = require('http')

let app = express.createServer();
//let app = express
//app.createServer();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//app.use("/", router);

let fileName = 'deviceInfo.json';
let netInfo;

//return the directory
app.get('/node/media/files', function (req, res){
    
  let devDir = req.query.dev;

  let dirPath = mediaContentRoot + devDir + mediaSubDirectory;

  //console.log(dirPath);

  try {
    if (fs.existsSync(dirPath)) {
      console.log("Directory exists.")
      fs.readdir(dirPath, (err, files) => {
          /*console.log(files);
          console.log(typeof files);*/
          res.send(files);
      });
    } else {
      console.log("Directory does not exist.");
      res.end("Directory does not exist.");
    }
  } catch(e) {
    console.log("An error occurred.");
    res.end("An error occurred.");
  }

});

//get the file size from the server
app.get('/node/media/fileSize', function(req,res){

  let devDir = req.query.dev;
  let fileN = req.query.file;

  //console.log(req.query);

  let filePath = mediaContentRoot + devDir + mediaSubDirectory + fileN;

  try {
    if (fs.existsSync(filePath)) {
      console.log('file exists');
      let stats = fs.statSync(filePath);
      let fileSizeInBytes = stats.size;
      console.log(fileSizeInBytes);
      res.send({"bytes":fileSizeInBytes});
    } else {
      res.send({"response":"File does not exist"});
    }
  } catch(err) {
    console.error(err)
    res.send(err);
  }  
});

//stream file to client
// src https://dev.to/itayp1/javascript-working-with-stream-and-large-files-2c8k
// src https://nodejs.org/en/knowledge/advanced/streams/how-to-use-fs-create-read-stream/

app.get('/node/media/stream', function(req,res){
  let devDir = req.query.dev;
  let fileN = req.query.file;

/*  console.log(res.headers);
*/
  let filePath = mediaContentRoot + devDir + mediaSubDirectory + fileN;

  try {
    fs.stat(filePath, function(error, stat){

   /* }
    if (fs.existsSync(filePath)) {*/
      console.log('file exists');

     /* res.set('Content-Length', stat.size);
      res.set('Access-Control-Expose-Headers', 'Content-Length');
*/    console.log(typeof stat.size.toString());
      // Setting the response 
      res.header('Content-Length', stat.size); 
      //res.writeHead();
      //res.set('Access-Control-Expose-Headers', 'Content-Length');

      console.log(res.headers);

      // This line opens the file as a readable stream
      let readStream = fs.createReadStream(filePath);

      // This will wait until we know the readable stream is actually valid before piping
      readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readStream.pipe(res);
      });

      // This catches any errors that happen while creating the readable stream (usually invalid names)
      readStream.on('error', function(err) {
        res.end(err);
      });
    /*} else {
      res.send({"response":"File does not exist"});*/
    });
  } catch(err) {
    console.error(err)
    res.send(err);
  } 

});

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

//use this on iis
//app.listen(process.env.PORT);

//use this on local test environment
let port = process.env.PORT;

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

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
  });
}