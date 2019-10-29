//check contents of directory and compare to local storage
//update contents accordingly
//create diagnostic system to 1)get current local file list 2)screen cap

'use strict';


let localDirectory = '/storage/sd/';
let downloadQueue = [];


let systemClass = require("@brightsign/system");
let system = new systemClass();

// Uses node.js fs module to save files into sd card.
let fs = require('fs');

//get file list from remote server
let dirList = new HTMLDirectory('http://172.16.1.17','/31D73S000475/Update/');

dirList.getDir();
getLocalFiles();//figure out the call back here...

let fileName = 'CRKAV03_190730_Crazy-Indonesian_SC.mp4'

let writer = fs.createWriteStream(localDirectory + fileName, {defaultEncoding:'binary'});

// Replace this with your own url:
//must include http://
const VIDEO_URL = 'http://172.16.1.17/31D73S000475/Update/' + fileName;/*'http://brightsignbiz.s3.amazonaws.com/videos/Overview-video-series3-07012016.mp4';*/

let soFar;
let contentLength;

// Uses fetch instead of XMLHttpRequest to support saving fragments into file as they
// arrive. XMLHttpRequest will cause device to run out of memory when used with
// large video files.
fetch(VIDEO_URL).then(function (res) {
  soFar = 0;
  contentLength = res.headers.get('Content-Length');
  // Content length might not be known, that is normal.
  if (contentLength)
    console.log("Content length is " + contentLength);
  else
    console.log("Content length is not known");

  return pump(res.body.getReader());
})
.catch(function (e) {
  console.log(e);
});

function pump(reader) {
  return reader.read().then(function (result) {
    if (result.done) {
      console.log("All done! " + soFar + "bytes total");
      writer.end();
      //void reboot();//must be rebooted, else it wont play
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
    console.log((soFar/contentLength*100).toFixed(2) + "% is downloaded");
  else
    console.log(soFar + " bytes are downloaded");
}

function getLocalFiles(){
  fs.readdir(localDirectory, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } else {
      checkDirectory(files);
    }
  });
}

function checkDirectory(files){
  console.log(files);
  console.log(dirList.list.length);
    for(let f = 0;f<dirList.list.length;f++){
      //listing all files using forEach
      let dwnld = true;
      files.forEach(function (file) {
        console.log(file);
        // Do whatever you want to do with the file
        if(dirList.list[f]==file){
          dwnld = false;
        }
      });

      if(dwnld == true){
        //add the file to the download queue
        downloadQueue.push(dirList.list[f]);
      }
    }
    console.log("Download Queue:");
    console.log(downloadQueue);
}