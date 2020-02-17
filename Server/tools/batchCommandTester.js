const http = require('http')

let targetDevices = ["172.16.1.160"/*"172.16.1.83","172.16.1.73","172.16.1.87"*/];

/*for (let e = 0;e<targetDevices.length;e++){

	//sendPost('file','switch',targetDevices[e]);
	sendPost('scene','2',targetDevices[e]);
}*/

for (let e = 0;e<targetDevices.length;e++){

	//sendPost('file','switch',targetDevices[e]);
	sendPost('mute',"1",targetDevices[e]);
	console.log("posted");
}

//send the message
function sendPost(aType, aMess, anIp){

	let data = JSON.stringify({
	  [aType]: aMess
	})
	console.log(data);

	let options = {
	  hostname: anIp,
	  port: 8000,
	  path: '/command',
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': data.length
	  }
	}

	const req = http.request(options, res => {
	  console.log(`statusCode: ${res.statusCode}`)

	  res.on('data', d => {
	    process.stdout.write(d)
	  })
	})

	req.on('error', error => {
	  console.error(error)
	})

	req.write(data)
	req.end()

}


function sendGet(dst, callback){

  http.get(dst, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data));
    });

    resp.on("error", (err) => {
      console.log("Error: " + err.message);
    });
  });
}