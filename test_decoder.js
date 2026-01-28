function hexToBytes(hex) {
    const bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}

const hexPayload = "0110210A7D61250881000A236979B6EC";  // paste raw hex payload here
console.log("Hex Payload: ", hexPayload);

const testBytes = hexToBytes(hexPayload);
console.dir(getMacSenseData({ bytes: testBytes , port: 1 }),{ depth: null });

var fieldNames = ["level", "temperature", "humidity", "pressure", "windspeed", "winddirection", "rainfall", "snowfall", "co2", "pm2.5", "levelmm", "levelcm", "levelm3"];


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