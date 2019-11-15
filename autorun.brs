' Load the configuration file
' Will set various parameters used in playback

function loadConfig(config as string) as object
	params = CreateObject("roAssociativeArray")
	lines = config.Tokenize(chr(10))
	for each line in lines
		if left(line, 1) <> "#" then
			tokens = line.Tokenize("=")
			params[tokens[0].trim()] = tokens[1].trim()
		end if
	end for
	return params
end function

function sendMessage(msg as string)
	for each receiver in m.slaves
		m.UdpSender.SetDestination(receiver, 13131)
		m.Udp.sender.send(msg)	
	end for
end function

' If an ip address was specified in the config file
' setup networking accordingly.

function configureNetwork()
	nc = CreateObject("roNetworkConfiguration", 0)
	if m.params["ip_mode"] = "static" then
        nc.SetIP4Address(m.params["ip"])
        if Type(m.params["netmask"]) <> "Invalid" then
		    nc.SetIP4Netmask(m.params["netmask"])
	    end if
	    if Type(m.params["gateway"]) <> "Invalid" then
		    nc.SetIP4Gateway(m.params["gateway"])
	    end if    
    else
        nc.SetDHCP()
    end if
    dwsAA = CreateObject("roAssociativeArray")
    dwsAA["port"] = "80"
    'dwsAA["password"] = ""
    dwsAA["open"] = "srgm1071"
    nc.SetupDWS(dwsAA)
    nc.Apply()
end function

' Turn on SSH and diagnostic server
' SSH can be accessed using the username "brightsign"
' and the password "admin" unless another one is specified
' in the config

function configureServers()
	reg = CreateObject("roRegistry")
	regSec = CreateObject("roRegistrySection", "networking")
	regSec.write("ssh", "22")
	regSec.write("http_server", "80")
	regSec.write("http_auth", "srgm1071")
	regSec.write("telnet", "23")
	reg.flush()	
end function


' Enable node server

function enableNode()
	m.r=CreateObject("roRectangle", 0,0,1920,1080)
	' the inspector server is only accessible via Chrome browser
	is = {
	    port: 3000
	}
	config = {
	    nodejs_enabled: true
	    inspector_server: is
	    brightsign_js_objects_enabled: true
	    url: "file:///sd:/index.html"
	}
	m.h=CreateObject("roHtmlWidget", m.r, config)
	m.h.Show()
end function

' If running within a sync group setup PTPDomain

function configurePTP()
	registry = CreateObject("roRegistrySection", "networking")
	if registry <> Invalid then
		persistedPTP = registry.Read("ptp_domain")
		if persistedPTP <> "0" then
			registry.write("ptp_domain", "0")
			if m.params["playback_mode"] = "master" then
				registry.write("sync_master", "1")
			else 
				registry.write("sync_master", "0")
			end if
			RebootSystem()
		else
			if m.params ["playback_mode"] = "master" then
				registry.write("sync_master", "1")
			else 
				registry.write("sync_master", "0")
			end if
		end if
	end if
end function

function getMediaFile() as string
	print "Checking for meda files."
	Dim mediaTypes[3]
	mediaTypes = ["MPG","WMV","MOV","MP4","VOB","TS","MP3","WAV"]

	files = ListDir("/")
	print files
	print mediaTypes
	mFile = ""
	for each file in files
		if left(file, 1) <> "." then 
			'type is a reserved word!
			for each aType in mediaTypes
				if ucase(right(file, 3)) = aType then
					mFile = file
					exit for
				end if
			end for
		end if
	end for
	return mFile
end function

function runCommand(cmd as string)
	print "received command - "; cmd
	if m.params["playback_mode"] = "master" then
		for each slave in m.slaves
			m.UdpSender.SetDestination(slave, 13131)
			m.UdpSender.Send(cmd)
		end for
	end if
	if cmd = "play" then
		m.video.Seek(0)
		m.video.Play()
	else if cmd = "pause" then
		m.video.Pause()
	else if cmd = "resume" then
		m.video.Resume()
	else
		print cmd
	end if
end function

' If in slave mode join the sync.  

' function joinSync()
' 	joinedSync = false
' 	m.UdpSender.SetDestination(m.params["master_ip"], 13131)
' 	while joinedSync = false
' 		print "requesting master sync"
' 		m.UdpSender.Send("addslave")
' 		msg = wait(5000, m.mPort)
' 		if Type(msg) = "roDatagramEvent" then
' 			print "received udp message"
' 			print msg
' 			if msg = "slaveadded" then
' 				print "received master sync response"
' 				joinedSync = true
' 			end if
' 		end if
' 	end while
' end function

function doSync(cmd as String)
	m.msg = m.syncMgr.Synchronize(cmd, 500)
end function

function joinSync()
	m.msg = Wait(0, m.mPort)
end function

function setVideoOutputMode(mode as String)
	videoMode = CreateObject("roVideoMode")
	videoMode.setMode(mode)
end function

function processSync(s as Object)
	if s.GetId() = "pause" then
		m.video.Pause()
		m.paused = true
	else if s.GetId() = "resume" then
		m.video.Resume()
		m.paused = false
	else 
		vAA = CreateObject("roAssociativeArray")
		vAA.Filename = m.videoFile
		'if m.master = true or type(m.msg) = "roSyncManagerEvent" then
		vAA.SyncDomain = s.GetDomain()
		vAA.SyncId = s.GetId()
		vAA.SyncIsoTimestamp = s.GetIsoTimestamp()
		print vAA.SyncIsoTimestamp
		'end if
		m.video.PlayFile(vAA)
		m.paused = true
	end if
