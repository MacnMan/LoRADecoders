// decoding uploaded data
function decodeUplink(input) {
    return {
        data: {
           // Payload: convertToSenML(Decoder(input.bytes, input.port)),
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
// Decoder
function Decoder(bytes, port) {
    var decode = {};
    var devInfo = {};
    devInfo.Mode = bytes[0];
    devInfo.devType = bytes[1];
    devInfo.length = bytes.length;
    if (devInfo.devType === 11) { // if message type is payload and devType is analog device
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

    }
    return decode;
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


