/*let socket = new WebSocket("ws://"+window.location.hostname +":8081");

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
}*/

let PORT = 8081;
let HOST = window.location.hostname;
/*
$(document).ready(function(){
  var user,pass;
  $("#submit").click(function(){
    user=$("#user").val();
    pass=$("#password").val();
    $.post("http://localhost:3000/login",{user: user,password: pass}, function(data){
      if(data==='done')
        {
          alert("login success");
        }
    });
  });
});*/

/****BUTTONS**********/
function confirmReboot() {
    let c = confirm("confirm reboot:");
    if (c==true){
      console.log("rebooting!");
      sendMess("reboot");
    }
}

function newScreen(){
  sendMess("screen");
  //refresh the page?
}

function displayIP(){
  sendMess("ip");
}

//send the message
function sendMess(aMess){
  //socket.send(aMess);
  console.log(aMess);

  /*$.post("http://"+HOST+":"+PORT+"/command",{comm: aMess}, function(data){
  if(data==='done')
    {
      console.log("success");
    }
  });*/
}
