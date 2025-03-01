/**
 * LoRaWAN Decoder V3.0 for LoRaWAN Controllers and Nodes
 * Macnman Technologies Pvt.Ltd
 * Writen By : MACNMAN
 * 
 **/
**LoRaWAN Downlink Payload Formatting for ChirpStack**

---

## 1. Changing Transmission Interval Time (FPort: 06)
To modify the transmission interval time of a LoRaWAN device, convert the desired time to seconds and send the payload.

**Example:** To set the interval to **10 minutes** (600 seconds):
```json
{
    "txTime": 600
}
```

---

## 2. Controlling Device Relays (FPort: 05)
This payload is used to turn on or off relays in both **single-phase** and **three-phase** applications:
- **Single-phase:** Relay1 and Relay2 control independent loads.
- **Three-phase:** Relay1 controls the entire three-phase application.

**Examples:**
- **Turn on Relay1:**
  ```json
  {
      "relay1": 1
  }
  ```
- **Turn off Relay2:**
  ```json
  {
      "relay2": 0
  }
  ```
- **Turn on both Relay1 and Relay2:**
  ```json
  {
      "relay1": 1,
      "relay2": 1
  }
  ```
- **Turn off both Relay1 and Relay2:**
  ```json
  {
      "relay1": 0,
      "relay2": 0
  }
  ```

---

## 3. Reading RS485 Data (FPort: 10)
This payload is used for reading RS485 data from a Modbus device.

### **Data Type Mapping:**
- `00`: INT16
- `01`: UINT16
- `02`: INT32 [MSB]
- `03`: INT32 [LSB]
- `04`: FLOAT32 [MSB]
- `05`: FLOAT32 [LSB]

**Example:**
```json
{
  "Field": 1,
  "slaveId": 2,
  "functionCode": 3,
  "Enable": 1,
  "dataType": 2,
  "numberOfParameters": 2,
  "Registeraddress": 3036
}
```

---

## 4. Writing Modbus Registers (FPort: 9 for Registers, FPort: 8 for Coils)
To write to a Modbus register, specify the slave ID, register address, and value.

**Examples:**
- **Writing to a register:**
  ```json
  {
      "slaveId": 4,
      "numberofreg": 1,
      "address": 0,
      "value": 255
  }
  ```
- **Writing to a coil (FPort: 8):**
  ```json
  {
      "slaveId": 10,
      "numberofreg": 1,
      "address": 0,
      "value": 65280
  }
  ```

---

## 5. Alarm Configurations (FPort: 11)
### 5.1 Regular Alarm
```json
{
    "index": 1,
    "startTime": 3600,
    "stopTime": 7200,
    "dayData": 127,
    "relayStatus": 1,
    "triggerType": 1,
    "enable": 1
}
```

### 5.2 Cyclic Alarm
```json
{
    "index": 2,
    "startTime": 3600,
    "stopTime": 7200,
    "dayData": 127,
    "relayStatus": 1,
    "triggerType": 2,
    "enable": 1,
    "onTime": 60,
    "offTime": 120
}
```

### 5.3 Sensor-Based Trigger Alarm
```json
{
    "index": 3,
    "startTime": 3600,
    "stopTime": 7200,
    "dayData": 127,
    "relayStatus": 1,
    "triggerType": 3,
    "enable": 1,
    "sensorValue": 85,
    "level": 2,
    "rs485Field": 1
}
```

### 5.4 Reading an Alarm Configuration
```json
{
    "index": 1
}
```

---

## 6. Configuring RS485 RTU Baud Rate (FPort: 12)
Baud rate and parity settings for RS485 RTU serial communication.
- **Parity Options:**
  - `0`: None
  - `1`: Odd
  - `2`: Even

**Example:**
```json
{
    "baud": 9600,
    "pairity": 1
}
```

---

### **Conclusion**
This document provides structured payload formats for sending downlinks to LoRaWAN end devices via ChirpStack. It includes instructions for modifying transmission intervals, controlling relays, reading/writing Modbus registers, configuring alarms, and setting baud rates.

