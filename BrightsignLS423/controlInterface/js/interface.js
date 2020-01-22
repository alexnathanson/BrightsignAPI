let PORT = 8000;
let HOST = window.location.hostname;

let vol, volVal;

window.onload = function(){
  vol = document.getElementById("volume");
  volVal = document.getElementById("volVal");
  fileN = document.getElementById("fileName");

  //retrieve stored volume value
  sendGet("volume");
  
  //retrieve file name
  sendGet("file");

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
  fileN.innerHTML = "File: " + fName;
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
        updateFileName(resObj.file[0]);
      } else if (Object.keys(resObj)[0]=="screen"){
        //refresh the page with new image
        location.reload();        } 
    }
  }
}