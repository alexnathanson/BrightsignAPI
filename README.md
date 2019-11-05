# brightscriptNodeServer

## overview
syncs media content to server directory
* continuously checks server directory for changes<br>
** server directory is /[deviceID]/media<br>
** [deviceID] is automatically detected and does not need to be changed by the user
* downloads new files
* deletes old files

## to do:
* control playback - check if it works with audio as well as video
* display IP address somewhere convienant
* continue building out brightscript player api
* parse config file so only the config file needs to be changed by the users
* GPIO and UDP interactivity
* html control interface with screen capture and local file list
* websockets interface to turn on debugging mode?
* test on other BS hardware (its possible a restart function will need to be added after the node server is enable for the first time on a particular device)
* retrieving the remote server file list may need to be redesigned when the actual server is setup, depending on how its configured
