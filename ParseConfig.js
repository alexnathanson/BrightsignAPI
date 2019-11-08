class ParseConfig{
	constructor(tempConfigFilePath){
		this.logC = true;
		this.nodeFS = require('fs');
		this.configFilePath = tempConfigFilePath;
		this.configString = "";
		this.configDict = {};
		//this.callback = tempCallback;
	}

	loadConfig(callback){
	  this.logConfig('parsing: ' + this.configFilePath);
	  this.nodeFS.readFile(this.configFilePath,'utf8', (err, file)=> {
	      //handling error
	      if (err) {
	          return console.log('Unable to read config file: ' + err);
	      } else {
	        //do something with the file
	        //this.logConfig(typeof file);
	        this.configString = file;
	        this.logConfig(this.configString);
	        //split config file by line
	        let configFileRows   = this.configString.split('\n');

	    	//iterate through each line
	        configFileRows.forEach((aRow)=>{
	        	//if the row isn't commented out

	        	if(!aRow.includes('#')&&aRow!=""&&aRow!="\n"){
	        		let rowArray = aRow.split(' = ');
	        		this.configDict[rowArray[0]]=rowArray[1];
	        	}
	        });

	        this.logConfig(this.configDict);
	        callback();
	      }
	  });
	}

	getValue(aKey){
	  let theValue = this.configDict[aKey];
	  return theValue;
	}

	//args: a key/value pair and a boolean. if boolean is true, it saves the changes so they persist
	setValue(aKey, aValue,persist){

	  if(persist){

	  	let newLine = aKey + ' = ' + aValue;

		//nodeFS.readFile(someFile, 'utf8', function (err,data) {

		this.configString = this.configString.replace(/aKey+' = '+this.configDict.aKey/g, newLine);

		this.nodeFS.writeFile(this.configFilePath, this.configString, 'utf8', function (err) {
		    if (err) return console.log(err);
		     // success case, the file was saved
	    	this.logConfig(this.configFilePath + ' saved!');
		 });
 		}

 		this.configDict[aKey]=aValue;

	}

	logConfig(toLog){
		if(this.logC){
			console.log(toLog);
		}
	}
}