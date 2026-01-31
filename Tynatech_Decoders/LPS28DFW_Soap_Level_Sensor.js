// main function for milesight gateway decoder
function Decode(fPort, bytes) {
    return decodeUplink(bytes);
}
// dev type classification
const devTypes = {
    0: "RS485_Node",
    1: "Analog_Node",
    2: "RS485_Controller",
    3: "Analog_Controller",
    16: "MacSense_V2.0",
};
// function for decoding uplink message
function decodeUplink(input) {
    return {
        data: {
            Payload: Decoder(input.bytes, input.port),
        },
        warnings: [],
        errors: []
    };
}
// bytes to string
function str_pad(byte) {
    var zero = '00';
    var hex = byte.toString(16);
    var tmp = 2 - hex.length;
    return zero.substr(0, tmp) + hex + "";
}
// Decoder main
function Decoder(bytes, port) {
    const decode = {};
    const dataParsers = {
        0: getRS485Data,
        1: getAnalogData,
        2: getRS485Data,
        3: getAnalogData,
        16: getMacSenseData,
    };
    const devTypes = {
    0: "RS485_Node",
    1: "Analog_Node",
    2: "RS485_Controller",
    3: "Analog_Controller",
    16: "MacSense_V2.0",
};
    const devType = devTypes[bytes[1]];
    if (devType) {
        // decode.devType = devType;
        const parser = dataParsers[bytes[1]];
        if (parser) {
            switch (bytes[0]) {
                case 0:
                    decode.boot = parser(bytes);
                    break;
                case 1:
                    decode.deviceinfo = getDeviceinfo(bytes, port);
                    decode.devicedata = parser(bytes);
                    break;
                case 2:
                    decode.responce = parser(bytes);
                    break;
                case 3:
                    decode.alarm = parser(bytes);
                    break;
                case 4:
                    decode.samples = parser(bytes);
                    break;
                default:
                    break;
            }
        }
    }
    return decode;
}
// Function for returning decode encoded data take 1 byte as argument last 2 bits are data type and other 6 are type sensor.
function getDataTypeAndSensor(encodedByte) {
    let numRegisters = (encodedByte >> 5) & 0x07; // Extract 3-bit Data Type
    let dataType = encodedByte & 0x1F; // Extract 5-bit Register Count
    return {
        dataType,
        numRegisters
    };
}
// Returns parameter and its value.
function getSensorData(bytes) {
    var fieldNames = ["level", "temperature", "humidity", "pressure", "windspeed", "winddirection", "rainfall", "snowfall", "co2", "pm2.5", "levelmm", "levelcm", "levelm3"];
    var sensorData = {};
    bytes.splice(-5);
    const loopCount = (bytes.length);
    let byteIndex;
    for (byteIndex = 1; byteIndex < loopCount-1; ) {
        var decodedData = getDataTypeAndSensor(bytes[++byteIndex]);
        var dataType = decodedData.dataType;
        var fieldIndex = decodedData.numRegisters;
        let fieldName = fieldNames[fieldIndex];
        switch (dataType) {
            case 0: // error
                    sensorData[fieldName] = "Error";
            break;
            case 1: // int16/100 and int16/10 with signed
                switch (fieldName) {
                case "temperature":
                    sensorData[fieldName] = parseFloat(((((bytes[++byteIndex] << 8) | bytes[++byteIndex]) << 16 >> 16) / 100).toFixed(2));
                    break
                case "humidity":
                    sensorData[fieldName] = parseFloat(((((bytes[++byteIndex] << 8) | bytes[++byteIndex]) << 16 >> 16) / 100).toFixed(2));
                    break
                case "pressure":
                    sensorData[fieldName] = parseFloat(((((bytes[++byteIndex] << 8) | bytes[++byteIndex]) << 16 >> 16) / 10).toFixed(2));
                    break
                case "level":
                    sensorData[fieldName] = parseFloat(((((bytes[++byteIndex] << 8) | bytes[++byteIndex]) << 16 >> 16) / 10).toFixed(2));
                    break
                }      
            break;
            case 2: // uint32
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])).toFixed(2))
            break;
            case 3: // float32
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/100).toFixed(2))
            break;
        }
    }
    // sensorData.battery = ((bytes[byteIndex]) / 10);
    // sensorData.Systimestamp = (bytes[++byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
    return sensorData;
}
// for decoding data from new sensors with its id.
function getMacSenseData(bytes) {
    if (bytes[0] === 0) {
        return decodeBootMessage(bytes); // decode boot message bytes
    } else if (bytes[0] == 1) {
        return getSensorData(bytes);
    } else if (bytes[0] == 2) {
        return decodeResponce(bytes);
    } else if (bytes[0] == 3) {
        return decodeTrigerData(bytes);
    } else if (bytes[0] == 4) {
        return decodeSamplingData(bytes);
    }

}
// downlink Encoder.
function encodeDownlink(input) {
    const portNumber = input.data.fPort;
    let bytes = [];

    switch (portNumber) {
        case 6: // for tx time
            bytes.push(
                (input.data.txTime >> 8) & 0xFF,
                input.data.txTime & 0xFF,
            );
            break;
        case 5: // for controlling relays time
            const relay1 = input.data.relay1 !== undefined ? input.data.relay1 : 0x03;
            const relay2 = input.data.relay2 !== undefined ? input.data.relay2 : 0x03;
            bytes.push(relay1, relay2);
            break;
        case 8: // for writing coils
            bytes.push(
                input.data.slaveId, // 1 byte
                input.data.numberofreg, // 1 byte
                (input.data.address >> 8) & 0xFF, // High byte of address
                input.data.address & 0xFF // Low byte of address
            );

            if (input.data.numberofreg === 1) {
                bytes.push(
                    (input.data.value >> 8) & 0xFF, // High byte of value
                    input.data.value & 0xFF // Low byte of value
                );
            } else {
                bytes.push(
                    (input.data.value >> 24) & 0xFF, // Most significant byte
                    (input.data.value >> 16) & 0xFF,
                    (input.data.value >> 8) & 0xFF,
                    input.data.value & 0xFF // Least significant byte
                );
            }
            break;
        case 9: // for write resistors
            bytes.push(
                input.data.slaveId, // 1 byte
                input.data.numberofreg, // 1 byte
                (input.data.address >> 8) & 0xFF, // High byte of address
                input.data.address & 0xFF // Low byte of address
            );

            if (input.data.numberofreg === 1) {
                bytes.push(
                    (input.data.value >> 8) & 0xFF, // High byte of value
                    input.data.value & 0xFF // Low byte of value
                );
            } else {
                bytes.push(
                    (input.data.value >> 24) & 0xFF, // Most significant byte
                    (input.data.value >> 16) & 0xFF,
                    (input.data.value >> 8) & 0xFF,
                    input.data.value & 0xFF // Least significant byte
                );
            }
            break;
        case 10: // changing rs485 config
            bytes.push(
                input.data.Field, // 1 byte
                input.data.slaveId, // 1 byte
                input.data.functionCode, // 1 byte
                input.data.Enable, // 1 byte
                input.data.dataType, //byte of dataType
                input.data.numberOfParameters, // 1 byte
                (input.data.Registeraddress >> 8) & 0xFF, // High byte of Registeraddress
                input.data.Registeraddress & 0xFF // Low byte of Registeraddress
            );
            break;
        case 11: //   normal alarm
            bytes.push(
                input.data.index, // 1 byte: Index
                (input.data.startTime >> 24) & 0xFF, // 4 bytes: startTime
                (input.data.startTime >> 16) & 0xFF,
                (input.data.startTime >> 8) & 0xFF,
                input.data.startTime & 0xFF,
                (input.data.stopTime >> 24) & 0xFF, // 4 bytes: stopTime
                (input.data.stopTime >> 16) & 0xFF,
                (input.data.stopTime >> 8) & 0xFF,
                input.data.stopTime & 0xFF,
                input.data.dayData, // 1 byte: Day Data
                input.data.relayStatus, // 1 byte: Relay Status
                input.data.alarmType, // 1 byte: alarmType Type
                input.data.enable // 1 byte: Enable
            );
            switch (input.data.alarmType) {
                case 2: // Cyclic Alarm
                    bytes.push(
                        (input.data.onTime >> 24) & 0xFF, // 4 bytes: On Time
                        (input.data.onTime >> 16) & 0xFF,
                        (input.data.onTime >> 8) & 0xFF,
                        input.data.onTime & 0xFF,
                        (input.data.offTime >> 24) & 0xFF, // 4 bytes: Off Time
                        (input.data.offTime >> 16) & 0xFF,
                        (input.data.offTime >> 8) & 0xFF,
                        input.data.offTime & 0xFF
                    );
                    break;

                case 3: // Trigger Scheduling Alarm
                    bytes.push(
                        (input.data.sensorValue >> 24) & 0xFF, // 4 bytes: On Time
                        (input.data.sensorValue >> 16) & 0xFF,
                        (input.data.sensorValue >> 8) & 0xFF,
                        input.data.sensorValue & 0xFF,
                        input.data.condition, // 1 byte: Level
                        input.data.rs485Field // 1 byte: RS485 Field
                    );
                    break;
            }
            break;
        case 12: // changing baud rate
            bytes.push(
                (input.data.baud >> 8) & 0xFF,
                input.data.baud & 0xFF,
                input.data.pairity // 1 byte: Parity
            );
            break;
        case 13: // read modbus resistor value
            bytes.push(
                input.data.slaveId, // 1 byte
                input.data.functionCode, // 1 byte
                input.data.dataType, //byte of dataType
                input.data.numberOfParameters, // 1 byte
                (input.data.Registeraddress >> 8) & 0xFF, // High byte of Registeraddress
                input.data.Registeraddress & 0xFF // Low byte of Registeraddress
            );
            break;
        case 14: // reading alarm config
            bytes.push(
                input.data.index
            );
            break;
        case 15: // reading rs485 configration
            bytes.push(
                input.data.index
            );
            break;
        default:
            break;
    }
    return {
        fPort: portNumber,
        bytes: bytes
    };
}