
/*
this class combines Brightsign JS API, Brightscript-JavaScript Objects, Node JS modules, and additional custom code to create a more complete functional API with consistant syntax.
*/

class BS_API{
	constructor(){
		this.api = '0.0.4'; //version
		this.localDirectory = '/storage/sd/';
		this.localFileList = [];

	/*******BS-JS API******************************************************/

		//https://docs.brightsign.biz/display/DOC/system
		this.SystemClass = require("@brightsign/system");
		this.system = new this.SystemClass();

		//https://docs.brightsign.biz/display/DOC/screenshot
		this.ScreenshotClass = require("@brightsign/screenshot");
		this.screenshot = new this.ScreenshotClass();
		this.screenshotParams = {"fileName":"SD:/controlInterface/images/screen.jpg",
								"quality":50}; 
 
	/*******BS-JS OBJECTS*************************************************
		BS-JS Objects are supposedly being replaced with the BS-JS API,
		but are still being offerred for backwards compatibility purposes*/

		//https://docs.brightsign.biz/display/DOC/BSDeviceInfo
		this.deviceInfo = new BSDeviceInfo();

		//https://docs.brightsign.biz/display/DOC/BSControlPort#BSControlPort-Examples
		//using the equivalent GPIO object in brightscript can cause unpredictable GPIO behaviour
		//Expander-0-GPIO is for use with the USB to GPIO expander
		this.gpio;

		//https://docs.brightsign.biz/display/DOC/BSTicker
		this.tickerX = 10;
		this.tickerY = 110;
		this.tickerW = 600;
		this.tickerH = 30;
		this.displayIP = true;
		this.ticker = new BSTicker(this.tickerX,this.tickerY, this.tickerW,this.tickerH);

		this.VideoOutputClass = require("@brightsign/videooutput");
		this.videoOutputHDMI = new this.VideoOutputClass("hdmi");

		this.VideoModeConfigurationClass = require("@brightsign/videomodeconfiguration");
		this.videoConfig = new this.VideoModeConfigurationClass();

  	/*******NODE JS Modules******************************************************/
  		this.os = require( 'os' );
		this.networkInterfaces = this.os.networkInterfaces();
  		this.myIP= this.networkInterfaces.eth0[0]['address'];
  		this.myMAC = this.networkInterfaces.eth0[0]['mac'];

  		//https://nodejs.org/api/dgram.html
		this.dgram = require('dgram');
		this.socket = this.dgram.createSocket('udp4');
		this.sendPort = 13131;
		this.dgramMessage = 'abc';
		this.receiver = this.dgram.createSocket('udp4');
		this.mediaEndFlag = false;
		this.currentFile = "";
		this.fs = require('fs');
		this.mediaTypes = ['MPG','WMV','MOV','MP4','VOB','TS','MP3','WAV'];


	/******Post Device Info******************/
		this.postInterval = 2 * 60000;//2 minutes * 60000 to convert to unix time
		this.postTimer;

	/*****Config File***********************/
		this.logC = true;
		this.configFileName = 'config.txt';
		this.configFilePath = this.localDirectory + this.configFileName;
		this.configString = "";
		this.configDict = {};
		this.newLine = "";
		this.persist = true;

	/******Server Syncing*************/
		//removed 1/27
		this.remoteServerBase = "";
	    this.remoteServerDirectory = "";
	    this.downloadQueue = [];
	    this.downloadIndex = 0;
	    this.readyToDownload = false;
	    this.writer;
	    this.soFar;
	    this.contentLength;
	    this.ilog = false;
	    this.remList = [];
	    this.getRemList;//function to retrieve remote media file list
	/*****media details***************/
		/*this.ls423Resolutions = ["640x480x60p","720x480x59.94p","720x480x60i","720x480x60p","720x576x50i","720x576x50p",
								"640x480x60p","720x480x59.94p","720x480x60i","720x480x60p","720x576x50i", "720x576x50p","800x600x60p",
								"800x600x75p","800x1280x60p","848x480x60p","960x960x60p","1024x768x60p","1024x768x75p","1200x1920x60p",
								"1280x720x23.976p","1280x720x24p","1280x720x25p","1280x720x50p","1280x720x59.94p","1280x720x60p","1280x768x60p",
								"1280x800x60p","1280x800x75p","1280x960x60p","1280x1024x60p","1280x1024x75p","1360x768x60p","1366x768x60p",
								"1400x1050x60p","1400x1050x75p","1440x900x60p","1440x900x75p","1440x1080x60p","1440x1088x57p","1600x900x60p",
								"1600x1200x60p","1680x1050x60p","1728x1296x60p","1920x540x60p","1920x1080x50i","1920x1080x59.94i","1920x1080x60i",
								"920x1080x23.976p","1920x1080x24p","1920x1080x25p","1920x1080x29.97p","1920x1080x30p","1920x1080x50p",
								"1920x1080x59.94p","1920x1080x60p","1920x1200x50p","1920x1200x60p"];*/
		this.resolutions = "";
		this.fileResolution = "";
		this.location = "";
	}

