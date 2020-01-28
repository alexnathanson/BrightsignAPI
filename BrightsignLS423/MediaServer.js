
class MediaServer{
  constructor(){
    this.remoteServerBase = "";
    this.remoteServerDirectory = "";
    this.downloadQueue = [];
    this.downloadIndex = 0;
    this.readyToDownload = false;
    this.writer;
    this.soFar;
    this.contentLength;
    this.fs = require('fs');
    this.ilog = true
    this.remList = [];
  }

  downloadProcess(){
        /*gets the file list from the remote server and
        call the callback to compare it to the local files*/

    //check if its ready to download every 10 seconds
    let checkDownloadState = setInterval(()=>{

      //get remote directory
        dirList.getDir((arg)=>{

          this.checkDirectory(BS.localFileList, arg);
         
          });

        if(this.readyToDownload == true){
          clearInterval(checkDownloadState);

          this.downloadIndex = 0;
          this.downloadIncrement();
        }
    }, 10000);
  }

//increments through all the files that need to be downloaded
  downloadIncrement(){
    if(this.downloadIndex < this.downloadQueue.length){//was <= len +1
          this.downloadFiles(this.downloadQueue[this.downloadIndex]);
    } else {
      /*if all files have been downloaded restart the listener
      to detect remote updates*/
      this.readyToDownload = false;
      console.log("all downloads completed");
      BS.getLocalFiles(this.downloadProcess());
    }
    this.downloadIndex++;
  }

  downloadFiles(name){
    
    this.writer = this.fs.createWriteStream(BS.localDirectory + name, {defaultEncoding:'binary'});

    let VIDEO_URL = this.remoteServerBase + this.remoteServerDirectory + name;
    // Uses fetch instead of XMLHttpRequest to support saving fragments into file as they
    // arrive. XMLHttpRequest will cause device to run out of memory when used with
    // large video files.
    fetch(VIDEO_URL).then((res)=>{
      this.soFar = 0;
      this.contentLength = res.headers.get('Content-Length');
      // Content length might not be known, that is normal.
      if (this.contentLength)
        this.downloadLog("Content length is " + this.contentLength);
      else
        this.downloadLog("Content length is not known");

      return this.pump(res.body.getReader());
    })
    .catch((e)=>{
      this.downloadLog(e);
    });
  }

  pump(reader) {
    return reader.read().then((result)=>{
      if (result.done) {
        this.downloadLog("File Downloaded! " + this.soFar + " bytes total");
        this.writer.end();
        
        //play a file
        BS.playFile(this.remList[0]);

        //BS.getLocalFiles();

        this.downloadIncrement();
        return;
      }

      const chunk = result.value; // --> This is the chunked data
      this.writer.write(new Buffer(chunk));

      this.soFar += chunk.byteLength;
      // Console log takes long time, comment this out to download in full speed.
      this.updateProgress();
      return this.pump(reader);
    });
  }

  updateProgress() {
    if (this.contentLength)
      this.downloadLog((this.soFar/this.contentLength*100).toFixed(2) + "% is downloaded" + this.downloadIndex +'/'+this.downloadQueue.length);
    else
      this.downloadLog(this.soFar + " bytes are downloaded " + this.downloadIndex +'/'+this.downloadQueue.length);
  }

    //compares remote directory to local directory to create the download queue
  checkDirectory(files, remFiles){
    this.remList  = remFiles ;
    this.downloadLog('Local Files:');
    this.downloadLog(files);
    this.downloadQueue = [];
      for(let f = 0;f<this.remList.length;f++){
        //listing all files using forEach
        let dwnld = true;
        files.forEach((file)=> {
          // Do whatever you want to do with the file
          if(this.remList[f]==file){
            dwnld = false;
            //downloadLog(file);
          }
        });

        if(dwnld == true){
          //add the file to the download queue
          this.downloadQueue.push(this.remList[f]);
        }
      }
      this.downloadLog("Download Queue:");
      this.downloadLog(this.downloadQueue);
      
      //remove the old files from the local device
      this.removeFiles(this.getDelList(files,this.remList));

      this.readyToDownload = true;
  }

  downloadLog(arg){
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

    this.downloadLog("Remove Queue:");
    this.downloadLog(delIt);
    
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
        console.log("removed it???");
      });
    }

    /*if there are no files to download and
    if files were deleted play the first file*/
    if(this.downloadQueue.length==0 && anArray.length>0){
      BS.playFile(this.remList[0]);

      //update local file list
      BS.getLocalFiles();

    }
  }
}