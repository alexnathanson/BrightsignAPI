let socket = new WebSocket("ws://"+window.location.hostname +":8081");

// The socket connection needs two event listeners:
socket.onopen = openSocket;
socket.onmessage = showData;

function openSocket() {
    console.log("Socket open");
    socket.send("hello");
  }
 
function showData(result) {
    // when the server returns, show the result in the div:
    console.log(result.data);
  }


function newSocks(){
	socket.send('a');        // send a byte to get new data
}

function confirmReboot() {
    let c = confirm("confirm reboot:");
    if (c==true){
      console.log("rebooting!");
      sendSock("reboot");
    }
}

function newScreen(){
  sendSock("screen");
  //refresh the page?
}

function displayIP(){
  sendSock("ip");
}

function sendSock(aMess){
  socket.send(aMess);
  console.log(aMess);
}
