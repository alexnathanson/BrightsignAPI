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

### Brightsign APIs as a class
* the BS_API class combines a variety of BS tools with Node modules to create a more complete way to interact with the BS with a standardized syntax

### multiple zones
* multiple zones can be enable via the config file, but automating specific behaviours will need to be determined once the robot interaction is determined.
* presently the additional zone is an image, but it could easily be changed to a video

## to do:
* html control interface
	* playback and volume controls
	* screen capture
	* local file list
* better control of diagnostic modes
	* websockets interface to turn on debugging mode?
	* toggle IP address display without prior IP addresss knowledge...
* test on other BS hardware (its possible a restart function will need to be added after the node server is enable for the first time on a particular device)
* retrieving the remote server file list may need to be redesigned when the actual server is setup, depending on how its configured
