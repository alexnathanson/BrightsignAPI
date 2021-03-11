# Media & Command Server

## Media Directories

* Each Brightsign should have a corresponding directory with its ID as the name of the directory
	* For example: 31D73S000475
* The default setting is to have all the media files in a subdirectory called "media"

## NodeJS-API

The Node.JS script runs as a proxy server behind IIS. IIS creates a virtual path to required destination. 

### media

### checkin

### IIS virtual path and web.config

Presently, the server is IIS. This is an IIS config file to redirect 

## User Interface

The contents of the userInterface directory should be in the server root.

### Global Commands

## Server Configuration

The Node.JS API can be configured as an application for a primary server. Currently, we are using IIS.

### IIS

The virtual path for the application is set via the "View Applications" tab.