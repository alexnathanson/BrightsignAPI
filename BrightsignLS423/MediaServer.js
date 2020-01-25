
class MediaServer{
  constructor(){
    this.downloadQueue = [];
    this.downloadIndex = 0;
    this.readyToDownload = false;
    this.writer;
    this.soFar;
    this.contentLength;
    this.fs = require('fs');
    this.ilog = true;
  }

  downloadProcess(){
    /*gets the file list from the remote server and
    call the callback to compare it to the local files*/
    dirList.getDir();

    //BS.postInfo();

    //check if its ready to download every 5 seconds
    let checkDownloadState = setInterval(()=>{
        if(this.readyToDownload == true){
          clearInterval(checkDownloadState);

          this.downloadIndex = 0;
          downloadIncrement();
        }
    }, 5000);
  }

//increments through all the files that need to be downloaded
  downloadIncrement(){
    if(this.downloadIndex < this.downloadQueue.length){//was <= len +1
          downloadFiles(this.downloadQueue[downloadIndex]);
    } else {
      /*if all files have been downloaded restart the listener
      to detect remote updates*/
      this.downloadProcess();
    }
    this.downloadIndex++;
  }

  downloadFiles(name){
    
    this.writer = this.fs.createWriteStream(BS.localDirectory + name, {defaultEncoding:'binary'});

    let VIDEO_URL = remoteServerBase + remoteServerDirectory + name;
    // Uses fetch instead of XMLHttpRequest to support saving fragments into file as they
    // arrive. XMLHttpRequest will cause device to run out of memory when used with
    // large video files.
    fetch(VIDEO_URL).then((res)=>{
      this.soFar = 0;
      this.contentLength = res.headers.get('Content-Length');
      // Content length might not be known, that is normal.
      if (this.contentLength)
        indexLog("Content length is " + this.contentLength);
      else
        indexLog("Content length is not known");

      return pump(res.body.getReader());
    })
    .catch((e)=>{
      indexLog(e);
    });
  }

  pump(reader) {
    return reader.read().then((result)=>{
      if (result.done) {
        indexLog("All done! " + this.soFar + "bytes total");
        this.writer.end();
        
        //play a file
        BS.playFile(dirList.list[0]);

        downloadIncrement();
        return;
      }

      const chunk = result.value; // --> This is the chunked data
      this.writer.write(new Buffer(chunk));

      this.soFar += chunk.byteLength;
      // Console log takes long time, comment this out to download in full speed.
      updateProgress();
      return pump(reader);
    });
  }

  updateProgress() {
    if (this.contentLength)
      indexLog((this.soFar/this.contentLength*100).toFixed(2) + "% is downloaded" + this.downloadIndex +'/'+this.downloadQueue.length);
    else
      indexLog(this.soFar + " bytes are downloaded " + this.downloadIndex +'/'+this.downloadQueue.length);
  }

  checkDirectory(files){
    indexLog('local files:');
    indexLog(files);
    this.downloadQueue = [];
      for(let f = 0;f<dirList.list.length;f++){
        //listing all files using forEach
        let dwnld = true;
        files.forEach((file)=> {
          // Do whatever you want to do with the file
          if(dirList.list[f]==file){
            dwnld = false;
            //indexLog(file);
          }
        });

        if(dwnld == true){
          //add the file to the download queue
          this.downloadQueue.push(dirList.list[f]);
        }
      }
      this.indexLog("Download Queue:");
      this.indexLog(this.downloadQueue);
      
      //remove the old files from the local device
      this.removeFiles(getDelList(files,dirList.list));

      this.readyToDownload = true;
  }

  indexLog(arg){
      if(this.ilog == true){
        console.log(arg);
      }
    }

  getDelList(localList,remoteList){
    let delIt = [];
    localList.forEach((oldFile)=> {
      let keepIt = false;
      remoteList.forEach((newFile)=>{
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

  removeFiles(anArray){
    //synchronously delete old files
    for(let r = 0;r<anArray.length;r++){
      let remPath = BS.localDirectory + anArray[r];
      this.fs.unlinkSync(remPath, (err) => {
        if (err) {
            console.log("failed to delete local file:"+err);
        } else {
            console.log('successfully deleted local file');                                
        }
      });
    }
    /*if there are no files to download and
    if files were deleted play the first file*/
    if(this.downloadQueue.length==0 && anArray.length>0){
      BS.playFile(dirList.list[0]);
    }
  }
}