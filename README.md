# Hive Watcher

** This work is not affiliated with British Gas, Centrica or Hive **

Simple Node script to monitor Hive devices and publish status updates to MQTT

Designed to be as flexible as possible, I'm using it with [Home Assistant](http://homeassistant.io)

````
module.exports = {
    "username": "YOUR HIVE USERNAME",
    "password": "YOUR HIVE PASSWORD",
    "monitor":
    [
        {"name": "hallway light", "attributes": ["state", "brightness", "presence"]},
        {"name": "stair light", "attributes": ["state", "brightness", "presence"]}
    ],
    "pollingfrequency" : 30000,
    mqttoptions: {
        "username": "YOUR MQTT USERNAME",
        "password": "YOUR MQTT PASSWORD",
        "port": 1883
    },
    mqtturl: "MQTT URL"
}
````

Install by git cloning this repo, you can probably do something with npm but that's up to you.

Replace hive username, hive password, MQTT url, MQTT username and password with your details.

Run ````node index.js```` or ````npm start````.

Polling frequency is the frequency that the Hive API is polled.

