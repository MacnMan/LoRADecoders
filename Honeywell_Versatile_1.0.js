/*
    Honeywell Versatile Data Decoder
    Version: 1.00
    */

function decodeUplink(input) {
    var data = input.bytes;
    var valid = true;

    if (typeof Decoder === "function") {
        data = Decoder(data, input.fPort);
    }

    if (typeof Converter === "function") {
        data = Converter(data, input.fPort);
    }

    if (typeof Validator === "function") {
        valid = Validator(data, input.fPort);
    }

    if (valid) {
        return { data: data };
    } else {
        return { data: {}, errors: ["Invalid data received"] };
    }
}

function Decoder(byte, port) {
    const EVENT_PROPERTY_NAMES = [
        "Ambient_Temp", "Surface_Temp", "Ambient_Pressure", "Ambient_Humidity",
        "Battery", "Vib_Accel_X_Axis", "Vib_Accel_Y_Axis", "Vib_Accel_Z_Axis",
        "Vib_Velocity_X_Axis", "Vib_Velocity_Y_Axis", "Vib_Velocity_Z_Axis", "Audio"
    ];

    var pktTime = (byte[3] << 24) | (byte[2] << 16) | (byte[1] << 8) | byte[0];

    // ---------------- Periodic Measurements ----------------
    if (port === 0x02) {
        const GCONVERSION = 9.8;

        for (let i = 4; i < 10; i++) {
            if (byte[i] > 127) byte[i] = (256 - byte[i]) * -1;
        }

        var decoded = {
            timestamp: pktTime,
            var_Ambient_Temp_Max: byte[4],
            var_Ambient_Temp_Min: byte[5],
            var_Ambient_Temp_Avg: byte[6],
            var_Surface_Temp_Max: byte[7],
            var_Surface_Temp_Min: byte[8],
            var_Surface_Temp_Avg: byte[9],
            var_Ambient_Pressure_Max: (byte[10] * 3) + 300,
            var_Ambient_Pressure_Min: (byte[11] * 3) + 300,
            var_Ambient_Pressure_Avg: (byte[12] * 3) + 300,
            var_Ambient_Humidity_Max: byte[13],
            var_Ambient_Humidity_Min: byte[14],
            var_Ambient_Humidity_Avg: byte[15],

            var_Vib_Accel_X_Axis_Max: byte[16] / GCONVERSION,
            var_Vib_Accel_X_Axis_Min: byte[17] / GCONVERSION,
            var_Vib_Accel_X_Axis_RMS: byte[18] / GCONVERSION,

            var_Vib_Accel_Y_Axis_Max: byte[19] / GCONVERSION,
            var_Vib_Accel_Y_Axis_Min: byte[20] / GCONVERSION,
            var_Vib_Accel_Y_Axis_RMS: byte[21] / GCONVERSION,

            var_Vib_Accel_Z_Axis_Max: byte[22] / GCONVERSION,
            var_Vib_Accel_Z_Axis_Min: byte[23] / GCONVERSION,
            var_Vib_Accel_Z_Axis_RMS: byte[24] / GCONVERSION,

            var_Vib_Velocity_X_Axis_Max: byte[25] / 10,
            var_Vib_Velocity_X_Axis_Min: byte[26] / 10,
            var_Vib_Velocity_X_Axis_RMS: byte[27] / 10,
            var_Vib_Velocity_Y_Axis_Max: byte[28] / 10,
            var_Vib_Velocity_Y_Axis_Min: byte[29] / 10,
            var_Vib_Velocity_Y_Axis_RMS: byte[30] / 10,
            var_Vib_Velocity_Z_Axis_Max: byte[31] / 10,
            var_Vib_Velocity_Z_Axis_Min: byte[32] / 10,
            var_Vib_Velocity_Z_Axis_RMS: byte[33] / 10,

            var_Audio_dBSPL: byte[34],
            var_Audio_Max: byte[35],
            var_Audio_Min: byte[36],
            var_Remaining_battery_perc: byte[37]
        };

        return decoded;
    }

    // ---------------- Event Messages ----------------
    if (port === 8) {
        var decoded_8 = { timestamp: pktTime };
        var Sensor_Type = byte[4];
        var Event_Type = byte[5];

        if (Sensor_Type < 4) {  // Regular sensors
            var Event_Data = byte[6];
            if (Sensor_Type <= 1 && Event_Data > 127) Event_Data = (256 - byte[6]) * -1;
            else if (Sensor_Type === 2) Event_Data = ((byte[6] * 3) + 300);

            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = Event_Type;
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Data"] = Event_Data;
            return decoded_8;
        }
        else if (Sensor_Type > 4 && Sensor_Type <= 11) { // Vib/Acoustic alarms
            var Freq_Band = byte[7];
            var Freq_Value = (byte[10] << 16) | (byte[9] << 8) | byte[8];
            var Amplitude = byte[11];
            if (Sensor_Type !== 11) Amplitude = Amplitude / 10;

            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = Event_Type;
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Freq" + Freq_Band] = Freq_Value;
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Amp" + Freq_Band] = Amplitude;
            return decoded_8;
        }
        else if (Sensor_Type === 4) { // Battery
            decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = Event_Type;
            if (Event_Type === 1)
                decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Voltage"] = 3 + (byte[6] * 0.004);
            else if (Event_Type === 2)
                decoded_8["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Life"] = byte[6];
            return decoded_8;
        }
    }

    // ---------------- Diagnostics ----------------
    if (port === 11) {
        var Diag_Status = (byte[5] << 8) | byte[4];
        var decoded_11 = { timestamp: pktTime, Diag_Status: Diag_Status };

        for (let Sensor_Type = 0; Sensor_Type < 12; Sensor_Type++) {
            decoded_11["event_" + EVENT_PROPERTY_NAMES[Sensor_Type] + "_Type"] = byte[Sensor_Type + 6];
        }

        return decoded_11;
    }
}