	initialize(callback){
		console.log('initializing BS API');
		//this.loadConfig();//formerly had a call back to configured()
		console.log(this.configDict);

		this.displayIP = this.configDict.displayIP;
		//this.postURL = this.configDictionary.postURL;
		
		//added 1/28
		this.remoteServerBase = 'http://'+this.configDict['media_server'];
		this.remoteServerDirectory = '/' + this.deviceInfo.deviceUniqueId + '/media/';

		this.ticker.AddString(this.myIP);

		if(!this.displayIP){
			this.hideIP();
		}

		if(this.configDict.gpio){
			this.gpio = new BSControlPort("Expander-0-GPIO");
		}

		//this.setGPIOEventCallbacks();
		this.asyncScreenShot();

		if(this.configDict.postIP){
			this.postInfo();
		}

		//added 1/27
		this.getLocalFiles(callback);
		//callback();

	}

	getLocalFiles(callback){
	  this.fs.readdir(this.localDirectory, (err, files)=> {
	    //handling error
	    if (err) {
	        return indexLog('Unable to scan directory: ' + err);
	    } else {
	      //filter local files by data type before comparing directories
	      this.localFileList = this.filterMediaType(files);

			if(typeof callback	== 'function'){
	      		callback(this.localFileList);
	      	}
	    }
	  });
	}

	filterMediaType(anArray){
	  let mediaFiles = [];

	  anArray.forEach((file)=>{
	    let uFile = file.toUpperCase();
	    this.mediaTypes.forEach((type)=>{
	      if(uFile.includes(type)){
	        mediaFiles.push(file);
	      }
	    });
	  });

	  return mediaFiles;
	}

	reboot(){
		this.system.reboot();
	}

	configureGPIOInput(pin){
		// set outputs
		this.gpio.ConfigureAsInput(pin);
	}

	configureGPIOOuput(pin,value){
		this.gpio.ConfigureAsOutput(pin,value);
	}

	readGPIO(pin){
		this.gpio.GetPinValue(pin)
	}

	GPIOEvents(callback){
		console.log("Setting GPIO Events.")

		this.gpio.oncontroldown = (e)=>{
			console.log(e);
			console.log('oncontroldown ' + e.code);

			callback();
		}

		/*this.gpio.oncontrolup = (e)=>{
			console.log(e);
            console.log('oncontrolup ' + e.code);
        }*/

        /*this.gpio.oncontrolevent = function(e){
        	console.log(e);
            console.log('oncontrolevent ' + e.code);
        }*/
	}

	asyncScreenShot(){
		this.screenshot.asyncCapture(this.screenshotParams);
		//setInterval(this.screenshot.takeAsyncScreenshot(screenshotParams), 10000);
	}

	dgramSend(aMessage){
		this.socket.send(Buffer.from(aMessage), this.sendPort, 'localhost'); 
	}

/*************for receiving event data back from the autorun script**************/
	dgramReceive(callback){
		this.receiver.on('error', (err) => {
		  console.log(`server error:\n${err.stack}`);
		  this.receiver.close();
		});

		this.receiver.on('message', (msg, rinfo) => {
		  //console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

		  if(msg == 'media ended' && this.mediaEndFlag){
		  	callback();
		  	this.mediaEndFlag = false;
		  }
		});

		this.receiver.on('listening', () => {
		  const address = this.receiver.address();
		  console.log(`UDP server listening on ${address.address}:${address.port}`);
		});

		this.receiver.bind(31313);
	}

/******* IP display *************************************/
	showIP(){
		this.ticker.SetRectangle(this.tickerX,this.tickerY, this.tickerW,this.tickerH)
	}
	hideIP(){
		//hides the ticker offscreen. not sure how to fully remove it
		this.ticker.SetRectangle(-100,-100,1,1)
	}

/********* Playback and Media Controls ******************/
	playback(arg){
		if (arg == 'play'){
			//restart at beginning
			this.dgramSend("play");

		} else if (arg == 'pause'){
			//pause
			this.dgramSend("pause");
		} else if (arg == 'resume'){
			//resume where it was paused
			this.dgramSend("resume");
		}
	}

