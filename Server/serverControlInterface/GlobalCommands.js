class GlobalCommands{
	
	constructor(){
		this.serverIP = "172.16.0.4";
		this.globalEndpoint = "/node/deviceInfo/checkin/global";
		this.allIP = [];
	}

	ipList(addr){
	  this.allIP.push(addr);
	}
	//send commands to all connected devices
	batchCommand(dst){
	  for (let g = 0; g < this.allIP.length; g++){
	    //callback(this.allIP[g]);
	    this.sendGlobalPost(dst, aHost);
	  }
	}
		//show IPs on all connected screens for 30 seconds
	/*ipFreely(aHost){
	  //console.log('ip freely');
	  this.sendGlobalPost("ip", aHost);
	}

	reboot(aHost){
	  this.sendGlobalPost("reboot",aHost);
	}

	mute(aHost){
		this.sendGlobalPost("mute",aHost);
	}

	unmute(aHost){
		this.sendGlobalPost("unmute", aHost);
	}

	hide(aHost){
	  this.sendGlobalPost("hide", aHost);
	}

	show(aHost){
	  this.sendGlobalPost("show", aHost);
	}


	ipToggle(aHost){
	  this.sendPost("comm",aHost,"ip");
	}

	scene(aHost){
	  this.sendPost("comm",aHost, "");
	}*/

	//send the message
	sendGlobalPost(aType, aMess){
	  console.log(aType + " : " + aMess);

	  let xhr = new XMLHttpRequest();
	  xhr.open("POST", "http://" + serverIP +":80" + this.globalEndpoint, true);
	  xhr.setRequestHeader('Content-Type', 'application/json');
	  xhr.send(JSON.stringify({
	    [aType] : aMess})
	  );
	}
}