
/*
this class combines Brightsign JS API, Brightscript-JavaScript Objects,
and Node JS modules to create a more complete functional API with consistant syntax.
*/

class BS_API{
	constructor(){
		this.api = '0.0.1'; //version
		this.configDict = {};

	/*******BS-JS API******************************************************/

		//https://docs.brightsign.biz/display/DOC/system
		this.SystemClass = require("@brightsign/system");
		this.system = new this.SystemClass();

		//https://docs.brightsign.biz/display/DOC/screenshot
		this.ScreenshotClass = require("@brightsign/screenshot");
		this.screenshot = new this.ScreenshotClass();
		//this.screenshotParams = {"fileName":"SD:/screenshots/screenshot.jpg","quality":75};

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

  		//https://nodejs.org/api/dgram.html
		this.dgram = require('dgram');
		this.socket = this.dgram.createSocket('udp4');
		this.sendPort = 13131;
		this.dgramMessage = 'abc';
	}

	initialize(configDictionary){
		console.log('initializing BS API');
		console.log(configDictionary);

		this.displayIP = configDictionary.displayIP;
		console.log(this.displayIP);
		this.ticker.AddString(this.myIP);

		if(!this.displayIP){
			this.hideIP();
		}

		if(configDictionary.gpio){
			this.gpio = new BSControlPort("Expander-0-GPIO");
		}

		//this.setGPIOEventCallbacks();
		//this.asyncScreenShot();
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
		//this.screenshot.takeAsyncScreenshot(screenshotParams);
		setInterval(this.screenshot.takeAsyncScreenshot(screenshotParams), 10000);
	}

	dgramSend(aMessage){
		this.socket.send(Buffer.from(aMessage), this.sendPort, 'localhost'); 
	}

	showIP(){
		this.ticker.SetRectangle(this.tickerX,this.tickerY, this.tickerW,this.tickerH)
	}
	hideIP(){
		//hides the ticker offscreen. not sure how to fully remove it
		this.ticker.SetRectangle(-100,-100,1,1)
	}
}