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

' for sync system
'function sendMessage(msg as string)
	'for each receiver in m.slaves
		'm.UdpSender.SetDestination(receiver, 13131)
		'm.Udp.sender.send(msg)	
	'end for
'end function

' general UDP sending to top Node API layer
function sendUDP(msg as string)
	m.udpSender.SetDestination("0.0.0.0", 31313)
	m.udpSender.Send(msg)	
end function

' If an ip address was specified in the config file
' setup networking accordingly.

function configureNetwork()
	nc = CreateObject("roNetworkConfiguration", 0)
	nc.SetTimeServer("time.brightsignnetwork.com")
	if m.params["ip_mode"] = "static" then
		if Type(m.params["ip"]) <> "Invalid" then
	        nc.SetIP4Address(m.params["ip"])
	        if Type(m.params["netmask"]) <> "Invalid" then
			    nc.SetIP4Netmask(m.params["netmask"])
		    end if
		    if Type(m.params["gateway"]) <> "Invalid" then
			    nc.SetIP4Gateway(m.params["gateway"])
		    end if  
		end if  
    else
        nc.SetDHCP()
    end if
    dwsAA = CreateObject("roAssociativeArray")
    dwsAA["port"] = "80"
    ' password = "" turns off authentication
    'dwsAA["password"] = ""
    ' this sets password if using authentication
    dwsAA["open"] = m.params["password"]
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
	regSec.write("http_auth", m.params["password"])
	regSec.write("telnet", "23")
	'regSec.Write("ptp_domain", "0")
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
			if m.params["playback_mode"] = "leader" then
				registry.write("sync_master", "1")
			else 
				registry.write("sync_master", "0")
			end if
			RebootSystem()
		else
			if m.params ["playback_mode"] = "leader" then
				registry.write("sync_master", "1")
			else 
				registry.write("sync_master", "0")
			end if
		end if
	end if
end function

'plays the first file it finds that is playable
'(checks file list against media type list,
'so a .mov will play before a .mp4 even if the mp4 is alphanumerically ahead of the mov in the directory structure)
' Note that the Node layer also sends a command to play a file on start - this redundancy could be removed
function getMediaFile() as string
	print "Checking for meda files."
	Dim mediaTypes[3]
	mediaTypes = ["MPG","WMV","MOV","MP4","VOB","TS","MP3"]
	'audioTypes = ["MP3","WAV"]

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

' Synchronize configures how the leader unit will broadcast the time-stamped event to other players.
' arg 1 is the identifier i.e. the command to process - play, pause, file, and the actual sync stuff 
' arg 2 is the delay in ms
function doSync(cmd as String)
	m.msg = m.syncMgr.Synchronize(cmd, 50) 'was 500
end function

function setVideoOutputMode(mode as String)
	videoMode = CreateObject("roVideoMode")
	videoMode.setMode(mode)
end function

' handles the messages sent from doSync'
function processSync(s as Object)
	if s.GetId() = "pause" then
		'this isn't actually used the sync event message - could lead to problems if using multiple sync groups but it might be fine if the message is only sent to devices that subscribed any way...
		m.video.Pause()
	else if s.GetId() = "resume" then
		m.video.Resume()
	'else if left(s.GetId(), 7) = "preload" then
		'sendUDP("processSync - preload")
		'm.videoFile = right(s.GetId(), len(s.GetId())-8)
		'm.video.PreloadFile(m.videoFile)
	'else if left(s.GetId(), 4) = "file" then 'play the specified file
		'sendUDP("processSync - file")
		'm.videoFile =  right(s.GetId(), len(s.GetId())-5)
	 	'm.video.PlayFile(m.videoFile)
	else if left(s.GetId(), 4) = "seek" then
		sendUDP("processSync seek: " + (right(s.GetId(), len(s.GetId())-5).toInt()).ToStr())
		m.video.PlayFile(m.videoFile)
		'for some unknown reason this wont work after the 1st play of the video without including the PlayFile() function about...
		m.video.Seek((right(s.GetId(), len(s.GetId())-5)).toInt())
	else
		'sendUDP("processSync - else")
		vAA = CreateObject("roAssociativeArray")
		vAA.Filename = m.videoFile
		vAA.SyncDomain = s.GetDomain()
		vAA.SyncId = s.GetId()
		vAA.SyncIsoTimestamp = s.GetIsoTimestamp()
		'print vAA.SyncIsoTimestamp
		m.video.PreloadFile(vAA)
		m.video.Play()
		'm.video.PlayFile(vAA)
	end if
end function

function setVideoDelay(d as Integer)
    m.video.SetVideoDelay(d)
end function

function setAudioVolume(a as Integer)
    ao = CreateObject("roAudioOutput", m.params["audio_output"])
    ao.SetVolume(a)
    m.video.SetVolume(a)

end function

