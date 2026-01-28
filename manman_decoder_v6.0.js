/**
 * LoRaWAN Decoder V5.0 for LoRaWAN Controllers and Nodes
 * 29-Sep-2025
 * Macnman Technologies Pvt.Ltd
 * Writen By : Prabhudayal Patel
 **/

function Decode(fPort, bytes) {
    return decodeUplink(bytes);

}

// Convert hex string to byte array
function hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

// const hexPayload = "0110204023697a161a";  // paste raw hex payload here

// const testBytes = hexToBytes(hexPayload);
// console.dir(decodeUplink({ bytes: testBytes , port: 1 }),{ depth: null });



const devTypes = {
    0: "RS485_Node",
    1: "Analog_Node",
    2: "RS485_Controller",
    3: "Analog_Controller",
    16: "MacSense_V2.0",
};
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
//
function getDeviceinfo(bytes, port) {
    var devInfo = {};
    devInfo.manufacturer = "Macnman India",
        devInfo.protocall = "LoRaWAN",
        devInfo.uplinkPort = port,
        devInfo.deviceID = bytes[1],
        // devInfo.devType = devTypes[bytes[1]];
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
//
function getAnalogData(bytes) {
    if (bytes[0] === 0) {
        return decodeBootMessage(bytes); // decode boot message bytes
    } else if (bytes[0] == 1) {
        var analog_data = {};
        var fieldIndex = 0;
        analog_data.messageType = "Payload";
        analog_data.analogData = {};
        // Determine payload structure based on the first byte
        var loopCount = bytes[1] <= 1 ? (bytes.length - 5) : (bytes.length - 8);
        for (var byteIndex = 2; byteIndex <= loopCount; ++byteIndex) {
            switch (bytes[byteIndex]) {
                case 0:
                    analog_data.analogData["channel_" + String.fromCharCode(97 + fieldIndex)] = "disabled";
                    break;
                case 1:
                    analog_data.analogData["channel_" + String.fromCharCode(97 + fieldIndex) + "_current"] = ((bytes[++byteIndex] << 8) | bytes[++byteIndex]) / 1000;
                    break;
                case 2:
                    analog_data.analogData["channel_" + String.fromCharCode(97 + fieldIndex) + "_voltage"] = ((bytes[++byteIndex] << 8) | bytes[++byteIndex]) / 1000;
                    break;
                case 3:
                    analog_data.analogData["channel_" + String.fromCharCode(97 + fieldIndex) + "_level"] = (((bytes[++byteIndex] << 8) | bytes[++byteIndex]) / 1000) > 1.8 ? "HIGH" : "LOW";
                    break;
                default:
                    break;
            }
            fieldIndex++;
        }

        // Parse controller data if available
        if (bytes[1] == 3) {
            analog_data.controller = {};
            analog_data.controller.appType = bytes[byteIndex] ? "Three Phase" : "Single Phase";
            if (bytes[byteIndex] === 0) {
                analog_data.controller.r1Status = bytes[++byteIndex] ? "on" : "off";
                analog_data.controller.r2Status = bytes[++byteIndex] ? "on" : "off";
            } else {
                analog_data.controller.status = bytes[++byteIndex] ? "on" : "off";
                ++byteIndex;
            }
            // analog_data.Systimestamp = (bytes[++byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
        } else {
            // analog_data.Systimestamp = (bytes[byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
        }

        return analog_data;
    } else if (bytes[0] == 0x04) {
        var trigger_data = {};
        var fieldIndex = 2;
        trigger_data.messageType = "Alarm";
        if (bytes[fieldIndex] == 0x0A) {
            trigger_data.Trigger1 = "Error";
        } else if (bytes[fieldIndex] == 0x0B) {
            trigger_data.Trigger1 = "Disabled";
        } else {
            trigger_data.T1 = bytes[fieldIndex]; //GetLongInt([bytes[fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1);
            var key = "setPoint1";
            switch (bytes[++fieldIndex]) {
                case 0:
                    trigger_data[key] = "disabled";
                    break;
                case 1:
                    trigger_data[key] = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]) / 1000;
                    break;
                case 2:
                    trigger_data[key] = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]) / 1000;
                    break;
                case 3:
                    trigger_data.analogData[key] = (((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]) / 1000) > 1.8 ? "HIGH" : "LOW";
                    break;
                default:
                    break;
            }
            trigger_data.T2 = bytes[++fieldIndex];;
        }
        // second trigger
        ++fieldIndex;
        // console.log(fieldIndex);
        if (bytes[fieldIndex] == 0x0A) {
            trigger_data.Trigger2 = "Error";
        } else if (bytes[fieldIndex] == 0x0B) {
            trigger_data.Trigger2 = "Disabled";
        } else {
            trigger_data.T3 = bytes[fieldIndex];
            var key = "setPoint2";
            switch (bytes[++fieldIndex]) {
                case 0:
                    trigger_data[key] = "disabled";
                    break;
                case 1:
                    trigger_data[key] = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]) / 1000;
                    break;
                case 2:
                    trigger_data[key] = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]) / 1000;
                    break;
                case 3:
                    trigger_data.analogData[key] = (((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]) / 1000) > 1.8 ? "HIGH" : "LOW";
                    break;
                default:
                    break;
            }
            trigger_data.T4 = bytes[++fieldIndex];
        }
        return trigger_data;
    }
}
// function for retriving dataType and numberofparameters
function decodeByte(encodedByte) {
    let dataType = (encodedByte >> 5) & 0x07; // Extract 3-bit Data Type
    let numRegisters = encodedByte & 0x1F; // Extract 5-bit Register Count
    return {
        dataType,
        numRegisters
    };
}
//
function decodeUplinkBytes(bytes, isResponce) {
    const rs485_data = {
        messageType: "Payload"
    };
    let fieldIndex = 1;
    const loopCount = bytes[1] <= 1 ? bytes.length - 6 : bytes.length - 8;
    for (let byteIndex = 2; byteIndex <= loopCount; ++byteIndex) {
        const key = `field${fieldIndex}`;
        let dataType, numberOfParameter;

        const decoded = decodeByte(bytes[byteIndex]);

        dataType = decoded.dataType;
        numberOfParameter = decoded.numRegisters;
        const params = [];
        switch (dataType) {
            case 0:
                for (let i = 0; i < numberOfParameter; i++) {
                    const value = (bytes[++byteIndex] << 8) | bytes[++byteIndex];
                    params.push((value & 0x8000) ? -(0x10000 - value) : value);
                }
                rs485_data[key] = (numberOfParameter === 1) ? params[0] : params;
                break;

            case 1:
                for (let i = 0; i < numberOfParameter; i++) {
                    params.push((bytes[++byteIndex] << 8) | bytes[++byteIndex]);
                }
                rs485_data[key] = (numberOfParameter === 1) ? params[0] : params;
                break;

            case 2:
            case 3:
                const isReversed = dataType === 3;
                for (let i = 0; i < numberOfParameter; i++) {
                    const floatVal = parseFloat(
                        GetLongInt(
                            [bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]],
                            isReversed ? 0 : 1
                        ).toFixed(3)
                    );
                    params.push(floatVal);
                }
                rs485_data[key] = (numberOfParameter === 1) ? params[0] : params;
                break;

            case 4:
            case 5:
                const reverseFloat = dataType === 5;
                for (let i = 0; i < numberOfParameter; i++) {
                    const floatVal = parseFloat(
                        GetFloat(
                            [bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]],
                            reverseFloat ? 0 : 1
                        ).toFixed(3)
                    );
                    params.push(floatVal);
                }
                rs485_data[key] = (numberOfParameter === 1) ? params[0] : params;
                break;

            case 6:
                rs485_data[key] = "Disabled";
                break;

            case 7:
                rs485_data[key] = "Slave Error";
                break;
        }
        fieldIndex++;
    }

    if (bytes[1] === 2) {
        rs485_data.controller = {};
        rs485_data.controller.appType = bytes[loopCount + 1] ? "Three Phase" : "Single Phase";
        if (bytes[loopCount + 1] === 0) {
            rs485_data.controller.r1Status = bytes[loopCount + 2] ? "on" : "off";
            rs485_data.controller.r2Status = bytes[loopCount + 3] ? "on" : "off";
        } else {
            rs485_data.controller.status = bytes[loopCount + 2] ? "on" : "off";
        }
    }
    return rs485_data;
}
// fucntion for decoding responces.
function decodeResponce(bytes) {
    var responceData = {};
    var fieldIndex = 1;
    responceData.messageType = "Responce";
    responceData.portNumber = bytes[++fieldIndex];
    responceData.status = bytes[++fieldIndex] === 0 ? "SUCCSESS" : "ERROR";
    if (responceData.status === "SUCCSESS") {
        switch (responceData.portNumber) {
            case 5: // responce changing tx time.
                responceData.applicationType = bytes[++fieldIndex] === 0 ? "Single Phase" : "Three Phase";
                responceData.relay1 = bytes[++fieldIndex];
                responceData.relay2 = bytes[++fieldIndex];
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            case 6: // responce changing tx time.
                responceData.txTime = (bytes[++fieldIndex] << 8) | bytes[++fieldIndex];
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            case 8: // responce writing coils.
                responceData.slaveId = bytes[++fieldIndex];
                responceData.numberofreg = bytes[++fieldIndex];
                responceData.address = (bytes[++fieldIndex] << 8) | bytes[++fieldIndex];
                if (responceData.numberofreg === 1) {
                    responceData.value = (bytes[++fieldIndex] << 8) | bytes[++fieldIndex];
                } else {
                    responceData.value = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                }
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            case 9: // responce writing resistor.
                responceData.slaveId = bytes[++fieldIndex];
                responceData.numberofreg = bytes[++fieldIndex];
                responceData.address = (bytes[++fieldIndex] << 8) | bytes[++fieldIndex];
                if (numberofreg === 1) {
                    responceData.value = (bytes[++fieldIndex] << 8) | bytes[++fieldIndex];
                } else {
                    responceData.value = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                }
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            case 10: // responce of changing reading configration.
                responceData.field = bytes[++fieldIndex];
                responceData.slaveId = bytes[++fieldIndex];
                responceData.functionCode = bytes[++fieldIndex];
                responceData.enable = bytes[++fieldIndex];
                responceData.dataType = bytes[++fieldIndex];
                responceData.numberOfResistors = bytes[++fieldIndex];
                responceData.address = (bytes[++fieldIndex] << 8) | bytes[++fieldIndex];
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            case 11: // responce alarms configration.
                responceData.index = bytes[++fieldIndex];
                responceData.startTime = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                responceData.stopTime = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                responceData.dayData = bytes[++fieldIndex];
                responceData.relayStatus = bytes[++fieldIndex];
                responceData.triggerType = bytes[++fieldIndex];
                responceData.enable = bytes[++fieldIndex];
                if (responceData.triggerType === 2) {
                    responceData.onTime = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                    responceData.offTime = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                } else if (responceData.triggerType === 3) {
                    responceData.sensorValue = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                    responceData.level = bytes[++fieldIndex];
                    responceData.rs485Field = bytes[++fieldIndex];
                }
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            case 12: // responce baudrate.
                responceData.baudrate = (bytes[++fieldIndex] << 8) | bytes[++fieldIndex];
                responceData.parity = bytes[++fieldIndex];
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            case 13: // responce of reading baudrate.
                responceData.values = decodeUplinkBytes(bytes.slice(2));
                responceData.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                break;
            default:
                break;
        }
    }
    return responceData;
}
// decode Alarm.
function decodeAlarm(bytes) {
    var trigger_data = {};
    var fieldIndex = 2;
    trigger_data.messageType = "Alarm";
    if (bytes[fieldIndex] == 0x0A) {
        trigger_data.Trigger1 = "Error";
    } else if (bytes[fieldIndex] == 0x0B) {
        trigger_data.Trigger1 = "Disabled";
    } else {
        trigger_data.T1 = GetLongInt([bytes[fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1);
        var key = "setPoint1";
        switch (bytes[++fieldIndex]) {
            case 0:
                var unsignedValue = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]);
                trigger_data["setPoint1"] = (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
                break;
            case 1:
                trigger_data[key] = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]);
                break;
            case 2:
                trigger_data[key] = parseFloat(GetLongInt([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1).toFixed(3))
                break;
            case 3:
                trigger_data[key] = parseFloat(GetLongInt([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 0).toFixed(3))
                break;
            case 4:
                trigger_data[key] = parseFloat(GetFloat([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1).toFixed(3));
                break;
            case 5:
                trigger_data[key] = parseFloat(GetFloat([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 0).toFixed(3));
                break;
            case 10:
                trigger_data[key] = "Slave Error";
                break;
            case 11:
                trigger_data[key] = "Disabled";
                break;
            default:
                break;
        }
        trigger_data.T2 = GetLongInt([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1);
    }
    // second trigger
    ++fieldIndex;
    // console.log(fieldIndex);
    if (bytes[fieldIndex] == 0x0A) {
        trigger_data.Trigger2 = "Error";
    } else if (bytes[fieldIndex] == 0x0B) {
        trigger_data.Trigger2 = "Disabled";
    } else {
        trigger_data.T3 = GetLongInt([bytes[fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1);
        var key = "setPoint2";
        switch (bytes[++fieldIndex]) {
            case 0:
                var unsignedValue = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]);
                trigger_data[key] = (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
                break;
            case 1:
                trigger_data[key] = ((bytes[++fieldIndex] << 8) | bytes[++fieldIndex]);
                break;
            case 2:
                trigger_data[key] = parseFloat(GetLongInt([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1).toFixed(3))
                break;
            case 3:
                trigger_data[key] = parseFloat(GetLongInt([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 0).toFixed(3))
                break;
            case 4:
                trigger_data[key] = parseFloat(GetFloat([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1).toFixed(3));
                break;
            case 5:
                trigger_data[key] = parseFloat(GetFloat([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 0).toFixed(3));
                break;
            case 10:
                trigger_data[key] = "Slave Error";
                break;
            case 11:
                trigger_data[key] = "Disabled";
                break;
            default:
                break;
        }
        trigger_data.T4 = GetLongInt([bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex], bytes[++fieldIndex]], 1);
    }
    return trigger_data;
}
//  function for decoding rs485 sensor.
function getRS485Data(bytes) {
    if (bytes[0] === 0) {
        return decodeBootMessage(bytes); // decode boot message bytes
    } else if (bytes[0] == 0x01) {
        return decodeUplinkBytes(bytes, 0); // decode payload bytes
    } else if (bytes[0] == 0x02) {
        return decodeResponce(bytes); // decodes responce bytes
    } else if (bytes[0] == 0x03) {
        return decodeAlarm(bytes); // decode alarm message bytes
    }
    return "Error";
}
// returns a float value from 4 bytes.
function GetFloat(dataBytes, isMsb) {
    // Create a new ArrayBuffer with 4 bytes of data
    const buffer = new ArrayBuffer(4);
    // Create a DataView to work with the buffer
    const view = new DataView(buffer);
    var startbit = 0;
    if (isMsb) {
        view.setUint8(0, dataBytes[startbit++]); // Byte 0 (most significant byte)
        view.setUint8(1, dataBytes[startbit++]); // Byte 1
        view.setUint8(2, dataBytes[startbit++]); // Byte 2
        view.setUint8(3, dataBytes[startbit++]); // Byte 3 (least significant byte)
        return view.getFloat32(0, false); // true indicates little-endian byte order
    }
    view.setUint8(2, dataBytes[startbit++]); // Byte 2
    view.setUint8(3, dataBytes[startbit++]); // Byte 3 (least significant byte)
    view.setUint8(0, dataBytes[startbit++]); // Byte 0 (most significant byte)
    view.setUint8(1, dataBytes[startbit++]); // Byte 1
    return view.getFloat32(0, false); // true indicates little-endian byte order
}
// returns a float value from 4 bytes.
function GetLongInt(dataBytes, isMsb) {
    // Create a new ArrayBuffer with 4 bytes of data
    const buffer = new ArrayBuffer(4);
    // Create a DataView to work with the buffer
    const view = new DataView(buffer);
    var startbit = 0;
    if (isMsb) {
        view.setUint8(0, dataBytes[startbit++]); // Byte 0 (most significant byte)
        view.setUint8(1, dataBytes[startbit++]); // Byte 1
        view.setUint8(2, dataBytes[startbit++]); // Byte 2
        view.setUint8(3, dataBytes[startbit++]); // Byte 3 (least significant byte)
        return view.getInt32(0, false); // true indicates little-endian byte order
    }
    view.setUint8(2, dataBytes[startbit++]); // Byte 2
    view.setUint8(3, dataBytes[startbit++]); // Byte 3 (least significant byte)
    view.setUint8(0, dataBytes[startbit++]); // Byte 0 (most significant byte)
    view.setUint8(1, dataBytes[startbit++]); // Byte 1
    return view.getInt32(0, false); // true indicates little-endian byte order
}
// returns a float value from 4 bytes.
function GetFloatFromBytes(byteArray, isLittleEndian = 1) {
    return new DataView(Uint8Array.from(byteArray).buffer).getFloat32(0, isLittleEndian === 1);
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
        var numRegisters = decodedData.numRegisters;
        let fieldName = fieldNames[numRegisters];
        switch (dataType) {
            case 0: // error
                    sensorData[fieldName] = "Error";
            break;
            case 1: // uint16/100
                switch (fieldName) {
                case "temperature":
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/100).toFixed(2))
                    break
                case "humidity":
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/100).toFixed(2))
                    break
                case "pressure":
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/10).toFixed(2))
                    break
                case "level":
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/10).toFixed(2))
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

