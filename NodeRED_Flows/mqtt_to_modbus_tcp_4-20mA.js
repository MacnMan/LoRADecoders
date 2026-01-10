[
    {
        "id": "15c3dc3f61c6bc8a",
        "type": "tab",
        "label": "MQTT_To_Modbus",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "e2f114c7e65e4090",
        "type": "modbus-flex-write",
        "z": "15c3dc3f61c6bc8a",
        "name": "",
        "showStatusActivities": false,
        "showErrors": false,
        "showWarnings": true,
        "server": "ac518f1fa34b61a4",
        "emptyMsgOnFail": false,
        "keepMsgProperties": false,
        "delayOnStart": false,
        "startDelayTime": "",
        "x": 1150,
        "y": 500,
        "wires": [
            [
                "a6908251f9484c89"
            ],
            []
        ]
    },
    {
        "id": "a6908251f9484c89",
        "type": "debug",
        "z": "15c3dc3f61c6bc8a",
        "name": "debug",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1370,
        "y": 380,
        "wires": []
    },
    {
        "id": "062c1f7b868e78d4",
        "type": "modbus-server",
        "z": "15c3dc3f61c6bc8a",
        "name": "",
        "logEnabled": false,
        "hostname": "0.0.0.0",
        "serverPort": 10502,
        "responseDelay": 100,
        "delayUnit": "ms",
        "coilsBufferSize": 10000,
        "holdingBufferSize": 10000,
        "inputBufferSize": 10000,
        "discreteBufferSize": 10000,
        "showErrors": false,
        "showStatusActivities": false,
        "x": 1200,
        "y": 700,
        "wires": [
            [],
            [],
            [],
            [],
            []
        ]
    },
    {
        "id": "4f80280dfc80c066",
        "type": "mqtt in",
        "z": "15c3dc3f61c6bc8a",
        "name": "MQTT Uplink",
        "topic": "application/7d130e88-7ed2-40e6-8e67-6bacc9aed4d5/device/#",
        "qos": "0",
        "datatype": "auto",
        "broker": "mqtt_broker_1",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 450,
        "y": 500,
        "wires": [
            [
                "ead896ae24293e08"
            ]
        ]
    },
    {
        "id": "ead896ae24293e08",
        "type": "function",
        "z": "15c3dc3f61c6bc8a",
        "name": "Extract A & B",
        "func": "// Parse JSON\nlet data = msg.payload;\nif (typeof msg.payload === \"string\") {\n    data = JSON.parse(msg.payload);\n}\n\nlet a = data.object?.Payload?.payload?.analogData?.channel_a_current;\nlet b = data.object?.Payload?.payload?.analogData?.channel_b_current;\nlet deviceEui = data.deviceInfo?.devEui;\n\n// Single object\nmsg.payload = {\n    channel_a_current: a,\n    channel_b_current: b,\n    deviceEui: deviceEui\n};\n\nreturn msg;\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 650,
        "y": 500,
        "wires": [
            [
                "fa473f14f93828f4",
                "86abcfb9d4d383b6"
            ]
        ]
    },
    {
        "id": "86abcfb9d4d383b6",
        "type": "function",
        "z": "15c3dc3f61c6bc8a",
        "name": "A Float32 → Modbus",
        "func": "// returns modbus resister address\nfunction getResisterAddress(devEUI) {\n    // node.log(\"DevEUI = \" + devEUI);\n    switch (devEUI) {\n        case \"0080e115001b0b6e\": return 0;\n        case \"0080e11505d94319\": return 4;\n        case \"0080e115001b42ff\": return 8;\n        case \"0080e11505d944d6\": return 12;\n        case \"0080e115001af6c8\": return 16;\n        case \"0080e11505d94710\": return 20;\n        case \"0080e11505d94244\": return 24;\n        case \"0080e11505d94716\": return 28;  // add node eeuid here with +4\n        default: return 1000;\n    }\n}\n// returns uint16_t array from float\nfunction float32ToBuffer(value) {\n    var mbbuffer = new Uint16Array(2);\n    var dataView = new DataView(mbbuffer.buffer);\n    dataView.setFloat32(0, value, true);\n    return [mbbuffer[0], mbbuffer[1]];\n}\n\nlet val = Number(msg.payload);\nlet buf1 = float32ToBuffer(Number(msg.payload.channel_a_current));\nlet buf2 = float32ToBuffer(Number(msg.payload.channel_b_current));\nlet modAddress = getResisterAddress(msg.payload.deviceEui);\n\n\nmsg.payload = {\n    value: [buf1[0], buf1[1], buf2[0], buf2[1]],\n    fc: 16,\n    unitid: 1,\n    address: modAddress,\n    quantity: 4\n};\nreturn msg;\n\n",
        "outputs": 1,
        "timeout": "",
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 900,
        "y": 500,
        "wires": [
            [
                "4b844c5002a7fdd0",
                "e2f114c7e65e4090"
            ]
        ]
    },
    {
        "id": "4b844c5002a7fdd0",
        "type": "debug",
        "z": "15c3dc3f61c6bc8a",
        "name": "debug",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 1130,
        "y": 380,
        "wires": []
    },
    {
        "id": "fa473f14f93828f4",
        "type": "debug",
        "z": "15c3dc3f61c6bc8a",
        "name": "debug",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 830,
        "y": 380,
        "wires": []
    },
    {
        "id": "ac518f1fa34b61a4",
        "type": "modbus-client",
        "name": "local Mosbus Server",
        "clienttype": "tcp",
        "bufferCommands": true,
        "stateLogEnabled": false,
        "queueLogEnabled": false,
        "failureLogEnabled": true,
        "tcpHost": "127.0.0.1",
        "tcpPort": "10502",
        "tcpType": "DEFAULT",
        "serialPort": "/dev/ttyUSB",
        "serialType": "RTU-BUFFERD",
        "serialBaudrate": "9600",
        "serialDatabits": "8",
        "serialStopbits": "1",
        "serialParity": "none",
        "serialConnectionDelay": "100",
        "serialAsciiResponseStartDelimiter": "0x3A",
        "unit_id": "1",
        "commandDelay": "1",
        "clientTimeout": "1000",
        "reconnectOnTimeout": true,
        "reconnectTimeout": "2000",
        "parallelUnitIdsAllowed": true,
        "showWarnings": true,
        "showLogs": true
    },
    {
        "id": "mqtt_broker_1",
        "type": "mqtt-broker",
        "name": "Macnman MQTT",
        "broker": "mqtt.macnman.com",
        "port": "1883",
        "tls": "",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": "4",
        "keepalive": "60",
        "cleansession": true,
        "autoUnsubscribe": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthPayload": "",
        "closeTopic": "",
        "closeQos": "0",
        "closePayload": "",
        "willTopic": "",
        "willQos": "0",
        "willPayload": ""
    },
    {
        "id": "0a7f89b0c88d9c5b",
        "type": "global-config",
        "env": [],
        "modules": {
            "node-red-contrib-modbus": "5.45.2"
        }
    }
]