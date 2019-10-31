//check contents of directory and compare to local storage
//update contents accordingly
//create diagnostic system to 1)get current local file list 2)screen cap

'use strict';

//turn on and off console logging
let ilog = true;
let readyToDownload = false;
let localDirectory = '/storage/sd/media/';

//an array to hold remote file names
let downloadQueue = [];
let downloadIndex = 0;

//https://docs.brightsign.biz/display/DOC/system
let systemClass = require("@brightsign/system");
let system = new systemClass();

// Uses node.js fs module to save files into sd card.
let fs = require('fs');

//get file list from remote server
//arguments: base IP, directory structure, callback
let dirList = new HTMLDirectory('http://172.16.1.17','/31D73S000475/media/',getLocalFiles);
dirList.log=true;

let writer,soFar,contentLength;

indexLog('version 0.0.1');

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

//add the spaces back in...might not be necessary 100% of the time
/*if(downloadQueue[f].includes('%')){
  downloadQueue[f] = addSpace(downloadQueue[f]);
}*/

function downloadIncrement(){
  if(downloadIndex <= downloadQueue.length-1){
        downloadFiles(downloadQueue[downloadIndex]);
  } else {
    //restart the listener
    downloadProcess();
  }
  downloadIndex++;
}

function downloadFiles(name){
  
  writer = fs.createWriteStream(localDirectory + name, {defaultEncoding:'binary'});

// Replace this with your own url:
//must include http://
//const VIDEO_URL = 'http://172.16.1.17/31D73S000475/Update/' + fileName;/*'http://brightsignbiz.s3.amazonaws.com/videos/Overview-video-series3-07012016.mp4';*/

  let VIDEO_URL = 'http://172.16.1.17/31D73S000475/Update/' + name;
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

    //getOldList();
    //removeOldFiles();

    readyToDownload = true;
}

function indexLog(arg){
    if(ilog == true){
      console.log(arg);
    }
  }

function getOldList(){
  let toRemove = [];

  return toRemove;
}

function removeOldFiles(anArray){

    //synchronously delete old files
    for(let r = 0;r<anArray.length;r++){
      let remPath = localDirectory + anArray[r];
      fs.unlinkSync(remPath, (err) => {
        if (err) {
            console.log("failed to delete local file:"+err);
        } else {
            console.log('successfully deleted local file');                                
        }
    }
}