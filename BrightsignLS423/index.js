//check contents of the remote directory and compares it to local storage
//deletes old files and downloads new files

let version = '0.0.1';

'use strict';

//turn on and off console logging
let ilog = false;

let BS = new BS_API();

let readyToDownload = false;
//let localDirectory = '/storage/sd/';

let mediaTypes = ['MPG','WMV','MOV','MP4','VOB','TS','MP3','WAV'];

//an array to hold remote files that need to be downloaded
let downloadQueue = [];
let downloadIndex = 0;

// Uses node.js fs module to save files into sd card.
let fs = require('fs');

//this must be run first to initialize the API with the data from the config file
BS.loadConfig(configured);

//spin up UDP receiver port for media end events
BS.dgramReceive(mediaEnded);

let remoteServerBase;
let remoteServerDirectory = '/' + BS.deviceInfo.deviceUniqueId + '/media/';
let dirList; //remote directory list

let currentFile = "";
//the variables are used in the download process
let writer,soFar,contentLength;

function configured(){
  if(BS.localFileList.length != 0){
      BS.playFile(BS.localFileList[0]);
  }

  if(BS.configDict.gpio){
    BS.GPIOEvents(randomMedia);
  }

  remoteServerBase = 'http://'+BS.configDict['media_server'];
  //console.log(remoteServerBase);
  //get file list from remote server
//arguments: base IP, directory structure, callback
  dirList = new HTMLDirectory(remoteServerBase,remoteServerDirectory,getLocalFiles);
  dirList.log=false;

  indexLog(version);

  //check the various directories, remove old files, and download new files
  if(BS.configDict.media_sync){
      downloadProcess();
  }
}

function downloadProcess(){
  /*gets the file list from the remote server and
  call the callback to compare it to the local files*/
  dirList.getDir();

  BS.postInfo();

  //check if its ready to download every 5 seconds
  let checkDownloadState = setInterval(function(){
      if(readyToDownload == true){
        clearInterval(checkDownloadState);

        downloadIndex = 0;
        downloadIncrement();
      }
  }, 5000);
}

//increments through all the files that need to be downloaded
function downloadIncrement(){
  if(downloadIndex < downloadQueue.length){//was <= len +1
        downloadFiles(downloadQueue[downloadIndex]);
  } else {
    /*if all files have been downloaded restart the listener
    to detect remote updates*/
    downloadProcess();
  }
  downloadIndex++;
}

function downloadFiles(name){
  
  writer = fs.createWriteStream(BS.localDirectory + name, {defaultEncoding:'binary'});

  let VIDEO_URL = remoteServerBase + remoteServerDirectory + name;
  // Uses fetch instead of XMLHttpRequest to support saving fragments into file as they
  // arrive. XMLHttpRequest will cause device to run out of memory when used with
  // large video files.
  fetch(VIDEO_URL).then(function (res) {
    soFar = 0;
    contentLength = res.headers.get('Content-Length');
    // Content length might not be known, that is normal.
    if (contentLength)
      indexLog("Content length is " + contentLength);
    else
      indexLog("Content length is not known");

    return pump(res.body.getReader());
  })
  .catch(function (e) {
    indexLog(e);
  });
}

function pump(reader) {
  return reader.read().then(function (result) {
    if (result.done) {
      indexLog("All done! " + soFar + "bytes total");
      writer.end();
      
      //play a file
      BS.playFile(dirList.list[0]);

      downloadIncrement();
      return;
    }

    const chunk = result.value; // --> This is the chunked data
    writer.write(new Buffer(chunk));

    soFar += chunk.byteLength;
    // Console log takes long time, comment this out to download in full speed.
    updateProgress();
    return pump(reader);
  });
}

function updateProgress() {
  if (contentLength)
    indexLog((soFar/contentLength*100).toFixed(2) + "% is downloaded" + downloadIndex +'/'+downloadQueue.length);
  else
    indexLog(soFar + " bytes are downloaded " + downloadIndex +'/'+downloadQueue.length);
}

function getLocalFiles(){
  fs.readdir(BS.localDirectory, function (err, files) {
    //handling error
    if (err) {
        return indexLog('Unable to scan directory: ' + err);
    } else {
      //filter local files by data type before comparing directories
      BS.localFileList = filterMediaType(files);
      checkDirectory(BS.localFileList);
    }
  });
}

function filterMediaType(anArray){
  let mediaFiles = [];

  anArray.forEach(function(file){
    let uFile = file.toUpperCase();
    mediaTypes.forEach(function(type){
      if(uFile.includes(type)){
        mediaFiles.push(file);
      }
    });
  });

  return mediaFiles;
}

function checkDirectory(files){
  indexLog('local files:');
  indexLog(files);
  downloadQueue = [];
    for(let f = 0;f<dirList.list.length;f++){
      //listing all files using forEach
      let dwnld = true;
      files.forEach(function (file) {
        // Do whatever you want to do with the file
        if(dirList.list[f]==file){
          dwnld = false;
          //indexLog(file);
        }
      });

      if(dwnld == true){
        //add the file to the download queue
        downloadQueue.push(dirList.list[f]);
      }
    }
    indexLog("Download Queue:");
    indexLog(downloadQueue);
    
    //remove the old files from the local device
    removeFiles(getDelList(files,dirList.list));

    readyToDownload = true;
}

function indexLog(arg){
    if(ilog == true){
      console.log(arg);
    }
  }

function getDelList(localList,remoteList){
  let delIt = [];
  localList.forEach(function (oldFile) {
    let keepIt = false;
    remoteList.forEach(function(newFile){
      if (oldFile==newFile){
        keepIt = true;
      }
    });
    if(keepIt==false){
      delIt.push(oldFile);
    }
  });

  indexLog("Remove Queue:");
  indexLog(delIt);
  
  return delIt;
}

function removeFiles(anArray){
  //synchronously delete old files
  for(let r = 0;r<anArray.length;r++){
    let remPath = BS.localDirectory + anArray[r];
    fs.unlinkSync(remPath, (err) => {
      if (err) {
          console.log("failed to delete local file:"+err);
      } else {
          console.log('successfully deleted local file');                                
      }
    });
  }
  /*if there are no files to download and
  if files were deleted play the first file*/
  if(downloadQueue.length==0 && anArray.length>0){
    BS.playFile(dirList.list[0]);
  }
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