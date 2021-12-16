/*
To do:
This script can be simplified significantly now that is makes 1 call for the config file, so many of the individual calls are redundant
There is also redundancy in some of the posting stuff...
*/

let PORT = 8000;
let HOST = window.location.hostname;

let vol, volVal, title;

let bytes = [];

let dims = {};

window.onload = function(){
  vol = document.getElementById("volume");
  volVal = document.getElementById("volVal");
  fileN = document.getElementById("fileName");
  title = document.getElementById("title");
  api = document.getElementById("apiVersion");
  
  sendGet("bytes");

  //retrieve stored volume value
  sendGet("volume");
  
  //retrieve file name
  sendGet("file");
  sendGet('id');

  sendGet('api');

  sendGet('vidInfo');

  sendGet('syncInfo');

  sendGet('duration');

  sendGet('config');

  // Update the volume when the slider is released
  vol.onmouseup = function() {
    //console.log(this.value);
    packagePost("volume", this.value, "command");
  }

  //update the volume text as slider is moved 
  vol.oninput = function(){
    volVal.innerHTML = "Volume: " + this.value;
  }

/*********seek form handling***************/

 const seekForm = document.getElementById("seekForm");

  seekForm.addEventListener('submit', e => {
    // e.preventDefault() stops normal form .submission
    e.preventDefault()

    //note that this doesn't technically require a restart - the download process could just be triggered...
      const formData = new FormData(e.target);
      let postEndpoint = "http://"+HOST+":"+PORT+"/command";

      //note that this doesn't actually use the submitted form data, it just uses the form submitted event
      let jsonData = JSON.stringify({"seek" :formData.get("seek")})
      //console.log(jsonData)
      sendPost(jsonData, postEndpoint, 'json');
  });

/*********media content sync form handling***************/
  const syncContentForm = document.getElementById("syncContentForm");

  syncContentForm.addEventListener('submit', e => {
    // e.preventDefault() stops normal form .submission
    e.preventDefault()

    //note that this doesn't technically require a restart - the download process could just be triggered...
  let c = confirm("Updating content syncronization mode requires a restart:");
  if (c==true){

      const formData = new FormData(e.target);
      let postEndpoint = "http://"+HOST+":"+PORT+"/command";

      //note that this doesn't actually use the submitted form data, it just uses the form submitted event
      let jsonData = JSON.stringify({"syncContent" : document.getElementById('syncContent').checked /*formData.get("syncContent")*/})
      //console.log(jsonData)
      sendPost(jsonData, postEndpoint, 'json');
    }
  });

/*********playback sync form handling***************/
  const syncForm = document.getElementById("syncForm");

  syncForm.addEventListener('submit', e => {
    // e.preventDefault() stops normal form .submission
    e.preventDefault()
    const formData = new FormData(e.target);


    let c = confirm("Updating playback mode requires a restart:");
    if (c==true){

    /*  let jsonData = JSON.parse('{"role" : "","ipList" : "","cronString" : ""}')

      jsonData['role'] = formData.get("role")
      jsonData["ipList" ] = formData.get("ipList")*/
      /*jsonData['cronString'] = formData.get("cronString")*/

      let jsonData = JSON.stringify({"role" : formData.get("role") ,"group" : formData.get("sGroup"),"leader" : formData.get("sLeader")})

      let postEndpoint = "http://"+HOST+":"+PORT+"/sync";

      sendPost(jsonData, postEndpoint, 'json');
    }
  });

}

function updateVolumeGUI(vVal){
  vol.value = parseInt(vVal); // Get the volume slider value
  volVal.innerHTML = "Volume: " + vVal;
}

function updateFileName(fName){
  fileN.innerHTML = "Files:";

  let oL = document.createElement('ol');
  //loop through all the files
  for(let fn = 0; fn < fName.length;fn++){
    let myLi = document.createElement('li');
    let myA = document.createElement("a");
    //myA.onclick = packagePost('file', fName[fn], "command");
    let myLink = document.createTextNode(fName[fn] + " " + bytes[fn] + " bytes");               
    // Append the text node to anchor element. 
    myA.appendChild(myLink);     
    // Set the title. 
    myA.title = fName[fn];     
    // Set the href property. 
    myA.href = "javascript:packagePost('file','"+fName[fn]+"', 'command')";     
    // Append the anchor element to the body. 
    myLi.appendChild(myA);  
    oL.appendChild(myLi);
  }
  fileN.appendChild(oL);
}

function updateTitle(t){
  //add id to header title
  title.innerHTML = (title.innerHTML + " " + t);

  //add id to device info section
  let devID = document.getElementById("deviceID");
  devID.innerHTML = (devID.innerHTML + " " + t);
}

function updateAPI(v){
    api.innerHTML = (api.innerHTML + " " + v);
}

