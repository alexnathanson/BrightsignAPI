
/*
this class combines Brightsign JS API, Brightscript-JavaScript Objects, Node JS modules, and additional custom code to create a more complete functional API with consistant syntax.
*/

class BS_API{
	constructor(){
		this.api = '0.0.12'; //version
		this.localDirectory = '/storage/sd/';
		this.localFileList = [];

	/*******JS API******************************************************/

		// https://docs.brightsign.biz/display/DOC/system
		this.SystemClass = require("@brightsign/system");
		this.system = new this.SystemClass();

		//https://docs.brightsign.biz/display/DOC/screenshot
		this.ScreenshotClass = require("@brightsign/screenshot");
		this.screenshot = new this.ScreenshotClass();
		this.screenshotParams = {"fileName":"SD:/controlInterface/images/screen.jpg",
								"quality":50}; 


		this.SystemTimeClass = require("@brightsign/systemtime");
		this.systemTime = new this.SystemTimeClass();
 
	/*******BS-JS OBJECTS*************************************************
		BS-JS Objects are supposedly being replaced with the BS-JS API,
		but are still being offerred for backwards compatibility purposes*/

		//https://docs.brightsign.biz/display/DOC/BSDeviceInfo
		this.deviceInfo = new BSDeviceInfo();

		// https://docs.brightsign.biz/display/DOC/BSControlPort#BSControlPort-Examples
		//using the equivalent GPIO object in brightscript can cause unpredictable GPIO behaviour
		//Expander-0-GPIO is for use with the USB to GPIO expander
		this.gpio;

		// https://docs.brightsign.biz/display/DOC/BSTicker
		//IP display ticker
		this.tickerX = 10;
		this.tickerY = 110;
		this.tickerW = 600;
		this.tickerH = 30;
		this.displayIP = true;
		this.ticker = new BSTicker(this.tickerX,this.tickerY, this.tickerW,this.tickerH);

		//Download process ticker
		this.dTickerX = 10;
		this.dTickerY = 140;
		this.displayDownloadProgess = true;
		this.dTicker = new BSTicker(this.dTickerX,this.dTickerY, this.tickerW,this.tickerH);
		//this.dTicker.SetPixelsPerSecond(30);
		this.dTicker.SetAutoPop(true);

		this.VideoOutputClass = require("@brightsign/videooutput");
		this.videoOutputHDMI = new this.VideoOutputClass("hdmi");
		this.vOutput;

		this.VideoModeConfigurationClass = require("@brightsign/videomodeconfiguration");
		this.videoConfig = new this.VideoModeConfigurationClass();
		this.vMode;
		this.bestMode;
		//this.videoMode = CreateObject("roVideoMode")

		//this.sync = new BSSyncManager("domain1", "172.16.1.22", 1539);
		//this.syncBoss = false;

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
		this.postInterval = 3 * 60000;//3 minutes * 60000 to convert to unix time
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
		this.mediaServer = "";
	    this.mediaServerDirectory = "";
	    this.downloadQueue = [];
	    this.downloadIndex = 0;
	    this.readyToDownload = false;
	    this.writer;
	    this.soFar;
	    this.contentLength;
	    this.ilog = true;
	    this.remList = [];
	    this.getRemList;//function to retrieve remote media file list
	    this.downloadPercent = 0;
	/*****media details***************/
		/*this.resolutions = ["640x480x60p","720x480x59.94p","720x480x60i","720x480x60p","720x576x50i","720x576x50p",
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
		this.downloading = false;

	/*******Clock***************/
		this.startMs;// = Date.now();
        this.startSecs;// = Math.floor(this.startMs / 1000);
        this.firstOffset;// = 1000 - this.startMs % 1000;
        this.currentTime  = 0;
        this.clocker; //the setInterval counting seconds
        //this.seconds;
        this.seek = 0;
        this.atThisTime = 0; 
        this.queueFile = "";
        this.events = require('events');
		this.eventEmitter = new this.events.EventEmitter();
		//this.queues = [];
		this.schedule = false;
		this.syncServer = false;//
		this.syncGroup = [];// list of IPs to sync
		this.timecode = 0;
		this.duration = 0;

		//https://www.npmjs.com/package/node-cron
		this.cron = require('node-cron');
		this.task;
		this.cronString = "";
		this.cronCallback;

		this.localFileBytes = [];
	}

	initialize(callback){
		console.log('initializing BS API');
		//this.loadConfig();//formerly had a call back to configured()
		console.log(this.configDict);

		if(this.configDict.playbackSync && this.configDict.syncLeader){
			//this.initializeClock();
			//console.log("clock started");
			this.createTask(this.cronString,this.cronCallback);
		}

		this.displayIP = this.configDict.displayIP;
		
		this.mediaServer = 'http://'+this.configDict['media_server'] + ":" + this.configDict['media_server_port'];
		this.mediaServerDirectory = '/' + this.deviceInfo.deviceUniqueId + '/media/';

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

		this.getDeviceInfo()
		
		this.getLocalFiles(callback);

	}

