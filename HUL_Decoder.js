// decoding uploaded data
function decodeUplink(input) {
    return {
        data: {
            Payload: getRS485Data(input.bytes),//Decoder(input.bytes, input.port),
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


function getRS485Data(bytes) {
    //

    if (bytes[0] === 0) {
        var boot_data = {};
        var fieldIndex = 1;
        boot_data.Mode = bytes[0];
        boot_data.length = bytes.length;
        boot_data.messageType = "Boot Message";
        boot_data.OEM_ID = str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]) + str_pad(bytes[++fieldIndex]);
        boot_data.FR = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.HW = str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]) + "." + str_pad(bytes[++fieldIndex]);
        boot_data.TDCM = (bytes[++fieldIndex] << 8 | bytes[++fieldIndex]); //millisec
        boot_data.Systimestamp = (bytes[++fieldIndex] << 24) + (bytes[++fieldIndex] << 16) + (bytes[++fieldIndex] << 8) + bytes[++fieldIndex];
        return boot_data;
    } else if (bytes[0] == 1) {
        var rs485_data = {};
        rs485_data.Mode = bytes[0];
        rs485_data.length = bytes.length;
        fieldIndex = 1;
        var loopCOunt = (bytes.length) - 5;
        for (var byteIndex = 1; byteIndex <= loopCOunt; ++byteIndex) {
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
        rs485_data.Systimestamp = (bytes[byteIndex] << 24) + (bytes[++byteIndex] << 16) + (bytes[++byteIndex] << 8) + bytes[++byteIndex];
    }
    return rs485_data;
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