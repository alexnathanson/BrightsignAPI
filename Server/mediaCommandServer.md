# Media & Command Server

This system uses iisnode. https://github.com/Azure/iisnode

## Media Directories

* Each Brightsign should have a corresponding directory with its ID as the name of the directory
	* For example: 31D73S000475
* The default setting is to have all the media files in a subdirectory called "media"

## NodeJS-API

The Node.JS script runs as a proxy server behind IIS. IIS creates a virtual path to required destination. The contents of this "iisnode-API" directory should be placed in the root directory that IIS is redirecting to. The virtual path for the application is set via the "View Applications" tab in IIS.

### media

The media virtual directory handles the media download functionality. These are all GET methods.

* Media end points:
	* files - returns the list of files in the media directory for the specified device
		* dev
		* example: http://172.16.0.4/node/media/files?dev=42D97F001572
	* filesize - returns the amount of bytes for the specified file
		* dev
		* file
		* example: http://172.16.0.4/node/media/filesize?dev=42D97F001572&file=CRKAV125_31_Qatar_200213_Final.mp4
	* stream - streams the specified file to the client
		* dev
		* file
		* example: http://172.16.0.4/node/media/stream?dev=42D97F001572&file=CRKAV125_31_Qatar_200213_Final.mp4

Potential glitches - if the file name has weird characters an error could occur.

### checkin

The checkin virtual directory handles the communication between the device and server for collecting IP addresses from active devices. These are all POST methods.

* Checkin endpoints
	* ip - this allows devices to checkin
	* global - this routes messages from individual devices globally accross the system

### IIS virtual path and web.config

Presently, the server is IIS. This is an IIS config file to redirect 

## User Interface

The contents of the userInterface directory should be in the server root.

### Global Commands

## Server Configuration

The Node.JS API can be configured as an application for a primary server. Currently, we are using IIS.

## Notes

To test:
* global commands