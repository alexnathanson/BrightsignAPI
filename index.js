//check contents of the remote directory and compares it to local storage
//deletes old files and downloads new files

let version = '0.0.1';

'use strict';

//turn on and off console logging
let ilog = true;

let BS = new BS_API();
BS.initialize();

let readyToDownload = false;
let localDirectory = '/storage/sd/';

let mediaTypes = ['MPG','WMV','MOV','MP4','VOB','TS','MP3'];

//an array to hold remote files that need to be downloaded
let downloadQueue = [];
let downloadIndex = 0;

// Uses node.js fs module to save files into sd card.
let fs = require('fs');

let configDict = {};
//parseConfig();
/*
let dgram = require('dgram');
let sUDP = dgram.createSocket('udp4');
sUDP.send(Buffer.from('abc'), 13131, 'localhost');*/ 

//172.16.1.17
//replace with your server IP. must include http://
//maybe pull this from the config file...
let remoteServerBase = 'http://172.16.1.17';

let remoteServerDirectory = '/' + BS.deviceInfo.deviceUniqueId + '/media/';

//get file list from remote server
//arguments: base IP, directory structure, callback
let dirList = new HTMLDirectory(remoteServerBase,remoteServerDirectory,getLocalFiles);
dirList.log=true;

//the variables are used in the download process
let writer,soFar,contentLength;

indexLog(version);

//check the various directories, remove old files, and download new files
downloadProcess();

function downloadProcess(){
  /*gets the file list from the remote server and
  call the callback to compare it to the local files*/
  dirList.getDir();

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
  
  writer = fs.createWriteStream(localDirectory + name, {defaultEncoding:'binary'});

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
      playFile(dirList.list[0]);

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
  fs.readdir(localDirectory, function (err, files) {
    //handling error
    if (err) {
        return indexLog('Unable to scan directory: ' + err);
    } else {
      //filter local files by data type before comparing directories
      checkDirectory(filterMediaType(files));
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
    let remPath = localDirectory + anArray[r];
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
    playFile(dirList.list[0]);
  }
}

//this doesn't actually do anything atm
function parseConfig(){
  fs.read('/storage/sd/config.txt', function (err, file) {
      //handling error
      if (err) {
          return console.log('Unable to read config file: ' + err);
      } else {
        //do something with the file
        console.log(file);
      }
  });
}

function playFile(aFileName){
  BS.dgramSend("file " + aFileName);
}