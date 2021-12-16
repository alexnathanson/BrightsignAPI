'use strict';

//instantiate the class
let BS = new BS_API();

//run first to configure and initialize the device the API
//the callback specifies what will run when once the player is ready
BS.loadConfig(start);

/*BS.eventEmitter.on('queue',()=>{
      scene2();
});*/

//once configured and initialized this gets run
function start(){
  
  //set the callback that runs on GPIOEvents
  if(BS.configDict.gpio){
    BS.GPIOEvents(BS.randomMedia());
  }

  //play a file
  if(BS.localFileList.length  > 0){
    console.log('playing file: ' + BS.localFileList[0]);
    BS.playFile(BS.localFileList[0]);
  }

  //send a sync message if not in normal mode
  if(BS.configDict.playback_mode != "normal"){
    setTimeout(function () {
        BS.syncPlayback();
    }, 10000);
  }

  if(BS.configDict.media_sync){
  //check if the download flag has been raised every minute
    BS.downloadProcess();
  } 
}