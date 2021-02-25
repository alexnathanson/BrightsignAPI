
'use strict';

//turn on and off console logging
let ilog = true;

let BS = new BS_API();

//run first to initialize and configure the API
BS.loadConfig(configured);

//spin up UDP receiver port for media end events
BS.dgramReceive(mediaEnded);

//list of IPs to sync with
//BS.syncGroup = [];

let dirList; //remote directory list


BS.eventEmitter.on('queue',()=>{
      scene2();
});

let syncCounter = 1;
BS.cronString = '*/10 * * * *'; //initialize cron job every 10 minutes
BS.cronCallback = incrementSync;

//once config file has been ingested...
function configured(){
  
  if(BS.configDict.gpio){
    BS.GPIOEvents(randomMedia);
  }

  dirList = new HTMLDirectory(BS.remoteServerBase,BS.remoteServerDirectory);
  BS.getRemList = (arg)=>{dirList.getDir(arg)};
  console.log(getRemList);//added 2/25
  BS.postHTTP(BS.remoteServerBase + "/node/deviceInfo/checkin/fileList", BS.remoteServerDirectory);//added 2/25

  dirList.log=false;

  indexLog('Version: ' + BS.api);    

  if(BS.localFileList.length  > 0){
    console.log('playing file 1');
    BS.playFile(BS.localFileList[0]);

    BS.getAllFileSizes();

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
  BS.getTimecode();

  //setTimeout(()=>{
    //this might need to be a callback
    BS.mediaEndFlag = true;
    BS.playFile(BS.queueFile);
    console.log('scene 2');
  //},5000);
}

function mediaEnded(){
  BS.preload(BS.localFileList[0],BS.timecode);
  console.log('scene 1');
}

function indexLog(arg){
  if(ilog == true){
    console.log(arg);
  }
}

//skip the first file and increment the rest
function incrementSync(){
  
  if(BS.localFileList.length > 1){
     if(syncCounter >= BS.localFileList.length){
      syncCounter=1;
    }
    BS.sendSync(BS.localFileList[syncCounter]);
    syncCounter++;
  }
}