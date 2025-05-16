/**
 * LoRaWAN Decoder V3.0 for LoRaWAN Controllers and Nodes
 * Macnman Technologies Pvt.Ltd
 * Writen By : MACNMAN
 * 
*/
// const data =[0x01, 0x00, 0x07, 0xD7, 0x7D, 0x43, 0x6A, 0x07, 0x53, 0xBF, 0x42, 0xEB, 0x07, 0x35, 0x52, 0x42, 0xEB, 0x0A, 0x07, 0x42, 0x4D, 0x42, 0x48, 0x00, 0x00, 0x7A, 0x9C];
// const data = [0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x05, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0F, 0x29, 0x66, 0xCC, 0x74, 0x21];
// console.log(Decoder(data));
// decoding uploaded data
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
    var zero = '00'; // 
    var hex = byte.toString(16);
    var tmp = 2 - hex.length;
    return zero.substr(0, tmp) + hex + "";
}
// Decoder
function Decoder(bytes, port) {
    var decode = {};
    var devInfo = {};
    devInfo.Mode = bytes[0];
    devInfo.devType = bytes[1];
    devInfo.length = bytes.length;
    if (devInfo.devType === 0) { // if message type is payload and devType is RS485_Node
        decode.devType = "RS485_Node";
        decode.manufacturer = "Macnman India";
        decode.protocall = "LoRaWAN";
        decode.uplinkPort = port;
        decode.deviceID = bytes[1];
        switch (bytes[0]) {
            case 0:
                decode.boot = getRS485Data(bytes);
                break;
            case 1:
                decode.payload = getRS485Data(bytes);
                break;
            case 2:
                decode.responce = getRS485Data(bytes);
                break;
            case 4:
                decode.Alarm = getRS485Data(bytes);
                break;
            default:
                break;
        }
    } else if (devInfo.devType === 1) { // if message type is payload and devType is analog device
        decode.devType = "Analog_Node";
        decode.manufacturer = "Macnman India";
        decode.protocall = "LoRaWAN";
        decode.uplinkPort = port;
        decode.deviceID = bytes[1];
        switch (bytes[0]) {
            case 0:
                decode.boot = getAnalogData(bytes);
                break;
            case 1:
                decode.payload = getAnalogData(bytes);
                break;
            case 2:
                decode.responce = getAnalogData(bytes);
                break;
            case 4:
                decode.responce = getAnalogData(bytes);
                break;
            default:
                break;
        }
    } else if (devInfo.devType === 2) { // if message type is payload and devType is analog device
        decode.devType = "RS485_Relay_Controller";
        decode.manufacturer = "Macnman India";
        decode.protocall = "LoRaWAN";
        decode.uplinkPort = port;
        switch (bytes[0]) {
            case 0:
                decode.boot = getRS485Data(bytes);
                break;
            case 1:
                decode.payload = getRS485Data(bytes);
                break;
            case 2:
                decode.responce = getRS485Data(bytes);
                break;
            case 4:
                decode.responce = getRS485Data(bytes);
                break;
            default:
                break;
        }
    } else if (devInfo.devType === 3) { // if message type is payload and devType is analog device
        decode.devType = "Analog_Relay_Controller";
        decode.manufacturer = "Macnman India";
        decode.protocall = "LoRaWAN";
        decode.uplinkPort = port;
        switch (bytes[0]) {
            case 0:
                decode.boot = getAnalogData(bytes);
                break;
            case 1:
                decode.payload = getAnalogData(bytes);
                break;
            case 2:
                decode.responce = getAnalogData(bytes);
                break;
            default:
                break;
        }
    } else if (devInfo.devType === 10) { // if message type is payload and devType is analog device
        decode.devType = "Temperature Humidity Node";
        decode.manufacturer = "Macnman India";
        decode.protocall = "LoRaWAN";
        decode.uplinkPort = port;
        decode.deviceID = bytes[1];
        switch (bytes[0]) {
            case 0:
                decode.boot = getTempHumiData(bytes);
                break;
            case 1:
                decode.payload = getTempHumiData(bytes);
                break;
                // case 2:
                //     decode.responce = getFanData(bytes);
                //     break;
            default:
                break;
        }
    } else if (devInfo.devType === 11) { // if message type is payload and devType is analog device
        decode.devType = "Level Sensor A02YYUW";
        decode.manufacturer = "Macnman India";
        decode.protocall = "LoRaWAN";
        decode.uplinkPort = port;
        decode.deviceID = bytes[1];
        switch (bytes[0]) {
            case 0:
                decode.boot = getLevelSensorData(bytes);
                break;
            case 1:
                decode.payload = getLevelSensorData(bytes);
                break;
            default:
                break;
        }

    }else if (devInfo.devType === 15) { // if message type is payload and devType is analog device
        decode.devType = "Light Sensor B_LUX_V30B";
        decode.manufacturer = "Macnman India";
        decode.protocall = "LoRaWAN";
        decode.uplinkPort = port;
        decode.deviceID = bytes[1];
        switch (bytes[0]) {
            case 0:
                decode.boot = getLightSensorData(bytes);
                break;
            case 1:
                decode.payload = getLightSensorData(bytes);
                break;
            default:
                break;
        }

    }
    return decode;
}
//
function getAnalogData(bytes) {
    //
    if (bytes[0] === 0) {
        var boot_data = {};
        var fieldIndex = 1;
        boot_data.messageType = "Boot Message";
        boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
        boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
        boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return boot_data;
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
            analog_data.Systimestamp = (bytes[++byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
        } else {
            analog_data.Systimestamp = (bytes[byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
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
//  function for decoding rs485 sensor
function getRS485Data(bytes) {
    //
    if (bytes[0] === 0) {
        var boot_data = {};
        var fieldIndex = 1;
        boot_data.messageType = "Boot Message";
        boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
        boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
        boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return boot_data;
    } else if (bytes[0] == 1) {
        var rs485_data = {};
        var fieldIndex = 1;
        rs485_data.messageType = "Payload";
        var loopCOunt = bytes[1] <= 1 ? (bytes.length - 5) : (bytes.length - 8);
        for (var byteIndex = 2; byteIndex <= loopCOunt; ++byteIndex) {
            // console.log(byteIndex);
            let key = "field" + fieldIndex.toString();
            switch (bytes[byteIndex]) {
                case 0:
                    var unsignedValue = ((bytes[++byteIndex] << 8) | bytes[++byteIndex]);
                    rs485_data[key] = (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
                    break;
                case 1:
                    rs485_data[key] = ((bytes[++byteIndex] << 8) | bytes[++byteIndex]);
                    break;
                case 2:
                    // var unsignedValue= (bytes[++byteIndex] << 24 | bytes[++byteIndex] << 16 | bytes[++byteIndex] << 8 | bytes[++byteIndex]);
                    // rs485_data[key] = (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
                    rs485_data[key] = parseFloat(GetLongInt([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3))
                    break;
                case 3:
                    // reverse
                    // var unsignedValue= (bytes[++byteIndex] << 24 | bytes[++byteIndex] << 16 | bytes[++byteIndex] << 8 | bytes[++byteIndex]);
                    // rs485_data[key] = (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
                    rs485_data[key] = parseFloat(GetLongInt([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 0).toFixed(3))
                    break;
                case 4:
                    rs485_data[key] = parseFloat(GetFloat([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 1).toFixed(3));
                    break;
                case 5:
                    // reverse
                    rs485_data[key] = parseFloat(GetFloat([bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex], bytes[++byteIndex]], 0).toFixed(3));
                    break;
                case 10:
                    rs485_data[key] = "Slave Error";
                    break;
                case 11:
                    rs485_data[key] = "Disabled";
                    break;
                default:
                    break;
            }
            fieldIndex++;
        }
        // rs485_data.byteIndex1 = byteIndex;
        if (bytes[1] == 2) {
            rs485_data.controller = {};
            rs485_data.controller.appType = bytes[byteIndex] ? "Three Phase" : "Single Phase";
            rs485_data.byteIndex2 = byteIndex;
            if (bytes[byteIndex] === 0) {
                rs485_data.controller.r1Status = bytes[++byteIndex] ? "on" : "off";
                rs485_data.controller.r2Status = bytes[++byteIndex] ? "on" : "off";
            } else {
                rs485_data.controller.status = bytes[++byteIndex] ? "on" : "off";
                ++byteIndex;
            }
            rs485_data.Systimestamp = (bytes[++byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
        } else {
            rs485_data.Systimestamp = (bytes[byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
        }
        return rs485_data;
    } else if (bytes[0] == 0x03) {
        var rs485_data = {};
        var fieldIndex = 1;
        rs485_data.messageType = "Responce";
    } else if (bytes[0] == 0x04) {
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
}
// returns a float value from 4 bytes
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
// returns a float value from 4 bytes
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
//  hhh
function getControllerData(bytes) {
    if (bytes[0] === 0) {
        var boot_data = {};
        var fieldIndex = 1;
        boot_data.messageType = "Boot Message";
        boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
        boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
        boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return boot_data;
    } else if (bytes[0] == 1) {
        var payload_data = {};
        var fieldIndex = 1;
        payload_data.messageType = "Payload";

        payload_data.relay1 = bytes[++fieldIndex] ? "on" : "off";
        payload_data.relay2 = bytes[++fieldIndex] ? "on" : "off";
        payload_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return payload_data;
    } else if (bytes[0] == 2) {
        var responce_data = {};
        var fieldIndex = 1;
        responce_data.messageType = "Responce Message";
        switch (bytes[++fieldIndex]) {
            case 5:
                responce_data.fan1_satus = bytes[++fieldIndex] ? "on" : "off";
                responce_data.fan2_satus = bytes[++fieldIndex] ? "on" : "off";
                responce_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                return responce_data;
            case 6:
                responce_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]);
                responce_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                return responce_data;
            case 7:
                responce_data.offline_status = bytes[++fieldIndex] ? "on" : "off";
                responce_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
                return responce_data;

        }

    }
}
// returns data for temperature humididity node
function getTempHumiData(bytes) {
    if (bytes[0] === 0) {
        var boot_data = {};
        var fieldIndex = 1;
        boot_data.messageType = "Boot Message";
        boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
        boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
        boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return boot_data;
    } else if (bytes[0] == 1) {
        var payload_data = {};
        var fieldIndex = 1;
        payload_data.messageType = "Payload";
        payload_data.temperature = (((bytes[++fieldIndex] << 8) + bytes[++fieldIndex]) / 100);
        payload_data.humidity = (((bytes[++fieldIndex] << 8) + bytes[++fieldIndex]) / 100);
        payload_data.battery = ((bytes[++fieldIndex]) / 10);
        payload_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return payload_data;
    }
}
// returns data for level sensor
function getLevelSensorData(bytes) {
    if (bytes[0] === 0) {
        var boot_data = {};
        var fieldIndex = 1;
        boot_data.messageType = "Boot Message";
        boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
        boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
        boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return boot_data;
    } else if (bytes[0] == 1) {
        var payload_data = {};
        var fieldIndex = 1;
        payload_data.messageType = "Payload";
        payload_data.levelcm = (((bytes[++fieldIndex] << 8) + bytes[++fieldIndex]) / 10);
        payload_data.inverceLevel = 450 - payload_data.levelcm;
        payload_data.sensingDistance = 450.01;
        payload_data.levelmm = payload_data.levelcm * 10;
        payload_data.battery = ((bytes[++fieldIndex]) / 10);
        payload_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return payload_data;
    }
}
// returns light sensor data only
function getLightSensorData(bytes){
    if (bytes[0] === 0) {
        var boot_data = {};
        var fieldIndex = 1;
        boot_data.messageType = "Boot Message";
        boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
        boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
        boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return boot_data;
    } else if (bytes[0] == 1) {
        var payload_data = {};
        var fieldIndex = 3;
        payload_data.messageType = "Payload";
        if(bytes[2]===0){            
            payload_data.lux = "Error";
            payload_data.batt = bytes[fieldIndex]/10;
            payload_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        }else{
            payload_data.rawData = (bytes[fieldIndex] << 24) + ((bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex]);
            payload_data.lux = ((payload_data.rawData * 1.4) / 1000 );
            payload_data.batt = bytes[fieldIndex]/10;
            payload_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        }
        return payload_data;
    }
}