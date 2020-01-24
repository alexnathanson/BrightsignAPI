
let express    =    require('express');
let app        =    express();
let bodyParser     =         require("body-parser");

let ipBool = false;

let v = {volume: getValue('volume')};
let f = {file: currentFile};
let s = {screen: true};

console.log("current file: " + currentFile);
app.use(express.static('/storage/sd/controlInterface'));

//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/controlInterface/css'));
app.use('/js', express.static(__dirname + '/controlInterface/js'));
app.use('/images', express.static(__dirname + '/controlInterface/images'));

let server     =    app.listen(8000,function(){
    console.log("We have started our server on port 8000");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/volume',function(req,res){

  v = {volume: getValue('volume')};
  res.send(v);
});

app.get('/file',function(req,res){

  f['file'] = localFileList;
  res.send(f);
});

app.get('/screen',function(req,res){

  BS.asyncScreenShot();
  res.send(s);
});

app.post('/command',function(req,res){
  console.log(req.body);

  if(Object.keys(req.body)[0] == "volume"){
    setVolume(req.body.volume);
  } else if (Object.keys(req.body)[0] == "comm"){
    recCommand(req.body.comm);
  } else if (Object.keys(req.body)[0] == "playback"){
    controlPlayback(req.body.playback);
  } else if (Object.keys(req.body)[0] == "file"){
    BS.playFile(req.body.file);
  }
});

function controlPlayback(action){

  console.log(action);
  if(action == "pause"){
    BS.playback('pause');
  } else if (action == "play"){
    BS.playback('play');
  }else if (action == "resume"){
    //recCommand(req.body.comm);
    BS.playback('resume');
  }
}

function recCommand(message){
  console.log("received command!");

  if (message == "reboot"){
    BS.reboot();
  } else if (message == "ip"){
    if(ipBool == false){
      BS.hideIP();
      configFile.setValue('displayIP','false');//update config file
    } else if (ipBool == true){
      BS.showIP();
      configFile.setValue('displayIP','true');//update config file
    }
    ipBool = !ipBool;
  }
}