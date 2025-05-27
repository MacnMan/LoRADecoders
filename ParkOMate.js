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
// Convert bytes to signed 32-bit integer
function toSigned16(unsignedValue) {
  return (unsignedValue & 0x8000) ? -(0x10000 - unsignedValue) : unsignedValue;
}
// decoding uploaded data
function Decoder(bytes, port) {
    var dataIndex = 0;
    var payloadData = {
        "devId": bytes[dataIndex++],
        "msgType": bytes[dataIndex++] == 0x01 ? "event" : "heartbeat",
        "length": bytes.length,
        "oem": "MACNMAN",
        "device": "ParkOMate_LWAN_V1.0",
        "version": "1.0",
    }
    payloadData.sensorInfo = {};
    payloadData.parkStatus = bytes[dataIndex++] == 0x01 ? true : false;
    payloadData.sensorInfo.xOffset = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.sensorInfo.yOffset = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);   
    payloadData.sensorInfo.zOffset = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.sensorInfo.xData = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.sensorInfo.yData = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.sensorInfo.zData = toSigned16((bytes[dataIndex++] << 8) | bytes[dataIndex++]);
    payloadData.Systimestamp = (bytes[dataIndex++] << 24) + (bytes[dataIndex++] << 16) + (bytes[dataIndex++] << 8) + bytes[dataIndex++];
    return payloadData;
}