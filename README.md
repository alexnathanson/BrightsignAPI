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
* GPIO

#### config file
* can set and get data from config file to ensure persistance

### diagnostic functions
* displays IP address on screen
* enables diagnostic console on port 3000 (chrome browsers only)

### Brightsign APIs as a class
* the BS_API class combines a variety of BS tools with Node modules to create a more complete way to interact with the BS with a standardized syntax

## to do:
* config file
		* set and get
* control playback
		* check if it works with audio as well as video
* toggle IP address display
		* via config file?
* volume control
* GPIO interactivity
* html control interface
	* playback and volume controls
	* screen capture
	* local file list
* websockets interface to turn on debugging mode?
* test on other BS hardware (its possible a restart function will need to be added after the node server is enable for the first time on a particular device)
* retrieving the remote server file list may need to be redesigned when the actual server is setup, depending on how its configured
