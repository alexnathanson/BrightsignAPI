let express    =    require('express');
let app        =    express();

app.use(express.static('/storage/sd/controlInterface'));

//make way for some custom css, js and images
app.use('/css', express.static(__dirname + '/controlInterface/css'));
app.use('/js', express.static(__dirname + '/controlInterface/js'));
app.use('/images', express.static(__dirname + '/controlInterface/images'));

/*app.get('/',function(req,res){
    res.send(controlInterface/index.html);
});*/

var server     =    app.listen(8000,function(){
    console.log("We have started our server on port 8000");
});