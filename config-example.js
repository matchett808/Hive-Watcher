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