	getDeviceInfo(){

	    this.videoOutputHDMI.getOutputResolution().then((data)=>{
	            this.vOutput=(data);
	        })

	    this.videoConfig.getActiveMode().then((data)=>{
	            this.vMode=(data);
	        })

	    this.videoConfig.getBestMode('hdmi').then((data)=>{
	            this.bestMode=(data);
	        })
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
		  console.log(`dgram receiver server error:\n${err.stack}`);
		  this.receiver.close();
		});

		this.receiver.on('message', (msg, rinfo) => {
		  //console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

		  if(msg == 'media ended' && this.mediaEndFlag){
		  	callback();
		  	this.mediaEndFlag = false;
		  } else if (msg.includes("timecode")){
		  	this.timecode = msg.toString().slice(9);
		  	console.log(this.timecode);
		  } else if (msg.includes("duration")){
		  	this.duration = msg.toString().slice(9);
		  	console.log(this.duration);
		  } else {
		  	console.log(msg.toString());
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

/******* Download progress display *************************************/
	downloadProcessTicker(bool){
		if(bool){
			this.dTicker.SetRectangle(this.dTickerX,this.dTickerY, this.tickerW,this.tickerH)
		} else {
			this.dTicker.SetRectangle(-100,-100,1,1)
		}
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

	preload(aFile,seekTime){
    	this.dgramSend("preload " + aFile + "," + seekTime);
    }

	seekFile(arg){
		this.dgramSend("seek " + arg);
	}

	setVolume(arg){
		this.dgramSend("volume " + arg);
	}

	maskIt(arg){
		//to show mask: arg = show
		//to hide mask: arg = hide
		this.dgramSend("mask " + arg);
	}

	getDuration(){
		this.dgramSend("duration");
	}

	getTimecode(){
		this.dgramSend("timecode");
	}

/******Post and Get functions for interacting with media control server******************/
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

		  	this.postHTTP(devInfo, this.mediaServer + "/node/checkin/ip");

		}, this.postInterval);
	}

	stopPost(){
		clearInterval(this.postTimer);
	}

	formatFilesRequest(){
		return  this.mediaServer +'/node/media/files?dev=' + this.deviceInfo.deviceUniqueId;
	}

	formatFileSizeRequest(aFile){
		return this.mediaServer + '/node/media/filesize?dev=' + this.deviceInfo.deviceUniqueId + '&file=' + aFile;
	}

	formatStreamRequest(aFile){
		let sr = this.mediaServer + '/node/media/stream?dev=' + this.deviceInfo.deviceUniqueId + '&file=' + aFile;
		console.log(sr);
		return sr;
	}

	getHTTP(getDST,callback){
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		       // Typical action to be performed when the document is ready:
		       callback();
		    }
		};
		xhttp.open("GET", getDST, true);
		xhttp.send();
	}

	parseDirectory(){

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
        	console.log("Remote File List:");
        	console.log(arg);

          	this.checkDirectory(this.localFileList, arg);
         
          });

        if(this.readyToDownload == true){
          clearInterval(checkDownloadState);

          this.downloadIndex = 0;
          this.downloadIncrement();
        }
    }, 60000);
  }

