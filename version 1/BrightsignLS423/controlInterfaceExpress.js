
let express    =    require('express');
let app        =    express();
let bodyParser     =         require("body-parser");

let ipBool = false;

let resNeeded = true;

let v = {volume: BS.getConfigValue('volume')};
let f = {file: BS.currentFile};
let s = {screen: true};
let i = {id: BS.deviceInfo.deviceUniqueId};
let aV = {api: BS.api};
let d = {duration:BS.duration};
let b = {bytes: BS.localFileBytes};
let tc = {timecode: BS.timecode};
let vO = {};
let sO = {};
let sC = {};


//console.log("current file: " + currentFile);
app.use(express.static('/storage/sd/controlInterface'));

//for serving the GUI web interface
app.use('/css', express.static(__dirname + '/controlInterface/css'));
app.use('/js', express.static(__dirname + '/controlInterface/js'));
app.use('/images', express.static(__dirname + '/controlInterface/images'));

let server     =    app.listen(8000,function(){
    console.log("We have started our API interface on port 8000");
});

/*app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());*/

let jsonParser = bodyParser.json()
/*let urlencodedParser = bodyParser.urlencoded({ extended: false })
*/
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
  //BS.dgramSend("duration")
  BS.getDuration()
  setTimeout(()=>{
    d = {duration: BS.duration};
    res.send(d);
  },500);
});

app.get('/bytes', function (req,res){
  b = {bytes: BS.localFileBytes};
  res.send(b);
});

app.get('/config', function (req,res){
  c = {config: BS.configDict};
  res.send(c);
});

//what is this doing? remove it?
/*app.get('/timecode', function (req,res){
  BS.getTimecode();

  setTimeout(()=>{
    tc = {timecode: BS.timecode};
    res.send(tc);
  },500);
});*/

app.get('/vidInfo', function (req, res){
  //vO = {vidOutput: BS.vResolution};
  vO = {vidInfo: {output:BS.vOutput,
                  mode:BS.configDict.video_output_mode,
                  activeMode:BS.vMode,
                  bestMode: BS.bestMode}};

  res.send(vO);
});

app.get('/syncInfo', function (req, res){

  if(BS.configDict.playback_mode == undefined){
    BS.configDict.playback_mode = "normal"
  }

  if(BS.configDict.sync_group == undefined){
    BS.configDict.sync_group = ""
  }

  if(BS.configDict.leader_ip == undefined){
    BS.configDict.leader_ip = ""
  }
  
  sO = {syncInfo: {mode:BS.configDict.playback_mode,
                  group:BS.configDict.sync_group,
                  leader:BS.configDict.leader_ip}};

  res.send(sO);
});

//this should probably be turned in to a post at some point...
app.get('/syncCommand', function (req, res){
  console.log('syncCommand received');

  if(BS.configDict.playback_mode == "leader"){
    BS.syncSeek();
    
    sC = {sync: 'seek'};
    res.send(sC);
  }

});

app.post('/command',jsonParser, function(req,res){


  if(Object.keys(req.body)[0] == "volume"){
    BS.setConfigValue('volume',req.body.volume)//store the new volume
    BS.setVolume(req.body.volume);
  } else if (Object.keys(req.body)[0] == "comm"){
    recCommand(req.body.comm);
  } else if (Object.keys(req.body)[0] == "playback"){
    controlPlayback(req.body.playback);
  } else if (Object.keys(req.body)[0] == "file"){
    BS.playFile(req.body.file);
  } else if (Object.keys(req.body)[0] == "queue"){
    console.log("queue received");
    BS.createQueue([req.body.queue,req.body.file]);
  }/* else if (Object.keys(req.body)[0] == "triggerSync"){
    console.log("trigger received");
    console.log("req.body");
    BS.sendSync(req.body.triggerSync);
  }*/ else if (Object.keys(req.body)[0] == "global"){
    globalCommand(req.body.global);
  } else if (Object.keys(req.body)[0] == "mute"){
    //globalCommand(req.body.mute);
    if (req.body.mute == 1){
      BS.setVolume(0);
    } else {
      BS.setVolume(BS.getConfigValue('volume'));
    }
  } else if(Object.keys(req.body)[0] == "location"){
    /*setLocation(req.body.location);*/
  } else if(Object.keys(req.body)[0] == "syncContent"){
    //console.log(req.body.syncContent);
    BS.setConfigValue('media_sync',req.body.syncContent)
    res.send('sync content: ' + req.body.syncContent);
    resNeeded = false;
    //restart in 3 seconds to make sure the new settings where written to the file
    setTimeout(function(){BS.reboot()},3000)
  } else if(Object.keys(req.body)[0] == "seek"){
    BS.seekFile(req.body.seek)
    res.send('seeking!');
    resNeeded = false;
  } else {
    console.log("else");
    //console.log(req.body);
  }

  if(resNeeded){
    res.send('command received');
  }

  resNeeded = true;

  console.log(req.body);

});

app.post('/sync', jsonParser ,function(req,res){

  //sync settings
  if(Object.keys(req.body).includes("role")){

    BS.setConfigValue('playback_mode',req.body['role'])
    //turn off sync
    if (req.body['role'] == "normal"){

      console.log('turning off sync')

    } else if (req.body['role'] == "follower"){

      console.log('follow sync')

    } else if (req.body['role'] == "leader"){

      console.log('leading sync')

    }

    if(Object.keys(req.body).includes("group")){

        console.log('has sync group')

        //let list = req.body['group'].split(',').filter(cleanAndFilterIPs)

        //BS.syncGroup = req.body['group'];

        BS.setConfigValue('sync_group',req.body['group'])

        console.log("sync group updated:")
        console.log(req.body['group'])
      }

    if(Object.keys(req.body).includes("leader")){
      BS.setConfigValue('leader_ip',req.body['leader'])
    }

    res.send("role: " + req.body['role'] + " in group " + req.body['group'])

    //restart in 3 seconds to make sure the new settings where written to the file
    setTimeout(function(){BS.reboot()},3000)

  }

  //sync commands

    //for syncing to a specific timecode - not tested
/*  if (Object.keys(req.body).includes("seek") && BS.configDict.role = 'follower'){
    res.end(BS.myIP + " received seek!");
    console.log("seek received: " + req.body['seek']);
    BS.seekFile(req.body['seek'])
  }*/
});

//removes leading & trailing white space, removes missing/empty values
function cleanAndFilterIPs(anIP){
  anIP = anIP.trim()
  return anIP != '' && anIP != null && anIP != undefined;
}

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