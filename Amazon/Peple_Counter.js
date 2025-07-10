/**
 * LoRaWAN Decoder for parkomate 
 * Macnman Technologies Pvt.Ltd
 * Writen By : MACNMAN
 * 01da00000004000b000f00060000682c5ed7
*/
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
    var zero = '00';
    var hex = byte.toString(16);
    var tmp = 2 - hex.length;
    return zero.substr(0, tmp) + hex + "";
}

// decoding uploaded data
function Decoder(bytes, port) {
    if (bytes[0] === 0) {
        return decodeBootMessage(bytes); // decode boot message bytes
    } else if (bytes[0] == 0x01) {
        return decodeUplinkBytes(bytes); // decode payload bytes
    } else if (bytes[0] == 0x02) {
        return decodeResponce(bytes); // decodes responce bytes
    } else if (bytes[0] == 0x03) {
        return decodeAlarm(bytes); // decode alarm message bytes
    }
    return "Error";
}

// Convert bytes to signed 32-bit integer
function toSigned16(unsignedValue) {
  return (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
}

//
function decodeUplinkBytes(bytes) {
    var payload = {};
    var dataIndex = 0; // adjust if data starts from a different index
    payload.messageType = "Payload";
    // Get device ID
    payload.deviceId = bytes[++dataIndex];
    payload.entries = toSigned16((bytes[++dataIndex] << 8) | bytes[++dataIndex]);
    payload.exits = toSigned16((bytes[++dataIndex] << 8) | bytes[++dataIndex]);
    payload.occupancy = toSigned16((bytes[++dataIndex] << 8) | bytes[++dataIndex]);
    payload.total_entrance = toSigned16((bytes[++dataIndex] << 8) | bytes[++dataIndex]);
    payload.Systimestamp = (bytes[++dataIndex] << 24) + (bytes[++dataIndex] << 16) + (bytes[++dataIndex] << 8) + bytes[++dataIndex];
    return payload;
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