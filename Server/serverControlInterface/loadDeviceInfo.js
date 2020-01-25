let requestURL = window.location.href;
console.log(requestURL);

let jsonEndpoint = '/node/deviceInfo/deviceInfo.json';

let request = new XMLHttpRequest();

request.open('GET', requestURL + jsonEndpoint);
request.responseType = 'json';
request.send();

let devData;

let minuteWindow = 2;//threshhold for a time to be considered up to date
let currentTime;

let classNames = ['green','yellow','red'];

request.onload = function() {
  devData = request.response;
  showData(devData);
  //showData(devData);
}


function showData(jsonObj) {
	console.log(jsonObj);

  currentTime = Date.now();

	let devList =  document.getElementById("bsList");

//document.getElementById("usernameError").className = "color-red";

//loop through data for each device
	for (let j =0;j<jsonObj.length;j++){
		let myH1 = document.createElement('h3');

    myH1.className = classNames[checkFreshness(jsonObj[j][Object.keys(devData[j])]['time'])];

    myH1.textContent = parseFileName(jsonObj[j][Object.keys(devData[j])]['file']) + " " +Object.keys(jsonObj[j])[0];

		devList.appendChild(myH1);

		let myL = document.createElement('ul');

		let devKeys = Object.keys(jsonObj[j][Object.keys(devData[j])])

		for (let o = 0; o < devKeys.length;o++){
			let myLi = document.createElement('li');

			if(devKeys[o]=='time'){
				//convert Unix time to human readable time
				myLi.textContent = devKeys[o] + ": " + convertTimestamp(jsonObj[j][Object.keys(devData[j])][devKeys[o]])
			} else if (devKeys[o]=='ip'){
				//make it a hyperlink
				myLi.textContent = devKeys[o] + ": ";

				let myA = document.createElement("a");

				let myLink = document.createTextNode(jsonObj[j][Object.keys(devData[j])][devKeys[o]]); 
                  
                // Append the text node to anchor element. 
                myA.appendChild(myLink);  
                  
                // Set the title. 
                myA.title = jsonObj[j][Object.keys(devData[j])][devKeys[o]];  
                  
                // Set the href property. 
                myA.href = "http://" + jsonObj[j][Object.keys(devData[j])][devKeys[o]] + ":8000";  
                  
                // Append the anchor element to the body. 
                myLi.appendChild(myA);  

			} else {
				myLi.textContent = devKeys[o] + ": " + jsonObj[j][Object.keys(devData[j])][devKeys[o]];
			}
			myL.appendChild(myLi);
		}

		devList.appendChild(myL);
	}
  
}

function convertTimestamp(t){
  //console.log(t);
  let dateObj = new Date(t);
  let dateStr = dateObj.toString();

  return dateStr;
	
}

function checkFreshness(t){
  //console.log(t);

  let isFresh = 2;

  currentTime = Date.now();
  //console.log(currentTime);

  if(t !== undefined){
    if (t> currentTime - (minuteWindow * 60000)){
        isFresh = 0;
    } else if (t> currentTime - ((minuteWindow*5) * 60000)){
        isFresh = 1;
    }
  }
  

  return isFresh;
}

function parseFileName(aString){
  let returnThis;

  if (aString == undefined || aString === undefined){
    returnThis = 'Bay unknown';
  } else {
    let parsedName = aString.split("_");

    if(parsedName[0].toLowerCase().includes('bay')){
      returnThis =  parsedName[0];
    } else {
      returnThis = 'Bay unknown';
    }
  }

  return returnThis;
}