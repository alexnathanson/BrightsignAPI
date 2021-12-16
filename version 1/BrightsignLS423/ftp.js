/*https://www.npmjs.com/package/ftp*/


let localDir = "/storage/sd/";

let remoteDST = "192.168.1.231"

console.log("FTP!")

/*Get a directory listing of the current (remote) working directory:
*/

let Client = require('ftp');
 
let c = new Client();
c.on('ready', function() {
c.list(localDir, function(err, list) {
	  if (err) throw err;
	  console.dir(list);
	  c.end();
	});
});
// connect to localhost:21 as anonymous
c.connect(remoteDST);


 /*Download remote file 'foo.txt' and save it to the local file system:
*/

/*var Client = require('ftp');
  var fs = require('fs');
 
  var c = new Client();
  c.on('ready', function() {
    c.get('foo.txt', function(err, stream) {
      if (err) throw err;
      stream.once('close', function() { c.end(); });
      stream.pipe(fs.createWriteStream('foo.local-copy.txt'));
    });
  });
  // connect to localhost:21 as anonymous
  c.connect();*/