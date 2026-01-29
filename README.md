# LoRaWAN Downlink Payload Format (V3.0)

**Company:** Macnman Technologies Pvt. Ltd  
**Written By:** MACNMAN  
**Supported Platform:** ChirpStack v4  
**Protocol:** LoRaWAN  

This document describes the **downlink payload formats** used to control and configure Macnman LoRaWAN devices via **ChirpStack** using both **LNS JSON** and **MQTT JSON**.

---

## 📌 MQTT Downlink Basics (ChirpStack v4)

### Topic Format
```
application/{applicationId}/device/{devEui}/command/down
```

### Generic MQTT Payload Structure
```json
{
  "devEui": "0080e11505ca2663",
  "confirmed": true,
  "object": {
    "...": "payload fields",
    "fPort": X
  }
}
```

---

## 1️⃣ Change Transmission Interval  
**FPort:** `06`

### Description
- Sets uplink transmission interval in **seconds**
- Device applies new interval immediately

### ChirpStack Object JSON
```json
{
  "txTime": 600,
  "fPort": 6
}
```

### MQTT JSON Example
```json
{
  "devEui": "0080e11505ca2663",
  "confirmed": true,
  "object": {
    "txTime": 600,
    "fPort": 6
  }
}
```

---

## 2️⃣ Relay Control  
**FPort:** `05`

### Description
- `relay1`, `relay2`
- `1` = ON, `0` = OFF
- In **three-phase**, `relay1` controls all phases

### ChirpStack Object JSON Examples

**Relay1 ON**
```json
{
  "relay1": 1,
  "fPort": 5
}
```

**Relay2 OFF**
```json
{
  "relay2": 0,
  "fPort": 5
}
```

**Both Relays ON**
```json
{
  "relay1": 1,
  "relay2": 1,
  "fPort": 5
}
```

### MQTT JSON Example
```json
{
  "devEui": "0080e11505ca2663",
  "confirmed": true,
  "object": {
    "relay1": 0,
    "relay2": 0,
    "fPort": 5
  }
}
```

---

## 3️⃣ Read RS485 (Modbus) Data  
**FPort:** `10`

### Data Type Mapping
| Value | Data Type |
|-----|-----------|
| 00 | INT16 |
| 01 | UINT16 |
| 02 | INT32 (MSB) |
| 03 | INT32 (LSB) |
| 04 | FLOAT32 (MSB) |
| 05 | FLOAT32 (LSB) |

```json
{
  "Field": 1,
  "slaveId": 2,
  "functionCode": 3,
  "Enable": 1,
  "dataType": 2,
  "numberOfParameters": 2,
  "Registeraddress": 3036,
  "fPort": 10
}
```

---

## © Macnman Technologies Pvt. Ltd
