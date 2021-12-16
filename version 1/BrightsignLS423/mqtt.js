const mqtt = require('mqtt');

//Museum broker IP should be something retrieved from config file...
const MUSEUM_BROKER = 'mqtt://172.16.1.72:1883';
const MQTT_SHOW_STATE_TOPIC = 'museum/show/status';
const MQTT_SHOW_FULLSCREEN_TOPIC = 'museum/show/fullscreen';
const MQTT_SHOW_SCHEDULE_SET_TIME = 'museum/show/scheduler/time/set';
const MQTT_SHOW_DEVICES_STATUS = 'museum/show/devices/status';
const MQTT_SHOW_SCHEDULER_SET_STATE = "museum/show/scheduler/state";
const MQTT_SHOW_MUTE = 'museum/show/audio/mute';
const MQTT_CUE_TOPIC = 'museum/show/video/cue';

const mqttClient = mqtt.connect(MUSEUM_BROKER);

mqttClient.on('connect', () => {
    console.log('mqtt connected.');
    mqttClient.subscribe(MQTT_SHOW_DEVICES_STATUS);
    mqttClient.subscribe(MQTT_SHOW_SCHEDULE_SET_TIME);
    mqttClient.subscribe(MQTT_SHOW_SCHEDULER_SET_STATE);
})  

mqttClient.on('message', (topic, message) => {
    if (topic === MQTT_SHOW_DEVICES_STATUS) {
        let m;
        try {
            m = JSON.parse(message);
        } catch (err) {
            console.log(`Improperly formatted message - ${message}`);
            return;
        }
        console.log(`Sending status - ${m.name}`)
        /*deviceStatusStore.addStatus(m.name, m.status);
        wss.clients.forEach(ws => {
            ws.send(JSON.stringify({ 'topic': 'deviceStatus', 'data': m }));
        })*/
    }
    if (topic === MQTT_CUE_TOPIC) {n
        console.log(`Sending current cue - ${m.clip}`)
        /*currentCue = cuePublisher.getCue(message.toString());
        nextCue = cuePublisher.getNextCue();
        callUpdate();*/
    }
    if (topic === MQTT_SHOW_SCHEDULE_SET_TIME) {
/*        callUpdate();
*/    }
    if (topic === MQTT_SHOW_SCHEDULER_SET_STATE) {
/*        callUpdate();
*/    }
});
