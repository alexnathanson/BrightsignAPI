//posts device network info to server

//post ip, mac address, and timestamp
let pHost, pHostPort,devInfo,devIP,devMAC,devID;

let endPoint = 'node/deviceInfo/checkin/ip'

function postIt(){

	pHost = getValue("media_server");
	pHostPort = getValue("ipPostPort");

	devInfo = new Object();

	devIP = BS.myIP;
	devMAC = BS.myMAC;
	devID = BS.deviceInfo.deviceUniqueId;

	createObj();

	sendPost();
}

//package the device info into a JSON
function createObj(){
  	devInfo[devID] = {};
    //devInfo[devID].file = dirList.list[0];//added 1/16
  	devInfo[devID].mac = devMAC;
  	devInfo[devID].ip = devIP;
    devInfo[devID].file = localFileList[0];
  	devInfo[devID].time = Date.now();
  	console.log(typeof devInfo);
  	console.log(devInfo);
}

//send the message
function sendPost(){
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://"+pHost+":"+pHostPort+"/" +endPoint, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(
  	devInfo)
  );

  xhr.onreadystatechange = function (){
    if (this.readyState == 4 && this.status == 200){
      console.log(this.responseText);
    }
  };
}