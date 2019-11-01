//check contents of the remote directory and compares it to local storage
//deletes old files and downloads new files

let version = '0.0.1';

'use strict';

//turn on and off console logging
let ilog = true;

let readyToDownload = false;
let localDirectory = '/storage/sd/media/';

//an array to hold remote files that need to be downloaded
let downloadQueue = [];
let downloadIndex = 0;

//https://docs.brightsign.biz/display/DOC/system
let systemClass = require("@brightsign/system");
let system = new systemClass();

// Uses node.js fs module to save files into sd card.
let fs = require('fs');

//172.16.1.17
let remoteServerBase = 'http://192.168.1.185';

//this needs to be automated...
let remoteServerDirectory = '/31D73S000475/media/';

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
  if(downloadIndex <= downloadQueue.length-1){
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

// Replace this with your own url:
//must include http://
//const VIDEO_URL = 'http://172.16.1.17/31D73S000475/Update/' + fileName;/*'http://brightsignbiz.s3.amazonaws.com/videos/Overview-video-series3-07012016.mp4';*/

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
      //void reboot();//must be rebooted, else it wont play
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
      checkDirectory(files);
    }
  });
}

function checkDirectory(files){
  indexLog('local files:');
  indexLog(files);
  indexLog(dirList.list.length);
  downloadQueue = [];
    for(let f = 0;f<dirList.list.length;f++){
      //listing all files using forEach
      let dwnld = true;
      files.forEach(function (file) {
        // Do whatever you want to do with the file
        if(dirList.list[f]==file){
          dwnld = false;
          indexLog(file);
        }
      });

      if(dwnld == true){
        //add the file to the download queue
        downloadQueue.push(dirList.list[f]);
      }
    }
    indexLog("Download Queue:");
    indexLog(downloadQueue);
    
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
}