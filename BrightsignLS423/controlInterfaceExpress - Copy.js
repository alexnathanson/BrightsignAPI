
let express    =    require('express');
let app        =    express();
let bodyParser     =         require("body-parser");

let ipBool = false;

let v = {volume: BS.getConfigValue('volume')};
let f = {file: BS.currentFile};
let s = {screen: true};
let i = {id: BS.deviceInfo.deviceUniqueId};
let aV = {api: BS.api};
let d = {duration:BS.duration};
let b = {bytes: BS.localFileBytes};
let tc = {timecode: BS.timecode};
let vO = {vidOutput: {output:BS.vResolution, mode:BS.configDict.video_output_mode}};


//console.log("current file: " + currentFile);
app.use(express.static('/storage/sd/controlInterface'));

//for serving the GUI web interface
app.use('/css', express.static(__dirname + '/controlInterface/css'));
app.use('/js', express.static(__dirname + '/controlInterface/js'));
app.use('/images', express.static(__dirname + '/controlInterface/images'));

let server     =    app.listen(8000,function(){
    console.log("We have started our API interface on port 8000");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/volume',function(req,res){

  v = {volume: BS.getConfigValue('volume')};
  res.send(v);
});

app.get('/file',function(req,res){

  f['file'] = BS.localFileList;
  res.send(f);
});

app.get('/screen',function(req,res){

  BS.asyncScreenShot();
  res.send(s);
});

app.get('/id', function (req, res){
  res.send(i);
});

app.get('/api', function (req, res){
  res.send(aV);
});

app.get('/duration', function (req,res){
  BS.dgramSend("duration")
  setTimeout(()=>{
    d = {duration: BS.duration};
    res.send(d);
  },500);
});

app.get('/bytes', function (req,res){
  b = {bytes: BS.localFileBytes};
  res.send(b);
});

app.get('/timecode', function (req,res){
  BS.getTimecode();

  setTimeout(()=>{
    tc = {timecode: BS.timecode};
    res.send(tc);
  },500);
});

app.get('/vidOutput', function (req, res){
  vO = {vidOutput: BS.vResolution};
  res.send(vO);
});

app.post('/command',function(req,res){

  if(Object.keys(req.body)[0] == "volume"){
    setVolume(req.body.volume);
  } else if (Object.keys(req.body)[0] == "comm"){
    recCommand(req.body.comm);
  } else if (Object.keys(req.body)[0] == "playback"){
    controlPlayback(req.body.playback);
  } else if (Object.keys(req.body)[0] == "file"){
    BS.playFile(req.body.file);
  } else if (Object.keys(req.body)[0] == "queue"){
    console.log("queue received");
    BS.createQueue([req.body.queue,req.body.file]);
  } else if (Object.keys(req.body)[0] == "triggerSync"){
    console.log("trigger received");
    console.log("req.body");
    BS.sendSync(req.body.triggerSync);
  } else if (Object.keys(req.body)[0] == "global"){
    globalCommand(req.body.global);
  } else if (Object.keys(req.body)[0] == "mute"){
    //globalCommand(req.body.mute);
    if (req.body.mute == 1){
      BS.setVolume(0);
    } else {
      BS.setVolume(BS.getConfigValue('volume'));
    }
  } /*else if (Object.keys(req.body)[0] == "schedule"){
    scheduler(req.body.schedule);
  }*/else {
    console.log("else");
    console.log(req.body);
  }

  res.send();//removed response tex

  console.log(req.body);

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
      BS.setConfigValue('displayIP','false');//update config file
    } else if (ipBool == true){
      BS.showIP();
      BS.setConfigValue('displayIP','true');//update config file
    }
    ipBool = !ipBool;
  }
}

//end point for commands sent to all connected devices
//global commands like IP do not get saved to config file
function globalCommand(message){
  if(message == 'ip'){
    BS.showIP();
    console.log('show IP');
    let gIP = setInterval(()=>{
      clearInterval(gIP);
      if(ipBool == false){
        BS.hideIP();
      }
      console.log('clear IP');
    },30000);
  } /*else if (message == 'mute'){
    BS.setVolume(0);
  } else if (message == 'unmute'){
    BS.setVolume(BS.getConfigValue('volume'));
  }*/
}