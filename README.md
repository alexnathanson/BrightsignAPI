# brightscriptNodeServer

## overview
### syncs media content to server directory
* continuously checks server directory for changes
  * server directory is /[deviceID]/media
  * [deviceID] is automatically detected and does not need to be changed by the user
* downloads new files
* deletes old files

### media controls and interactivity
* UDP on port 13131
	* playfile syntax: 'file [filename]'
	* volume syntax: 'volume [integer in range 0-100]'
* GPIO
	* Default is set to GPIO 0 which will play a random file
* HTML Control interface on port 8000
	* must add full node_modules directory to SD card
		* run 'npm install' on your computer and drag the node_modules directory to the SD card
		* could be rewritten with webpack in the future
	* uses websockets on port 8081 
* Additional commands can be sent via the Chome diagnostic console.
	* see below

#### config file
* can set and get data from config file to ensure persistance

### diagnostic functions
* displays IP address on screen
* enables diagnostic console on port 3000 (Chrome browsers only)
	* some frequently used commands:
		* restart = BS.reboot()
		* volume = setVolume(an int from 0-100)
		* play a file = playFile('the filename in quotes')
		* turn the mask zone on/off = maskIt(boolean)
* html control interface on port 8000

### Brightsign APIs as a class
* the BS_API class combines a variety of BS tools with Node modules to create a more complete way to interact with the BS with a standardized syntax

### multiple zones
* multiple zones can be enable via the config file, but automating specific behaviours will need to be determined once the robot interaction is determined.
* presently the additional zone is an image, but it could easily be changed to a video

## server configuration
* must enable directory browsing

## possible future additions
* html control interface
	* playback controls
	* display local file list
* generate list of all IPs on server
* test on other BS hardware (its possible a restart function will need to be added after the node server is enable for the first time on a particular device)