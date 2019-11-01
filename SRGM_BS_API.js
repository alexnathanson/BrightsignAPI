/*this api combines elements of Node JS, Brightsign JS API, Brightscript-JavaScript Objects,
and Brightscript via UDP to create a more complete functional API with consistant syntax*/

class SRGM_BS_API{
	constructor(){

		/*******BS-JS API******************************************************/

		//https://docs.brightsign.biz/display/DOC/system
		this.systemClass = require("@brightsign/system");
		this.system = new systemClass();
	
		/*******BS-JS OBJECTS*************************************************
		BS-JS Objects are supposedly being replaced with the BS-JS API,
		are still being offerred for backwards compatibility purposes*/

		//https://docs.brightsign.biz/display/DOC/BSDeviceInfo
		this.deviceInfo = new BSDeviceInfo();
	}

	initialize(){

	}

	parseConfig(){
		fs.readdir(localDirectory, function (err, files) {
		    //handling error
		    if (err) {
		        return indexLog('Unable to scan directory: ' + err);
		    } else {
		      checkDirectory(files);
		    }
		});
	}

	reboot(){
		this.system.reboot();
	}
}