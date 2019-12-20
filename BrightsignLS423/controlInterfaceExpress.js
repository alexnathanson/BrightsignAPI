
let express    =    require('express');
let app        =    express();
let bodyParser     =         require("body-parser");

app.use(express.static('/storage/sd/controlInterface'));

//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/controlInterface/css'));
app.use('/js', express.static(__dirname + '/controlInterface/js'));
app.use('/images', express.static(__dirname + '/controlInterface/images'));

let server     =    app.listen(8000,function(){
    console.log("We have started our server on port 8000");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*app.get('/',function(req,res){
  res.sendfile("/storage/sd/controlInterface/index.html");
});*/

app.post('/command',function(req,res){
  recMessage(req.body.comm);

  res.end("yes");
});

function recMessage(message){
  console.log("received message!");

  if (message == "reboot"){
    BS.reboot();
  } else if (message == "screen"){
    BS.asyncScreenShot();
  } else if (message == "ip"){
    BS.hideIP();
  }
}