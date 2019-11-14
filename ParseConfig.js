class ParseConfig{
	constructor(tempConfigFilePath){
		this.logC = true;
		this.nodeFS = require('fs');
		this.configFilePath = tempConfigFilePath;
		this.configString = "";
		this.configDict = {};
		this.newLine = "";
		this.persist = true; //save changes so they persist
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

	        		//convert strings to booleans
	        		if(rowArray[1] == 'true' || rowArray[1] == 'false' ){
	        			rowArray[1]=(rowArray[1]=='true')
	        		}
	        		this.configDict[rowArray[0]]=rowArray[1];
	        	}
	        });

	        this.logConfig(this.configDict);
	        callback();
	      }
	  });
	}

	getValue(aKey){
	  return this.configDict[aKey];
	}

	//args: a key/value pair and a boolean. if boolean is true, it saves the changes so they persist
	setValue(aKey, aValue){

	  if(this.persist){

	  	this.newLine = aKey + ' = ' + aValue;

		this.configString = this.configString.replace(aKey+' = '+this.configDict[aKey], this.newLine);

		//the arrow function is necessary because the asynchronous writeFile method would change the scope without it
		this.nodeFS.writeFile(this.configFilePath, this.configString, 'utf8', (err)=> {
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