
'use strict';

//turn on and off console logging
let ilog = true;

let BS = new BS_API();


//run first to initialize and configure the API
BS.loadConfig(configured);

//spin up UDP receiver port for media end events
BS.dgramReceive(mediaEnded);

BS.syncGroup = [/*"172.16.0.104","172.16.0.105","172.16.0.106","172.16.0.107",*/"172.16.0.108","172.16.0.109","172.16.0.110"];

let dirList; //remote directory list


BS.eventEmitter.on('queue',()=>{
      scene2();
});

//once config file has been ingested...
function configured(){
  
  if(BS.configDict.gpio){
    BS.GPIOEvents(randomMedia);
  }

  dirList = new HTMLDirectory(BS.remoteServerBase,BS.remoteServerDirectory);
  BS.getRemList = (arg)=>{dirList.getDir(arg)};

  dirList.log=false;

  indexLog('Version: ' + BS.api);    

  if(BS.localFileList.length  > 0){
    console.log('playing file 1');
    BS.playFile(BS.localFileList[0]);
  }

  if(BS.configDict.media_sync){
  //check if the download flag has been raised every 10 seconds
      BS.downloadProcess();
  } 
}

function randomMedia(){
  let newFile = true;
  while (newFile){
    let randMed = Math.floor((Math.random() * BS.localFileList.length));
    console.log(randMed);
    if(BS.currentFile != BS.localFileList[randMed]){
      BS.playFile(BS.localFileList[randMed]);
      newFile = false;
    }
  }
}

function setVolume(arg){
  BS.setConfigValue('volume',arg);//update config file
  BS.setVolume(arg); //set live player
}

function scene2(){
  BS.maskIt(true);
  BS.playFile(BS.localFileList[1]);
  BS.playback("pause");
  BS.mediaEndFlag = true;
  
  console.log('scene 2');
}

function mediaEnded(){
  BS.maskIt(false);
  //BS.playFile(BS.localFileList[0]);
  BS.playback("resume");
  console.log('scene 1');
}

function indexLog(arg){
  if(ilog == true){
    console.log(arg);
  }
}

function cronIt(){
  BS.cron.schedule('*/5 * * * *', () => {
    console.log('running a task every 5 minutes');
    scene2();
  });
}
