let requestURL = window.location.protocol + "//" + window.location.host;

console.log(requestURL);

let jsonEndpoint = '/node/deviceInfo.json';

let request = new XMLHttpRequest();

let refreshRate = 3 * 60 * 1000;

let devData;

let Global = new GlobalCommands();

let minuteWindow = 3;//threshhold for a time to be considered up to date
let currentTime;

let classNames = ['green','yellow','red'];

let allIP = [];

refreshData();

//check data every minute
window.setInterval(refreshData, refreshRate);

function refreshData(){
  console.log('refreshed');

  request.open('GET', requestURL + jsonEndpoint);
  request.responseType = 'json';
  request.send();

  request.onload = function() {
    devData = request.response;
    showData(devData);
    //showData(devData);
  }
}

function showData(rawJsonObj) {

  jsonObj = sortObjects(rawJsonObj);

	console.log(jsonObj);

  currentTime = Date.now();

	let devList =  document.getElementById("bsList");

  let amtFresh = 0;
  // As long as <ul> has a child node, remove it
  while (devList.hasChildNodes()) {  
    devList.removeChild(devList.firstChild);
  } 

//loop through data for each device
	for (let j =0;j<jsonObj.length;j++){
		let myH1 = document.createElement('h3');

    myH1.className = classNames[checkFreshness(jsonObj[j][Object.keys(devData[j])]['time'])];

    if(myH1.className == 'yellow' || myH1.className == 'green'){
      amtFresh++;
    }

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
        //add the ip to the list while we're at it
        Global.ipList(jsonObj[j][Object.keys(devData[j])][devKeys[o]]);
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
                
                //target to blank
                myA.target = "_blank";  
                // Append the anchor element to the body. 
                myLi.appendChild(myA);  

			} else {
				myLi.textContent = devKeys[o] + ": " + jsonObj[j][Object.keys(devData[j])][devKeys[o]];
			}
			myL.appendChild(myLi);
		}

		devList.appendChild(myL);
	}

  devAmount(amtFresh);
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

function sortObjects(unsortedObj){
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  let sort = urlParams.get('sort');

  console.log(sort);

  let sortVal;

  if(sort == "serial"){
    return Object.keys(unsortedObj).sort().reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  } else{
    return unsortedObj.sort(function(a, b){return a[sort] - b[sort]}); 
  }
}
/*
function sortObj(obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
}*/

/*****drop down menu stuff ****/
function dropdown() {
  document.getElementById("dropdownList").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

function devAmount(anAmount){
  let amount = document.getElementById("amount");

  amount.innerHTML = "Devices detected in the last 10 minutes: " + anAmount;
}