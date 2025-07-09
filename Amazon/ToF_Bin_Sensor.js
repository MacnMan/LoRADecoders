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
//
function decodeUplinkBytes(bytes) {
    var payload = {};
    var startIndex = 2; // adjust if data starts from a different index
    var matrix = [];
    payload.messageType = "Payload";
    // Get device ID
    payload.deviceId = bytes[1];
    if(bytes[2] == 255){
        payload.status = "Sensor Error";
        return payload;
    }
    // Create 8x8 matrix from the bytes
    for (var row = 0; row < 8; row++) {
        var rowData = [];
        for (var col = 0; col < 8; col++) {
            var index = startIndex + row * 8 + col;
            rowData.push(bytes[index]);
        }
        matrix.push(rowData);
    }
    payload.matrix = matrix;
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