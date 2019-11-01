/*
this class combines Brightsign JS API, Brightscript-JavaScript Objects,
and (in the future) Brightscript interaction via UDP to create
a more complete functional API with consistant syntax.

Usefule Node JS modules are not presently included here
*/

class BS_API{
	constructor(){
		this.api = '0.0.1'; //version
		this.configDict = {};

	/*******BS-JS API******************************************************/

		//https://docs.brightsign.biz/display/DOC/system
		this.systemClass = require("@brightsign/system");
		this.system = new this.systemClass();
	
	/*******BS-JS OBJECTS*************************************************
		BS-JS Objects are supposedly being replaced with the BS-JS API,
		but are still being offerred for backwards compatibility purposes*/

		//https://docs.brightsign.biz/display/DOC/BSDeviceInfo
		this.deviceInfo = new BSDeviceInfo();

		//https://docs.brightsign.biz/display/DOC/BSControlPort#BSControlPort-Examples
		//using the equivalent GPIO object in brightscript can cause unpredictable GPIO behaviour
		this.gpio = new BSControlPort("BrightSign");
		this.gpioEventCallbacks = [];
  
	}

	parseConfig(){
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

	setGPIOEventCallbacks(){

	}
}