	playFile(arg){
		this.dgramSend("file " + arg);
		this.currentFile = arg;
	}

	setVolume(arg){
		this.dgramSend("volume " + arg);
	}

	maskIt(aBool){
		this.dgramSend("mask " + aBool);
	}

/******Post Device Info to Remote Server******************/
	//post device info to server
	postHTTP(postThis,postHere){
		let xhr = new XMLHttpRequest();
		xhr.open("POST", postHere, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(
			postThis)
		);

		xhr.onreadystatechange = function (){
		    if (this.readyState == 4 && this.status == 200){
		      //callback(this.responseText);
		      console.log(this.responseText)
		    }
		  };
		}

	postInfo(){

		//check if its ready to download every 5 seconds
    	this.postTimer = setInterval(()=>{
		    let devInfo = new Object();
		    devInfo[this.deviceInfo.deviceUniqueId] = {};
		    devInfo[this.deviceInfo.deviceUniqueId].mac = this.myMAC;
		    devInfo[this.deviceInfo.deviceUniqueId].ip = this.myIP;
		    devInfo[this.deviceInfo.deviceUniqueId].file = this.localFileList[0];
		    devInfo[this.deviceInfo.deviceUniqueId].time = Date.now();

		  	this.postHTTP(devInfo, this.configDict.postURL);

		}, this.postInterval);
	}

	stopPost(){
		clearInterval(this.postTimer);
	}

/*****************Control Interface Server***********************/


/********** Config File*************************/
	loadConfig(callback){//formerly had a callback
		  this.logConfig('parsing: ' + this.configFilePath);
		  this.fs.readFile(this.configFilePath,'utf8', (err, file)=> {
		  //handling error
	      if (err) {
	          return console.log('Unable to read config file: ' + err);
	      } else {
	        //do something with the file
	        //this.logConfig(typeof file);
	        this.configString = file;
	        this.logConfig(this.configString);
	        //split config file by line
	        let configFileRows   = this.configString.split('\n');

	    	//iterate through each line
	        configFileRows.forEach((aRow)=>{
	        	//if the row isn't commented out

	        	if(!aRow.includes('#')&&aRow!=""&&aRow!="\n"){
	        		let rowArray = aRow.split(' = ');

	        		//convert strings to booleans
	        		if(rowArray[1] == 'true' || rowArray[1] == 'false' ){
	        			rowArray[1]=(rowArray[1]=='true')
	        		}
	        		this.configDict[rowArray[0]]=rowArray[1];
	        	}
	        });

	        this.logConfig(this.configDict);

	        //once config file is loaded initialize with the data
	        this.initialize(callback);
	      }
	  });
	}

	//formerly getValue()
	getConfigValue(aKey){
	  return this.configDict[aKey];
	}

	//formerly setValue()
	//args: a key/value pair and a boolean. if boolean is true, it saves the changes so they persist
	setConfigValue(aKey, aValue){

	  if(this.persist){

	  	this.newLine = aKey + ' = ' + aValue;

		this.configString = this.configString.replace(aKey+' = '+this.configDict[aKey], this.newLine);

		//the arrow function is necessary because the asynchronous writeFile method would change the scope without it
		this.fs.writeFile(this.configFilePath, this.configString, 'utf8', (err)=> {
		    if (err) return console.log(err);
		     // success case, the file was saved
	    	this.logConfig(this.configFilePath + ' saved!');
		 });
 		}

 		this.configDict[aKey]=aValue;
	}