//increments through all the files that need to be downloaded
  downloadIncrement(){
    if(this.downloadIndex < this.downloadQueue.length){//was <= len +1
    	//pause video when downloading
        this.playback("pause");

        this.downloadFiles(this.downloadQueue[this.downloadIndex]);

        this.downloading = true;
    } else {
      /*if all files have been downloaded restart the listener
      to detect remote updates*/
      this.readyToDownload = false;
      
      if(this.downloading == true){
      	this.downloadLog("All downloads completed");
      	this.getAllFileSizes();
      	this.downloading = false;
      }
      
      this.getLocalFiles(this.downloadProcess());
    }
    this.downloadIndex++;
  }

  downloadFiles(name){
    
    this.downloadProcessTicker(true);

    this.writer = this.fs.createWriteStream(this.localDirectory + name, {defaultEncoding:'binary'});

    //this was the old one
    //let VIDEO_URL = this.mediaServer + this.mediaServerDirectory + name;
    console.log("FILE NAME: " + name);
    let VIDEO_URL = this.formatStreamRequest(name);

    this.downloadLog("Fetching from " + VIDEO_URL);

    // Uses fetch instead of XMLHttpRequest to support saving fragments into file as they
    // arrive. XMLHttpRequest will cause device to run out of memory when used with
    // large video files.
    fetch(VIDEO_URL).then((res)=>{
      this.soFar = 0;
      this.downloadLog(res.headers);
      this.contentLength = res.headers.get('Content-Length');
      // Content length might not be known, that is normal.
      if (this.contentLength)
        this.downloadLog("Content length is " + this.contentLength + " bytes");
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
        this.downloadProcessTicker(false);
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
    if (this.contentLength){

    	this.downloadPercent = (this.soFar/this.contentLength*100).toFixed(2);
      this.downloadLog(this.downloadPercent + "% is downloaded " + this.downloadIndex +'/'+this.downloadQueue.length);
    	
    	this.updateDownloadTicker(this.downloadPercent + "% is downloaded " + this.downloadIndex +'/'+this.downloadQueue.length);

    }
    else {
      this.downloadLog(this.soFar + " bytes are downloaded " + this.downloadIndex +'/'+this.downloadQueue.length);
	
   	this.updateDownloadTicker(this.soFar + " bytes are downloaded " + this.downloadIndex +'/'+this.downloadQueue.length);
	}

  }

  updateDownloadTicker(aString){
		this.dTicker.AddString
	}

    //compares remote directory to local directory to create the download queue
  checkDirectory(files, remFiles){
    this.remList  = remFiles ;
    //this.downloadLog('Local Files:');
    //this.downloadLog(files);
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
      if(this.downloadQueue.length > 0){
      	//this.downloadLog("Download Queue:");
      	//this.downloadLog(this.downloadQueue);
      }
      
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

    if(delIt.length > 0){
    	this.downloadLog("Remove Queue:");
    	this.downloadLog(delIt);
    }
    
    return delIt;
  }

  removeFiles(anArray){
  	console.log("removeFiles()");
  	console.log(anArray);
    //synchronously delete old files
    for(let r = 0;r<anArray.length;r++){
      let remPath = this.localDirectory + anArray[r];
      this.fs.unlinkSync(remPath, (err) => {
        if (err) {
            console.log("Failed to delete local file: "+err);
        } else {
            console.log('Successfully deleted local file');                                
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

  /*checkFileSize(){
  	getHTTP(this.formatFileSizeRequest(),);
  }*/

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

	//update clock info
    updateClock() {
    	this.currentTime = Date.now();//Math.floor(Date.now() * 0.001) * 1000;//concactinate seconds
        //let ms = Date.now();
        //let secs = Math.floor(ms / 1000);
        //let dSecs = secs - this.startSecs;
        //console.log(dSecs);
        if(this.schedule && this.currentTime >= this.atThisTime){
        	this.eventEmitter.emit('queue');//trigger event
        	this.schedule = false;
        	console.log("Queued!");
        }

        //console.log(this.currentTime);
    }
		
    initializeClock(){
    	//get the ms offset from an exact second
		this.startMs = Date.now();
        //this.startSecs = Math.floor(this.startMs / 1000);
        this.firstOffset = 1000 - this.startMs % 1000;

        setTimeout(()=> {
	        this.updateClock();
	        this.clocker = setInterval(()=>{this.updateClock()}, 1000);//run tick every second
	    }, this.firstOffset);
    }

    createQueue(qInfo){
    	console.log('got queue');
    	console.log(qInfo);
    	this.queueFile = qInfo[1];
    	if(qInfo[0] == 'now'){
    		this.eventEmitter.emit('queue');//trigger event
    	} else {
			this.atThisTime = qInfo[0];
    		this.schedule = true;
    	}
    }

    sendTimedSync(thisFile, thisTime){
    	this.createQueue([thisTime,thisFile]);
    	let queueInfo = new Object();
		queueInfo['queue'] = thisTime;
		queueInfo['file'] = thisFile;
    	for(let c = 0; c < this.syncGroup.length; c++){
    		if(this.syncGroup[c] != this.myIP){
    			this.postHTTP(queueInfo,"http://"+this.syncGroup[c]+":8000/command");
    			console.log("send sync");
    			//console.log(queueInfo)
    		}
    	}
    }

    sendSync(thisFile){
    	let thisTime = "now";
    	this.createQueue([thisTime,thisFile]);
    	let queueInfo = new Object();
		queueInfo['queue'] = thisTime;
		queueInfo['file'] = thisFile;
    	for(let c = 0; c < this.syncGroup.length; c++){
    		if(this.syncGroup[c] != this.myIP){
    			this.postHTTP(queueInfo,"http://"+this.syncGroup[c]+":8000/command");
    			console.log("send sync");
    			//console.log(queueInfo)
    		}
    	}
    }

//this is the file on the local BS device. See the API for getting the file size on the media server
    getFileSizeInBytes(filename) {
    	let stats = this.fs.statSync(this.localDirectory + filename)
    	//console.log(stats);
    	let fileSizeInBytes = stats["size"]
	    return fileSizeInBytes
	}

//this is the file on the local BS device. See the API for getting the file size on the media server
	getAllFileSizes(){
		this.localFileBytes = [];

		for (let gB = 0; gB < this.localFileList.length; gB++){
			this.localFileBytes.push(this.getFileSizeInBytes(this.localFileList[gB]));
		}

		console.log(this.localFileBytes);

	}

	createTask(timing, callback){
		this.task = this.cron.schedule(timing, () => {
    		console.log("Cron Job: " + Date.now());
		    callback();
		  });
	}

	stopTask(){
		this.task.stop();
	}

	destroyTask(){
		this.task.destroy();
	}

}