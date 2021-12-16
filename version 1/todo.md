# To do list 9/14/21

## update to this workflow

* frame.io manages actual media files
* strapi acts as index of content

## tasks
* add authentication to fetch request of files from BS to frame.io
	* this will mostly happen in the formatStreamRequest method of the BS_API class
* enable adding location and other meta data to interface of BS
	* this will happen in the interface stuff, endpoints and writing data will occur in the controllInterfaceExpress script
* add mqtt
* switch from custom IP collector to post IP and other metadata to Strapi
	* this is mostly going to happen in the postInfo method of the BS_API class

## answer these questions
* can you update node on the brightsign?

# To do later
* Brightsign
	* Create an inteface for syncing different brightsign together - and pass to server interface
	* is the queue post documentation missing a [ ?
	* look in to bundling the node stuff - webpack
	* dockerize BS API stuff
	* look at how it loops an individual file vs playlist
* Global Control Interface
	* Pull device IPs and other info from Strap
	* Filter by results by location once meta data function is created
	* remove the "sync ramp 3" stuff
	* better documentation for server side stuff
	* refactor end points for consistency
	* toggle boxes for selected devices to send commands to
	* remove DST argument from batchCommand function in GlobalCommands.js?
* General
	* Troubleshooting documentation
	* add a test file directory to the server that gets pulled to each device...?
* To Test
	* test that the output resolution changes when using a different output device