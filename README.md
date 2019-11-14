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

#### config file
* can set and get data from config file to ensure persistance

### diagnostic functions
* displays IP address on screen
* enables diagnostic console on port 3000 (chrome browsers only)
	* some frequently used commands:
		* restart = BS.reboot()
		* volume = setVolume(an int from 0-100)
		* play a file = playFile('the filename in quotes')

### Brightsign APIs as a class
* the BS_API class combines a variety of BS tools with Node modules to create a more complete way to interact with the BS with a standardized syntax

## to do:
* toggle IP address display
	* via config file?
* confirm audio port configuration
* GPIO interactivity
* html control interface
	* playback and volume controls
	* screen capture
	* local file list
* multiple zones
* websockets interface to turn on debugging mode?
* test on other BS hardware (its possible a restart function will need to be added after the node server is enable for the first time on a particular device)
* retrieving the remote server file list may need to be redesigned when the actual server is setup, depending on how its configured
