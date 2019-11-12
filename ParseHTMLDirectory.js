//parses the HTML get request for the files names
// XMLHttpRequest reference https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getResponseHeader

class HTMLDirectory{
	constructor(tempIP,tempDirectory,tempCallback){
		this.ip = tempIP;
		this.directory = tempDirectory;
		this.path = this.ip + this.directory;
		this.list = [];
		this.log = false;
		this.callback = tempCallback;
	}

	getDir(){
	  let client = new XMLHttpRequest();
	  client.responseType = 'text';
	  client.open("GET", this.path, true);

	  client.send();

	  //the arrow functions maintains the scope
	  client.onreadystatechange =()=>{
	  	if(client.readyState === 4 && client.status === 200) {
		    this.logToConsole(client);
		    this.parseList(client.responseText,this.callback);
		  }
	  };
	}
	parseList(arg, callback){
		this.list = [];
		let fileList=arg.split('\n');
		for(let i=0;i<fileList.length;i++){
			//check if the item contains a HREF tag
			if(fileList[i].includes('HREF')){
				let fileInfo=fileList[i].split('\"');
			    for(let f = 0; f<fileInfo.length;f++){
			    	if(fileInfo[f].includes(this.directory)){
			    		let len = this.directory.length;
			    		this.list.push(this.addSpace(fileInfo[f].slice(len,fileInfo[f].length)));
			    	}
			    }
			}
		}
		this.logToConsole(this.list);
		//callback(this.callback);
			
		callback();
	}

	addSpace(aString){
	  //replace %20 with spaces in files names
	  let splitString = aString.split('%20');
	  let spacedString = "";
	  for(let s=0;s< splitString.length;s++){
	    if(s!=0){
	      spacedString +=" ";
	    }
	    spacedString+= splitString[s];
	  }
	  return spacedString;
	}

	logToConsole(arg){
		if(this.log == true){
			console.log(arg);
		}
	}
}