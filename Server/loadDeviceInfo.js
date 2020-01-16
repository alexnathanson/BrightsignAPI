let requestURL = 'deviceNetworkInfo.json';

let request = new XMLHttpRequest();

request.open('GET', requestURL);
request.responseType = 'json';
request.send();

let devData;
request.onload = function() {
  devData = request.response;
  showData(devData);
  //showData(devData);
}


function showData(jsonObj) {
	console.log(jsonObj);

	let devList =  document.getElementById("bsList");

//loop through data for each device
	for (let j =0;j<jsonObj.length;j++){
		let myH1 = document.createElement('h3');
		myH1.textContent = Object.keys(jsonObj[j])[0];

		devList.appendChild(myH1);

		let myL = document.createElement('ul');

		let devKeys = Object.keys(jsonObj[j][Object.keys(devData[j])])

		for (let o = 0; o < devKeys.length;o++){
			let myLi = document.createElement('li');

			//convert Unix time to human readable time
			if(devKeys[o]=='time'){
				myLi.textContent = devKeys[o] + " " + Unix_timestamp(jsonObj[j][Object.keys(devData[j])][devKeys[o]])
			} else {
				myLi.textContent = devKeys[o] + " " + jsonObj[j][Object.keys(devData[j])][devKeys[o]]
			}
			myL.appendChild(myLi);
		}

		devList.appendChild(myL);
	}
  /*

  const myPara = document.createElement('p');
  myPara.textContent = 'Hometown: ' + jsonObj['homeTown'] + ' // Formed: ' + jsonObj['formed'];
  header.appendChild(myPara);*/
}

function Unix_timestamp(t){
	var dt = new Date(t*1000);
	var hr = dt.getHours();
	var m = "0" + dt.getMinutes();
	var s = "0" + dt.getSeconds();
	return hr+ ':' + m.substr(-2) + ':' + s.substr(-2);  
	}
/*
function showData(jsonObj) {
  const heroes = jsonObj['members'];
      
  for (let i = 0; i < heroes.length; i++) {
    const myArticle = document.createElement('article');
    const myH2 = document.createElement('h2');
    const myPara1 = document.createElement('p');
    const myPara2 = document.createElement('p');
    const myPara3 = document.createElement('p');
    const myList = document.createElement('ul');

    myH2.textContent = heroes[i].name;
    myPara1.textContent = 'Secret identity: ' + heroes[i].secretIdentity;
    myPara2.textContent = 'Age: ' + heroes[i].age;
    myPara3.textContent = 'Superpowers:';
        
    const superPowers = heroes[i].powers;
    for (let j = 0; j < superPowers.length; j++) {
      const listItem = document.createElement('li');
      listItem.textContent = superPowers[j];
      myList.appendChild(listItem);
    }

    myArticle.appendChild(myH2);
    myArticle.appendChild(myPara1);
    myArticle.appendChild(myPara2);
    myArticle.appendChild(myPara3);
    myArticle.appendChild(myList);

    section.appendChild(myArticle);
  }
}*/