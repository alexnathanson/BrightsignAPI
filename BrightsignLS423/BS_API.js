
/*
this class combines Brightsign JS API, Brightscript-JavaScript Objects, Node JS modules, and additional custom code to create a more complete functional API with consistant syntax.
*/

class BS_API{
	constructor(){
		this.api = '0.0.1'; //version
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

  	/*******NODE JS Modules******************************************************/
  		this.os = require( 'os' );
		this.networkInterfaces = this.os.networkInterfaces( );
  		this.myIP= this.networkInterfaces.eth0[0]['address'];
  		this.myMAC = this.networkInterfaces.eth0[0]['mac'];

  		//https://nodejs.org/api/dgram.html
		this.dgram = require('dgram');
		this.socket = this.dgram.createSocket('udp4');
		this.sendPort = 13131;
		this.dgramMessage = 'abc';
		this.receiver = this.dgram.createSocket('udp4');
		this.mediaEndFlag = false;

	/******Post Device Info******************/
		this.postInterval = 2 * 60000;//2 minutes * 60000 to convert to unix time
		//this.postURL = 'node/deviceInfo/checkin/ip';//this should be simplified to be called from the config file directly
		this.postTime = Date.now() - this.postInterval;

	/*****Config File***********************/
		this.logC = true;
		this.nodeFS = require('fs');
		this.configFileName = 'config.txt';
		this.configFilePath = this.localDirectory + this.configFileName;
		this.configString = "";
		this.configDict = {};
		this.newLine = "";
		this.persist = true;
	}

	initialize(callback){
		console.log('initializing BS API');
		//this.loadConfig();//formerly had a call back to configured()
		console.log(this.configDict);

		this.displayIP = this.configDict.displayIP;
		//this.postURL = this.configDictionary.postURL;
		
		this.ticker.AddString(this.myIP);

		if(!this.displayIP){
			this.hideIP();
		}

		if(this.configDict.gpio){
			this.gpio = new BSControlPort("Expander-0-GPIO");
		}

		//this.setGPIOEventCallbacks();
		this.asyncScreenShot();

		this.postInfo();

		callback();

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

	//for receiving event data back from the autorun script
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
		  console.log(`server listening ${address.address}:${address.port}`);
		});

		this.receiver.bind(31313);
	}

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
	}

	setVolume(arg){
		this.dgramSend("volume " + arg);
	}

	maskIt(aBool){
		this.dgramSend("mask " + aBool);
	}

	/******Post Device Info to Remote Server******************/
	postInfo(){
		//posts the mac address, ip address, first file, and timestamp to the server
		if(this.postTime + this.postInterval < Date.now()){
		    //package the device info into a JSON
		    let devInfo = new Object();
		    devInfo[this.deviceInfo.deviceUniqueId] = {};
		    devInfo[this.deviceInfo.deviceUniqueId].mac = this.myMAC;
		    devInfo[this.deviceInfo.deviceUniqueId].ip = this.myIP;
		    devInfo[this.deviceInfo.deviceUniqueId].file = this.localFileList[0];
		    devInfo[this.deviceInfo.deviceUniqueId].time = Date.now();

		  	this.postHTTP(devInfo, this.configDict.postURL);
		    this.postTime  = Date.now();
		}
	}

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

/*****************Control Interface Server***********************/


/********** Config File*************************/
	loadConfig(callback){//formerly had a callback
		  this.logConfig('parsing: ' + this.configFilePath);
		  this.nodeFS.readFile(this.configFilePath,'utf8', (err, file)=> {
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
		this.nodeFS.writeFile(this.configFilePath, this.configString, 'utf8', (err)=> {
		    if (err) return console.log(err);
		     // success case, the file was saved
	    	this.logConfig(this.configFilePath + ' saved!');
		 });
 		}

 		this.configDict[aKey]=aValue;
	}

	logConfig(toLog){
		if(this.logC){
			console.log(toLog);
		}
	}
}