sub main()

	'Load configuration file
	config = ReadAsciiFile("config.txt")
	m.params = CreateObject("roAssociativeArray")

	' Add some necessary defaults
	m.params["playback_mode"] = "normal"
	'm.params["port"] = 13131
	m.params["video_output_mode"] = "1920x1080x50p"

	if config <> "" then
		m.params = loadConfig(config)
		print m.params
	end if

	' Configure networking
	configureNetwork()

	' Turn on servers - ssh, http, telnet
	configureServers()

	' Set the video output mode 
	setVideoOutputMode(m.params["video_output_mode"])

	' enable the node server
	if m.params["enable_node"] = "true" then
		enableNode()
	end if

	' Create video, audio, message port and UDP ports for communication

	m.mPort = CreateObject("roMessagePort")
	'm.audio = CreateObject("roAudioPlayer")
	'm.audio.SetPort(m.mPort)
	m.video = CreateObject("roVideoPlayer")
	m.video.SetVideoDelay(150)
	'm.video.SetLoopMode(True) 'looping is handled by processing the media end message
    m.video.SetPort(m.mPort)
    'mRec = CreateObject("roRectangle",0,0,1920,1080)
    'm.video.SetRectangle(mRec)
	m.udpReceiver = CreateObject("roDatagramReceiver", 13131)
	m.UdpSender = CreateObject("roDatagramSender")
	m.udpReceiver.SetPort(m.mPort)

	' Load a video file
	m.videoFile =  getMediaFile()
	print m.videoFile; ""
	
	' create and hide the mask
	' wait for UDP message to show mask
	if m.params["mask"] = "true" then
		m.mask=createobject("roImagePlayer")
		m.mask.DisplayFile("mask.png")
		m.mask.Hide()		
	end if

	'm.video.PreloadFile(m.videoFile)

	m.master = false

	' Configure audio
	print m.params["audio_output"]
	ao = CreateObject("roAudioOutput",m.params["audio_output"])
	'ao = CreateObject("roAudioOutput","hdmi")
	'ao = CreateObject("roAudioOutput","usb")
    'ao.SetMute(True)
    ao.SetAudioDelay(150)
    ao.SetVolume(m.params["volume"].toInt())

    'set video player audio output
    m.video.SetVolume(m.params["volume"].toInt())

    'set up sync
	if m.params["playback_mode"] <> "normal" then
		configurePTP()
		m.syncAA = CreateObject("roAssociativeArray")
		if m.params["sync_group"] <> Invalid then
			m.syncAA.Domain = m.params["sync_group"]
		end if
		'm.syncAA.MulticastAddress = "255.255.255.255"
		m.syncMgr = CreateObject("roSyncManager", m.syncAA)
		m.syncMgr.SetPort(m.mPort)
		if m.params["playback_mode"] = "leader" then
			m.master = true
			m.syncMgr.SetMasterMode(true)
			doSync("play")
			processSync(m.msg)
			goto loop
		else if m.params["playback_mode"] = "follower" then
			m.master = false
			m.syncMgr.SetMasterMode(false)
			goto loop
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
		print msg
	 	if msg.GetInt() = 8 then
	 		'sendUDP("media ended") 'this passes the message to node
	 		if m.params["playback_mode"] = "normal" then
	 			m.video.Seek(0)
	 			m.video.Play()
	 		else if m.params["playback_mode"] = "leader" then
	 			'sendUDP("media ended - leader")
	 			doSync("play")
	 			processSync(m.msg)
	 		end if
	 	end if
	end if

	' Process messages from the sync manager (sent from the leader)
	if Type(msg) = "roSyncManagerEvent" then
		if m.master = false then 
			processSync(msg)
		end if
	end if

	' Process incoming UDP messages.
	if Type(msg) = "roDatagramEvent" then
		' handle these messages regardless of sync mode
		if left(msg, 6) = "volume" then
            s = msg.GetString()
            r = CreateObject("roRegex", " ", "")
            tokens = r.Split(s)
            setAudioVolume(tokens[1].toInt())
        else if msg = "timecode" then
	 		'print m.video.GetPlaybackPosition().ToStr()
	 		sendUDP("timecode " + m.video.GetPlaybackPosition().ToStr())
 		else if msg = "duration" then
 			sendUDP("duration " + m.video.GetDuration().ToStr())
		else if left(msg, 4) = "file" then
	 		m.video.PlayFile(right(msg, len(msg)-5))
	 		m.videoFile = right(msg, len(msg)-5)
	 		'print right(msg, len(msg)-5)
	 		'if passing through file syncing as well - make the top 2 lines in a conditional not tested
	 		'if(m.master = true) then
	 			'doSync(msg)
	 			'processSync(m.msg)
	 		'end if

		' if sync leader then pass messages through to followers
		else if m.master = true then
			if msg = "sync" then
	 			doSync("play")
	 			processSync(m.msg)
			else
				doSync(msg)
				processSync(m.msg)
			end if

		' handles these messags if not in any sync mode
		else if m.params["playback_mode"] = "normal" then
			if msg = "pause" then
				m.video.Pause()
			else if msg = "resume" then
				m.video.Resume()
			else if msg = "play" then
				m.video.Seek(0)
				m.video.Play()
			else if left(msg, 4) = "seek" then
				m.video.Seek(right(msg, len(msg)-5).toInt())
            else if left(msg, 7) = "v_delay" then
                s = msg.GetString()
                r = CreateObject("roRegex", " ", "")
                tokens = r.Split(s)
                setVideoDelay(tokens[1].toInt())
	 		' to show mask "mask show"
	 		' to hide mask "mask hide"
	 		else if left(msg, 4) = "mask" then
	 			if right(msg, len(msg)-5) = "show" then
	 				m.mask.Show()
	 			else if right(msg, len(msg)-5) = "hide" then
	 				m.mask.Hide()
	 			end if
	 			print msg
	 		else if left(msg, 7) = "preload"
	 			'pf=CreateObject("roAssociativeArray")
	 			'values = right(msg, len(msg)-8).Tokenize(",")
				'pf["Filename"] = values[0]
	 			'm.video.PreloadFile(pf)
	 			'm.video.Seek(values[1].toInt())
	 			'm.video.Play()
            end if
		end if 
	end if
	goto loop
end sub