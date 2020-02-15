class GlobalCommands{
	
	constructor(){
		this.serverIP = "172.16.0.4";
		this.globalEndpoint = "/node/deviceInfo/checkin/global";
		this.allIP = [];
		this.syncGroups = {3:"172.16.0.110"};
	}

	ipList(addr){
	  this.allIP.push(addr);
	}
	//send commands to all connected devices
	batchCommand(dst){
	  for (let g = 0; g < this.allIP.length; g++){
	    //callback(this.allIP[g]);
	    this.sendGlobalPost(dst, this.allIP[g]);
	  }
	}

	sync(syncGroup){
		this.sendGlobalPost("sync",this.syncGroups[syncGroup]);
	}

	//send the message
	sendGlobalPost(aType, aMess){
	  console.log(aType + " : " + aMess);

	  let xhr = new XMLHttpRequest();
	  xhr.open("POST", "http://" + this.serverIP +":80" + this.globalEndpoint, true);
	  xhr.setRequestHeader('Content-Type', 'application/json');
	  xhr.send(JSON.stringify({
	    [aType] : aMess})
	  );
	}
}