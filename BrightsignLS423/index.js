//check contents of the remote directory and compares it to local storage
//deletes old files and downloads new files

let version = '0.0.2';

'use strict';

//turn on and off console logging
let ilog = true;

let BS = new BS_API();

//let readyToDownload = false;
let DP = new MediaServer();

// Uses node.js fs module to save files into sd card.
let fs = require('fs');

//this must be run first to initialize the API with the data from the config file
BS.loadConfig(configured);

//spin up UDP receiver port for media end events
BS.dgramReceive(mediaEnded);

DP.remoteServerDirectory = '/' + BS.deviceInfo.deviceUniqueId + '/media/';

let dirList; //remote directory list

let currentFile = "";

//once config file has been ingested...
function configured(){
  
  if(BS.configDict.gpio){
    BS.GPIOEvents(randomMedia);
  }

  DP.remoteServerBase = 'http://'+BS.configDict['media_server'];
  
  dirList = new HTMLDirectory(DP.remoteServerBase,DP.remoteServerDirectory);
  dirList.log=false;

  indexLog('Version: ' + version);    
  
  //get local media list
  BS.getLocalFiles((arg)=>{
        console.log(arg);

    //if there are local files, play the first file
        if(BS.localFileList.length  > 0){
          console.log('playing file 1');
          BS.playFile(BS.localFileList[0]);
        }

        if(BS.configDict.media_sync){
        //check if the download flag has been raised every 5 seconds
            DP.downloadProcess();
        } 
  })
}

function randomMedia(){
  let newFile = true;
  while (newFile){
    let randMed = Math.floor((Math.random() * dirList.list.length));
    console.log(randMed);
    if(currentFile != dirList.list[randMed]){
      BS.playFile(dirList.list[randMed]);
      newFile = false;
    }
  }
}

function setVolume(arg){
  BS.setConfigValue('volume',arg);//update config file
  BS.setVolume(arg); //set live player
}

function sceneChange(sceneNum){
  console.log('scene ' + sceneNum);
  BS.playFile(BS.localFileList[1]);
  BS.mediaEndFlag = true;
}

function mediaEnded(){
  console.log('scene 1');
  BS.playFile(BS.localFileList[0]);
}

function indexLog(arg){
    if(ilog == true){
      console.log(arg);
    }
  }