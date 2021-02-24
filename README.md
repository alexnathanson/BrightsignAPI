# A more functional Brightsign API

## Overview
<p>This repository combines existing Brightsign APIs and functions to create a more functional and practical system that is more flexible and easier to implement. This provides a wide range of functionality for syncing content remotely, interacting with the brightsign, and trouble shooting, all without using BrightAuthor, because BrightAuthor is annoying and inflexible! This was designed for use with the LS423 model, but should be widely applicable to the most recent generation of Brightsign devices.
</p>

There are three main components to this system.

* The various Brightsign APIs in combination with Node JS, which provides the functionality.
* The server syncing, which is optional
* The HTML web interface and API end points for broader network interactions.

<p>
	Presently, this system works with video files ("MPG","WMV","MOV","MP4","VOB","TS") and MP3 files only. Not WAV files. In the future this functionality could be added via a roAudioPlayer and some logic to seperate out content types.
</p>

![API Illustration](/references/BS_API_illustration_Feb5_2020.jpg)

## Brightsign APIs as a class - BS_API.js
* the BS_API class combines a variety of BS tools with Node modules to create a more complete way to interact with the BS with a standardized syntax

### config file
* can set and get data from config file to ensure persistance

### the autorun.brs file
* roDatagram (UDP) on port 13131 enables the API via Node dgram module to communicate with the hardware.
* Other devices on the network can also communicate on this port if needed.

### media controls and interactivity
* UDP on port 13131
	* playfile syntax: 'file [filename]'
	* volume syntax: 'volume [integer in range 0-100]'
* GPIO
	* Default is set to GPIO Button to pin 0, which will play a random file
	* set gpio = true in the config file
	* GPIO pin out diagrams from https://brightsign.zendesk.com/hc/en-us/articles/218065937-GPIO-Which-pins-correspond-to-which-buttons- located in resources folder.
* HTML Control interface on port 8000
	* must add full node_modules directory + a few other modules to SD card
		* run 'npm install' on your computer and drag the node_modules directory to the SD card
		* could be rewritten with webpack in the future
	* uses PUT method 
* Additional commands can be sent via the Chrome diagnostic console.
	* see below

### Trouble shooting and diagnostic functions
* displays IP address on screen by default
* Chrome diagnostic console on port 3000
	* This only works on certain versions of the Chrome/ Chromium browser. See https://docs.brightsign.biz/display/DOC/HTML+Best+Practices#HTMLBestPractices-ChromiumVersionCompatibility for info on version compatibility.
	* This allows you to see error messages printed to the console and manually work with the BS_API class directly if accessible end points haven't been established.
	* some frequently used commands:
		* restart = BS.reboot()
		* volume = setVolume(an int from 0-100)
		* play a file = playFile('the filename in quotes')
		* turn the mask zone on/off = maskIt(boolean)
* ssh (this must be enable via the config file if needed)
* telnet (this must be enable via the config file if needed)

### multiple zones
* multiple zones for masking/ overlays can be enable via the config file and triggered via the "mask true" UDP message or the maskIt(true) function in the API
* presently the layered zone is a PNG image, but it could easily be changed to a video or other content

### Syncing media content to server directory
* continuously checks server directory for changes
  * server directory is /[deviceID]/media
  * [deviceID] is automatically detected and does not need to be changed by the user
* downloads new files
* deletes old files

### HTML Control Interface
html control interface on port 8000

<p>
The control interface uses a Node Express server (controlInterfaceExpress.js) to serve the files in the controlInterface directory. This script also create the HTTP end points for the api and can be accessed by other devices on the network. Future work should be done to redesign and reorganize these end points.
</p>

### Brightsign Installation Instructions

* update the firmware on the BS
* remove the .example suffix from the config file
* update network info, password, and additional params as necessary in config.txt
* drag all of contents of the BrightsignLS423 directory to the SD card
* if you are not syncing files via the media server, put your media files onto the SD manually.

## Media Server 
The media server is not necessary for the API to run, but adds useful additional functionality. The code included in the server directory will require adapting to your specific server configuration. There are 2 main functions of the media server machine:
* 1) Distribute media content to the media players
* 2) Collect IPs from the media players for API interaction and trouble shooting purposes.
* 3) Interface displaying networked devices with links to API interface for that particular device.
<p>
The server must have a static IP, which must be listed in the BS config file.
</p>

### 1) Media Distribution
The download system on the Brightsign parse the directory on the server via a GET request. No additional code is needed on the server side for the distribution to work.
* This has been tested with a generic Windows IIS setup
* Must enable directory browsing.
* Place media files on server directory named "media" within a directory with the name of the device ID at the root server level.
	* root/[deviceID]/media

### 2) IP Collector
* The brightsign posts its mac address and ip address to the end point specified in postIP.js
* You can setup the end points on the server however you see fit. This repository includes 2 examples you could implement.
	* standalone Node JS app
	* iisnode app (logs available at IPADRRESS/node/deviceInfo/iisnode/)
* Presently global commands sent from the server interface are routed through this script to avoid CORS errors.

### 3) Server Interface
* Displays all the networked devices.
* If the IP collector hasn't be established, you would need to enter the device info manually.
* Presently global commands, like show IPs, are routed through the IP collector script to avoid CORS errors.

## Links
* Brightsign documentation https://docs.brightsign.biz/display/DOC/BrightSign+Documentation

## API Layers

### BS hardware to Node JS via UDP

* play
* pause
* resume
* seek
* duration
* volume
* file FILENAME
* mask
* preload FILENAME SEEKPOINT

### Node JS HTTP Endpoints

GET<br>
Example: http://192.168.1.83:8000/volume<br>

* /volume<br>
	* returns the volume<br>
* /file<br>
	* returns the local file list<br>
* /screen<br>
	* captures a new screenshot<br>
* /id<br>
	* returns the device ID/ serial number<br>
* /api<br>
	* returns the BS_API version number<br>
* /timecode<br>
	* returns the current timecode of the video in ms

POST

* {volume: INT}<br>
* {comm: VALUE}<br>
	* reboot = reboots device<br>
	* ip = toggles ip display<br>
* {playback: VALUE}<br>
	* pause = pauses video<br>
	* play = plays file from position 0<br>
	* resume = plays file from wherever it left off when paused<br>
* {file: FILENAME}<br>
* {queue: MS or "now", file:FILENAME]}<br>
* {triggerSync: [MS,FILENAME]}<br>
* {global: VALUE}<br>
	* ip = toggle IP on for 30 seconds<br>
* {mute: 1 or 0}<br>
	* 1 = mute
	* 0 = unmute

### To add
* Brightsign
	* GET display output info from BS - dims, framerate
	* Create an inteface for syncing - and pass to server interface
	* Fix the media file downloading systems... i.e. confirm file sizes, etc...
	* is the queue post documentation missing a [
	* look in to bundling the node stuff
	* refactor end points for consistency
	* method for reordering files
	* look at how it loops an individual file vs playlist
	* avoid conflicts with server stuff
* Main Server
	* Order the results on the server interface
	* Filter by results by location
	* Filter by freshness
	* Open links in a new tab
	* remove the "sync ramp 3" stuff
	* API should return list of files to avoid directory browsing
	* API should coordinate/ ensure full file is transferred - download feedback?
	* better documentation for server side stuff
	* refactor end points for consistency
	* toggle boxes for selected devices to send commands to?
	* remove DST argument from batchCommand function in GlobalCommands.js?
* General
	* Troubleshooting documentation
	* add a test file directory to the server that gets pulled to each device...?