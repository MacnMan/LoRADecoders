function Decode(fPort, bytes) {
    var result = {};
    result.data = getSensorData(bytes);
    return result;
}
// Function for returning decode encoded data take 1 byte as argument last 2 bits are data type and other 6 are type sensor.
function getDataTypeAndSensor(encodedByte) {
    var result = {};
    result.numRegisters = (encodedByte >> 5) & 0x07; // Extract 3-bit Data Type
    result.dataType = encodedByte & 0x1F; // Extract 5-bit Register Count
    return result;
}
// Returns parameter and its value.
function getSensorData(bytes) {
    var fieldNames = ["level", "temperature", "humidity", "pressure", "windspeed", "winddirection", "rainfall", "snowfall", "co2", "pm2.5", "levelmm", "levelcm", "levelm3"];
    var sensorData = {};
    const loopCount = (bytes.length) - 6;
    let byteIndex;
    for (byteIndex = 1; byteIndex <= loopCount; ) {
        var decodedData = getDataTypeAndSensor(bytes[++byteIndex]);
        var dataType = decodedData.dataType;
        var numRegisters = decodedData.numRegisters;
        let fieldName = fieldNames[numRegisters];
        switch (dataType) {
            case 0: // error
                    sensorData[fieldName] = "Error";
                    ++byteIndex;
            break;
            case 1: // uint16/100
                switch (fieldName) {
                case "temperature":
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/100).toFixed(2))
                    break;
                case "humidity":
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/100).toFixed(2))
                    break;
                case "pressure":
                    sensorData[fieldName] = parseFloat((((bytes[++byteIndex] << 8) | bytes[++byteIndex])/10).toFixed(2))
                    break;
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
