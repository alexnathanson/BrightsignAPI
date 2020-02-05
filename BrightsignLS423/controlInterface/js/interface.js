let PORT = 8000;
let HOST = window.location.hostname;

let vol, volVal, title;

window.onload = function(){
  vol = document.getElementById("volume");
  volVal = document.getElementById("volVal");
  fileN = document.getElementById("fileName");
  title = document.getElementById("title");
  api = document.getElementById("apiVersion");
  //retrieve stored volume value
  sendGet("volume");
  
  //retrieve file name
  sendGet("file");

  sendGet('id');

  sendGet('api');

  // Update the volume when the slider is released
  vol.onmouseup = function() {
    //console.log(this.value);
    sendPost("volume", this.value);
  }

  //update the volume text as slider is moved 
  vol.oninput = function(){
    volVal.innerHTML = "Volume: " + this.value;
  }
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
    //myA.onclick = sendPost('file', fName[fn]);
    let myLink = document.createTextNode(fName[fn]);               
    // Append the text node to anchor element. 
    myA.appendChild(myLink);     
    // Set the title. 
    myA.title = fName[fn];     
    // Set the href property. 
    myA.href = "javascript:sendPost('file','"+fName[fn]+"')";     
    // Append the anchor element to the body. 
    myLi.appendChild(myA);  
    oL.appendChild(myLi);
  }
  fileN.appendChild(oL);
}

function updateTitle(t){
    title.innerHTML = (title.innerHTML + " " + t);
}

function updateAPI(v){
    api.innerHTML = (api.innerHTML + " " + v);
}


/****BUTTONS**********/
function confirmReboot() {
    let c = confirm("confirm reboot:");
    if (c==true){
      //console.log("rebooting!");
      sendPost("comm","reboot");
    }
}

function newScreen(){
  sendGet("screen");
}

function displayIP(){
  sendPost("comm","ip");
}

function playback(arg){
  sendPost("playback",arg);
}

//send the message
function sendPost(aType, aMess){
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
      } 
    }
  }
}