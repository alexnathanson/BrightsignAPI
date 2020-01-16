
let express    =    require('express');
let app        =    express();
let bodyParser     =         require("body-parser");

let ipBool = false;

let v = {volume: getValue('volume')};
let f = {file: getValue('volume')};

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

app.get('/volume',function(req,res){

  v = {volume: getValue('volume')};
  res.send(v);
});

app.get('/file',function(req,res){

  f = {file: dirList.list[0]};
  res.send(f);
});

app.post('/command',function(req,res){
  console.log(req.body);

  if(Object.keys(req.body)[0] == "volume"){
    setVolume(req.body.volume);
  } else if (Object.keys(req.body)[0] == "comm"){
    recCommand(req.body.comm);
  }
  //res.end("yes");
});

function recCommand(message){
  console.log("received command!");

  if (message == "reboot"){
    BS.reboot();
  } else if (message == "screen"){
    BS.asyncScreenShot();
  } else if (message == "ip"){
    if(ipBool == false){
      BS.hideIP();
    } else if (ipBool == true){
      BS.showIP();
    }
    ipBool = !ipBool;
  }
}