end function

function setVideoDelay(d as Integer)
    m.video.SetVideoDelay(d)
end function

function setAudioVolume(a as Integer)
    ao = CreateObject("roAudioOutput", m.params["audio_output"])
    ao.SetVolume(a)
end function

sub main()

	'Load configuration file
	config = ReadAsciiFile("config.txt")
	m.params = CreateObject("roAssociativeArray")
	'm.slaves = CreateObject("roList")

	' Add some necessary defaults
	m.params["playback_mode"] = "normal"
	'm.params["port"] = 13131
	m.params["video_output_mode"] = "1920x1080x50p"

	m.paused = true

	if config <> "" then
		m.params = loadConfig(config)
		print m.params
	end if

	' Configure networking if included in config

	'if Type(m.params["ip"]) <> "Invalid" then
	configureNetwork()
	'end if

	' Turn on servers

	'configureServers()

	' Set the video output mode 

	setVideoOutputMode(m.params["video_output_mode"])

	' enable the node server
	if m.params["enable_node"] = "true" then
		enableNode()
	end if

	' Create video, message port and UDP ports for communication

	m.mPort = CreateObject("roMessagePort")
	m.video = CreateObject("roVideoPlayer")
	m.video.SetVideoDelay(150)
    m.video.SetPort(m.mPort)
	m.udpReceiver = CreateObject("roDatagramReceiver", 13131)
	'm.udpSender = CreateObject("roDatagramSender")
	m.udpReceiver.SetPort(m.mPort)

	' Load a video file

	m.videoFile =  getMediaFile()
	print m.videoFile; ""
	
	' create and hide the mask
	' wait for UDP message to show mask
	if m.params["mask"] = "true" then
		'r = CreateObject("roRectangle",0,0,1920,1080)
		m.mask=createobject("roImagePlayer")
		'm.mask.SetRectangle(r)
		'make this autodetect file name at a later date
		m.mask.DisplayFile("mask.png")
		m.mask.Hide()
	end if

	'm.video.PreloadFile(m.videoFile)

	m.master = false

	'Setup Sync Manager if 

	' Configure audio
	print m.params["audio_output"]
	ao = CreateObject("roAudioOutput",m.params["audio_output"])
	'ao = CreateObject("roAudioOutput","hdmi")
	'ao = CreateObject("roAudioOutput","usb")
    'ao.SetMute(True)
    ao.SetAudioDelay(150)
    ao.SetVolume(m.params["volume"].toInt())    

	if m.params["playback_mode"] <> "normal" then
		configurePTP()
		m.syncAA = CreateObject("roAssociativeArray")
		if m.params["sync_group"] <> Invalid then
			m.syncAA.Domain = m.params["sync_group"]
		end if
		'm.syncAA.MulticastAddress = "255.255.255.255"
		m.syncMgr = CreateObject("roSyncManager", m.syncAA)
		m.syncMgr.SetPort(m.mPort)
		if m.params["playback_mode"] = "master" then
			m.master = true
			m.syncMgr.SetMasterMode(true)
			'startSync()
			doSync("play")
			processSync(m.msg)
			goto loop
		else if m.params["playback_mode"] = "slave" then
			m.master = false
			m.syncMgr.SetMasterMode(false)
			goto loop
			'joinSync()
		end if
	else 
		m.video.PreloadFile(m.videoFile)
		m.video.SetVideoDelay(150)
        m.video.Play()
	end if

	' Main loop

	loop:
	
	' Wait for a message, either from the video player or UDP

	msg = wait(0, m.mPort)
	
	' Process messages from video player

	if Type(msg) = "roVideoEvent" then
	 	if msg.GetInt() = 8 then
	 		if m.params["playback_mode"] = "normal" then
	 			m.video.Seek(0)
	 			m.video.Play()
	 		else if m.params["playback_mode"] = "master" then
	 			'runCommand("play")
	 			doSync("play")
	 			processSync(m.msg)
	 		end if
	 	end if
	end if

	if Type(msg) = "roSyncManagerEvent" then
		if m.master = false then 
			processSync(msg)
		end if
	end if

	' Process incoming UDP messages.

	if Type(msg) = "roDatagramEvent" then
		if(m.master = true) then
			doSync(msg)
			processSync(m.msg)
		else if m.params["playback_mode"] = "normal" then
			if msg = "pause" then
				m.video.Pause()
			else if msg = "resume" then
				m.video.Resume()
			else if msg = "play" then
				m.video.Seek(0)
				m.video.Play()
            else if left(msg, 7) = "v_delay" then
                s = msg.GetString()
                r = CreateObject("roRegex", " ", "")
                tokens = r.Split(s)
                setVideoDelay(tokens[1].toInt())
            else if left(msg, 6) = "volume" then
                s = msg.GetString()
                r = CreateObject("roRegex", " ", "")
                tokens = r.Split(s)
                setAudioVolume(tokens[1].toInt())
            'format for UDP "file [filename]"
            else if left(msg, 4) = "file" then
	 			m.video.PlayFile(right(msg, len(msg)-5))
	 			print right(msg, len(msg)-5)
	 			' print
	 		else if left(msg, 4) = "mask" then
	 			if right(msg, len(msg)-5) = "true" then
	 				m.mask.Show()
	 			else if right(msg, len(msg)-5) = "false" then
	 				m.mask.Hide()
	 			end if
	 			print msg
            end if
		end if 
	end if
	goto loop
end sub