	commentOutConfigValue(aKey){
		let configFileRows   = this.configString.split('\n');
	    let commentString;
      	//iterate through each line
        configFileRows.forEach((aRow)=>{

        	//get the key and remove the spaces
        	if(aRow.split(' = ')[0].replace(/\s/g, '') == aKey){
        		commentString = aRow;
        		//break;
        	}
        });
		this.configString = this.configString.replace(commentString, '#'+commentString);

		//the arrow function is necessary because the asynchronous writeFile method would change the scope without it
		this.fs.writeFile(this.configFilePath, this.configString, 'utf8', (err)=> {
		    if (err) return console.log(err);
		     // success case, the file was saved
	    	this.logConfig(this.configFilePath + ' commented out!');
		 });
	}

	commentInConfigValue(aKey){

	     let configFileRows   = this.configString.split('\n');
	     let uncommentString;
      	//iterate through each line
        configFileRows.forEach((aRow)=>{

        	//get the key and remove the spaces
        	if(aRow.split(' = ')[0].replace(/\s/g, '') == "#"+aKey){
        		uncommentString = aRow;
        		//break;
        	}
        });

      	this.configString = this.configString.replace(uncommentString, uncommentString.slice(1));

      	this.fs.writeFile(this.configFilePath, this.configString, 'utf8', (err)=> {
		    if (err) return console.log(err);
		     // success case, the file was saved
	    	this.logConfig(this.configFilePath + ' commented in!');
		 });
    }

    newConfigLine(aLine){
    	this.configString = this.configString + "\n"+aLine;

    	this.fs.writeFile(this.configFilePath, this.configString, 'utf8', (err)=> {
		    if (err) return console.log(err);
		     // success case, the file was saved
	    	this.logConfig(this.configFilePath + ' commented in!');
		 });
    }

	logConfig(toLog){
		if(this.logC){
			console.log(toLog);
		}
	}

/********SERVER SYNC - DOWNLOAD PROCESSES*************************/

  downloadProcess(){
        /*gets the file list from the remote server and
        call the callback to compare it to the local files*/

    //check if its ready to download every 10 seconds
    let checkDownloadState = setInterval(()=>{

      //get remote directory
        //dirList.getDir((arg)=>{
        this.getRemList((arg)=>{
        	/*console.log("Remote File List:");
        	console.log(arg);*/

          	this.checkDirectory(this.localFileList, arg);
         
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
      this.downloadLog("All downloads completed");
      this.getLocalFiles(this.downloadProcess());
    }
    this.downloadIndex++;
  }

  downloadFiles(name){
    
    this.writer = this.fs.createWriteStream(this.localDirectory + name, {defaultEncoding:'binary'});

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
        this.playFile(this.remList[0]);

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
      let remPath = this.localDirectory + anArray[r];
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
      this.playFile(this.remList[0]);

      //update local file list
      this.getLocalFiles();

    }
  }


/* enables parsing the file name if structured like: LOCATION_FILENAME_RESOLUTION.formatsuffix
 for example room34_MyCoolVideo_1920x1080x60p.mov*/
	parseFileName(aString){

	  if (aString == undefined || aString === undefined){
	    this.location = 'unknown';
	  } else {
	    let parsedName = aString.split("_");
	    //console.log(parsedName);
	    //location
	    if(parsedName[0].toLowerCase().includes('bay')){
	      this.location =  parsedName[0];
	    } else {
	      this.location = 'Bay unknown';
	    }

	    //remove suffix
	    for (let mT = 0;mT<this.mediaTypes.length;mT++){
	      if(parsedName[parsedName.length-1].includes(this.mediaTypes[mT].toLowerCase())){
	        parsedName[parsedName.length-1] = parsedName[parsedName.length-1].slice(0,(-1*this.mediaTypes[mT].length)-1);
	        //console.log(parsedName);
	        break;
	      }
	    }
	    //resolution
	    for(let r = 0; r < this.ls423Resolutions.length;r++){
	      if(parsedName[parsedName.length-1] == this.ls423Resolutions[r]){
	        this.fileResolution = parsedName[parsedName.length-1];
	        console.log(this.fileResolution);
	        //check if it should update based on filename
	        if(this.configDict.parseFileName == true && this.fileResolution != GETRESOLUTION){
	        	this.configDict.video_output_mode = this.fileResolution;
	        	this.reboot();
	        }
	        break;
	      }
	    }
	  }
	}

}

