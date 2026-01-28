/**
 * LoRaWAN Decoder V4.0 for LoRaWAN Controllers and Nodes
 * Macnman Technologies Pvt.Ltd
 * Writen By : MACNMAN
 * 
 **/
// const data = [
// 0x01, 0x00, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0x68, 0x5A, 0x46, 0xE9
// ];

// console.log(decodeUplink({ bytes: data , port: 1 }));
// console.dir(decodeUplink({ bytes: data , port: 1 }),{ depth: null });
const devTypes = {
    0: "RS485_Node",
    1: "Analog_Node",
    2: "RS485_Controller",
    3: "Analog_Controller",
    16: "MacSense_V2.0",
};
//
var fieldNames = ["level", "temperature", "humidity", "pressure", "windspeed", "winddirection", "rainfall", "snowfall", "co2", "pm2.5", "levelmm", "levelcm", "levelm3"];
//
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
                    decode.payload = parser(bytes);
                    decode.deviceinfo = getDeviceinfo(bytes, port);
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
//
function getDeviceinfo(bytes, port) {
    var devInfo = {};
    devInfo.manufacturer = "Macnman India",
        devInfo.protocall = "LoRaWAN",
        devInfo.uplinkPort = port,
        devInfo.deviceID = bytes[1],
        devInfo.devType = devTypes[bytes[1]];
    byteIndex = bytes.length - 6;
    devInfo.battery = ((bytes[++byteIndex]) / 10);
    devInfo.Systimestamp = (bytes[++byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
    return devInfo;
}
//
function decodeBootMessage(bytes) {
    var boot_data = {};
    var fieldIndex = 1;
    boot_data.messageType = "Boot Message";
    boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
    boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
    boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
    boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
    boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
    return boot_data;
}
// for decoding data from new sensors with its id.
function decodeSamplingData(bytes) {
    var sampleData = {};
    let byteIndex = 1;
    fieldIndex = 1;
    const loopCount = (bytes.length) - 8;
    sampleData.parameter = fieldNames[bytes[++byteIndex]];
    sampleData.noofsamples = bytes[++byteIndex];
    for (byteIndex = 3; byteIndex <= loopCount; byteIndex) {
        const key = `${sampleData.parameter}${fieldIndex++}`;
        if (bytes[byteIndex] != 0xFF) {
            sampleData[key] = parseFloat(GetFloatFromBytes([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3))
        } else {
            sampleData[key] = "Error";
            ++byteIndex
        }
    }
    sampleData.battery = ((bytes[++byteIndex]) / 10);
    sampleData.Systimestamp = (bytes[++byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
    return sampleData;
}
// for decoding data from new sensors with its id.
function decodeTrigerData(bytes) {
    var triggerData = {};
    var byteIndex = 1;
    triggerData.threshould1 = parseFloat(GetFloatFromBytes([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3));
    triggerData[fieldNames[bytes[++byteIndex]]] = parseFloat(GetFloatFromBytes([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3));
    triggerData.threshould2 = parseFloat(GetFloatFromBytes([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3));
    // triggerData.battery = ((bytes[++byteIndex]) / 10);
    // triggerData.Systimestamp = (bytes[++byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
    return triggerData;

}
// Returns parameter and its value.
function getSensorData(bytes) {
    var sensorData = {};
    const loopCount = (bytes.length) - 6;
    const fieldCounters = {};
    let byteIndex;
    for (byteIndex = 2; byteIndex <= loopCount; ++byteIndex) {
        let fieldName = fieldNames[bytes[byteIndex]];
        if (!fieldCounters[fieldName]) {
            fieldCounters[fieldName] = 1;
            if (bytes[byteIndex] != 0xFF) {
                sensorData[fieldName] = parseFloat(GetFloatFromBytes([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3))
            } else {
                sensorData[fieldName] = "Error";
                ++byteIndex
            }
        } else {
            fieldCounters[fieldName]++;
            const indexedFieldName = `${fieldName}${fieldCounters[fieldName]}`;
            if (bytes[byteIndex] != 0xFF) {
                sensorData[indexedFieldName] = parseFloat(GetFloatFromBytes([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3))
            } else {
                sensorData[indexedFieldName] = "Error";
                ++byteIndex
            }
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
    const portNumber = input.fPort;
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