# A more functional Brightsign API

## overview
<p>This repository combines existing Brightsign APIs and functions to create a more functional and practical system that is more flexible and easier to implement. This provides a wide range of functionality for syncing content remotely, interacting with the brightsign, and trouble shooting, all without using BrightAuthor, because BrightAuthor is annoying and inflexible! This was designed for use with the LS423 model, but should be widely applicable to the most recent generation of Brightsign devices.
</p>

There are three main components to this system.

* The Combined Brightsign APIs, which provides the functionality.
* The server syncing, which is optional
* The HTML web interface and API end points for broader network interactions.

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
* HTML Control interface on port 8000
	* must add full node_modules directory + a few other modules to SD card
		* run 'npm install' on your computer and drag the node_modules directory to the SD card
		* could be rewritten with webpack in the future
	* uses PUT method 
* Additional commands can be sent via the Chrome diagnostic console.
	* see below


### Trouble shooting and diagnostic functions
* displays IP address on screen by default
* enables diagnostic console on port 3000 (Chrome browsers only)
	* This allows you to manually work with the BS_API class directly if accessible end points haven't been established.
	* some frequently used commands:
		* restart = BS.reboot()
		* volume = setVolume(an int from 0-100)
		* play a file = playFile('the filename in quotes')
		* turn the mask zone on/off = maskIt(boolean)
* ssh
* telnet


### multiple zones
* multiple zones for masking can be enable via the config file
* presently the layered zone is a PNG image, but it could easily be changed to a video

## Syncing media content to server directory
* continuously checks server directory for changes
  * server directory is /[deviceID]/media
  * [deviceID] is automatically detected and does not need to be changed by the user
* downloads new files
* deletes old files

## HTML Control Interface
html control interface on port 8000

<p>
The control interface uses a Node Express server (controlInterfaceExpress.js) to serve the files in the controlInterface directory
</p>
<p>
The Express server can also be the basis for more complex API functionality.
</p>

## Installation Instructions

### brightsign
* update the firmware on the BS
* update the config file as necessary
* drag all of contents of the BrightsignLS423 directory to the SD card
* if you are not syncing files via the media server, put your media files onto the SD manually.

### media server 
There are 2 main functions of the media server machine 1) distribute media content to the media players and 2) collect IPs from the media players for trouble shooting purposes.
<p>
The server must have a static IP, which must be listed in the BS config file.
</p>

Distribution
* This has been tested with a generic Windows IIS setup
* must enable directory browsing
* place media files on server directory named "media" within a directory with the name of the device ID
	* root/[deviceID]/media

IP Collector
* a Node JS app
* set it up to start on boot
* must adjust file paths on final version

## possible future additions
* html control interface
	* playback controls
	* display local file list
* generate list of all IPs on server
* test on other BS hardware (its possible a restart function will need to be added after the node server is enable for the first time on a particular device)
* format file names with pertinant info and parse it to update config file and bay info
* split up functionality so it is easier to manage and reuse in the future
	* create seperate functionality for HTML interface, server syncing, IP collector
	* condense Node module stuff
* IP collector should be connected to logging server requests from the BS devices or through automated via websockets
* set automated timer for IP address display so it turns off after a few minutes
