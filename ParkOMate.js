/**
 * LoRaWAN Decoder for parkomate 
 * Macnman Technologies Pvt.Ltd
 * Writen By : MACNMAN
 * 01da00000004000b000f00060000682c5ed7
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

function toSigned16(unsignedValue) {
  return (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
}

function Decoder(bytes, port) {
    var payloadData = {
        // "event": 0,
        // "oem": "MACNMAN",
        // "device": "ParkOMate_LWAN_V1.0",
    }
    var dataIndex = 0;
    // payloadData.xOffset = (bytes[dataIndex++] << 8) + bytes[dataIndex++];
    payloadData.xOffset = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.yOffset = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);   
    payloadData.zOffset = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.xData = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.yData = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.zData = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    // payloadData.xDiff = payloadData.xData - payloadData.xOffset;
    // payloadData.yDiff = payloadData.yData - payloadData.yOffset;    
    // payloadData.zDiff = payloadData.zData - payloadData.zOffset;
    payloadData.Systimestamp = (bytes[dataIndex++] << 24) + (bytes[dataIndex++] << 16) + (bytes[dataIndex++] << 8) + bytes[dataIndex++];
    return payloadData;
}