function updateVidDims(o){
  console.log(o);

  dims = o;

  outputMode = document.getElementById("vidOutputMode");
  activeMode = document.getElementById("activeMode");
  fileDim = document.getElementById("vidFileDim");
  outputDim = document.getElementById("vidOutputDim");
  outputDeviceDim = document.getElementById("vidOutputDeviceDim");

  outputMode.innerHTML = outputMode.innerHTML + " " + dims.mode;
  activeMode.innerHTML = activeMode.innerHTML + " " + dims.activeMode.modeName;
  //fileDim.innerHTML = fileDim.innerHTML + " " + dims.file;
  outputDim.innerHTML = (outputDim.innerHTML + " " + dims.output.width + " x " + dims.output.height);
  outputDeviceDim.innerHTML = outputDeviceDim.innerHTML + " " + dims.bestMode;

}

function updateSyncInfo(s){
  //console.log(s);

  if(s.mode == 'normal'){
    sMode = document.getElementById("normal");
    sMode.checked = true;
  } else if (s.mode == 'leader'){
    sMode = document.getElementById("leader");
    sMode.checked = true;
  } else if (s.mode == 'follower'){
    sMode = document.getElementById("follower");
    sMode.checked = true
  }

  sGroup = document.getElementById("sGroup");
  sGroup.value=s.group;

  sLeader = document.getElementById("sLeader");
  sLeader.value=s.leader;
}

function updateDuration(d){
  let fileDuration = document.getElementById("duration");

  fileDuration.innerHTML = (d + " ");
}

function updateConfig(conf){

  //network info
  let mI = document.getElementById("myIP");
  mI.innerHTML = (mI.innerHTML + " " + conf.ip);

  let iM = document.getElementById("ipMode");
  iM.innerHTML = (iM.innerHTML + " " + conf.ip_mode);

  let nM = document.getElementById("netMask");
  nM.innerHTML = (nM.innerHTML + " " + conf.netmask);

  let gw = document.getElementById("gateway");
  gw.innerHTML = (gw.innerHTML + " " + conf.gateway);

  //inputs
  let gpio = document.getElementById("gpioStatus");
  gpio.innerHTML = (gpio.innerHTML + " " + conf.gpio);

  //content sync
  document.getElementById("syncContent").checked = conf.media_sync;
}

/****BUTTONS**********/
function confirmReboot() {
    let c = confirm("confirm reboot:");
    if (c==true){
      //console.log("rebooting!");
      packagePost("comm","reboot", "command");
    }
}

function newScreen(){
  sendGet("screen");
}

function displayIP(){
  packagePost("comm","ip", "command");
}

function playback(arg){
  packagePost("playback",arg, "command");
}

function syncUp(){
  sendGet("syncCommand");
}

//package the message if needed
function packagePost(aType, aMess, anEndPoint){
  console.log(aType + " : " + aMess);

  let dst = "http://"+HOST+":"+PORT+"/" + anEndPoint
  let content = JSON.stringify({
    [aType] : aMess})

  sendPost(content, dst, 'json');
}

//send the message
function sendPost(content, dst, header){
  
  let xhr = new XMLHttpRequest();
  xhr.open("POST", dst, true);
  if(header == 'json'){
    xhr.setRequestHeader('Content-Type', 'application/json');
  }
  xhr.send(content);

  xhr.onreadystatechange = function(){
    if(this.readyState == 4 && this.status==200){
      let resText = xhr.responseText;
      console.log(resText);
    }
  }
}

//send the message
function sendPostOLD(aType, aMess){
  console.log(aType + " : " + aMess);

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "http://"+HOST+":"+PORT+"/command", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    [aType] : aMess})
  );

}

function sendGet(endPoint){
  const Http = new XMLHttpRequest();
  Http.open("GET", "http://"+HOST+":"+PORT+"/"+endPoint);
  Http.send();

  Http.onreadystatechange = function(){
    if(this.readyState == 4 && this.status==200){

      let resObj = JSON.parse(Http.responseText);
      console.log(resObj);
      //console.log(Http.responseText);

      if(Object.keys(resObj)[0]=="volume"){
        updateVolumeGUI(resObj.volume);
      } else if (Object.keys(resObj)[0]=="file"){
        updateFileName(resObj.file);
      } else if (Object.keys(resObj)[0]=="screen"){
        //refresh the page with new image
        location.reload();
      } else if (Object.keys(resObj)[0]=="id"){
        updateTitle(resObj.id);
      } else if (Object.keys(resObj)[0]=="api"){
        updateAPI(resObj.api);
      } else if (Object.keys(resObj)[0]=="bytes"){
        bytes = resObj.bytes;
      } else if (Object.keys(resObj)[0]=="vidInfo"){
/*        updateVidOutput(JSON.stringify(resObj.vidOutput));*/
        updateVidDims(resObj.vidInfo);
      } else if (Object.keys(resObj)[0]=="syncInfo"){
        updateSyncInfo(resObj.syncInfo);
      } else if (Object.keys(resObj)[0]=="duration"){
        updateDuration(resObj.duration);
      }  else if (Object.keys(resObj)[0]=="config"){
        updateConfig(resObj.config);
      } 
    }
  }
}