/*
Chanaging transmission interval time of the device
Example : if you want to change the transmission interval time of the device to 10 minutes
convert time to seconds : 10 x 60 = 600 Seconds
*/
{
    "txTime": 600
}

/*
Turn on relays of the device or turn off relays of the device
Single Phase : Relay1 & Relay2 will tutn on and of indually
Three Phase : Relay1 will turn on and off the three phase application
Example : 1 : if you want to turn on the relay1 of the device.
Example : 2 : if you want to turn off the relay2 of the device.
Example : 3 : if you want to turn on the relay1 & relay2 of the device.
Example : 4 : if you want to turn off the relay1 & relay2 of the device.
*/
// Example 1:
{
    "relay1": 1
}
// Example 2:
{
    "relay2": 0
}
// Example 3:
{
    "relay1": 1,
    "relay2": 1
}
// Example 3:
{
    "relay1": 0,
    "relay2": 0
}

// PAYLOAD 
/*  *   dataType : 
 * 		00 : INT16
 * 		01 : UINT16
 * 		02 : INT32[MSB]
 * 		03 : INT32[LSB]
 * 		04 : FLOAT32[MSB]
 * 		05 : FLOAT32[LSB]
 *      FPort is 10 for RS485
*/
{
  "Field": 1,
  "slaveId": 2,
  "functionCode": 3,
  "Enable": 1,
  "dataType": 2,
  "Registeraddress": 3036
}

//for write modbus regiester
// PAYLOAD 
/*
*      numberofreg : you want to write like 1 or 2, for int16 1 and 2 for int32
*	value : you want to write 
*	address: address of register 
*       FPort is 9 for to write modbus and for coil fport is 8
*/

{
  "slaveId": 4,
    "numberofreg": 1,
    "address": 0,
    "value": 255
}
//  FPort is 8 for coil
{
  "slaveId": 10,
    "numberofreg": 1,
    "address": 0,
    "value": 65280
}

// PAYLOAD 
/*  *   dataType : 
 * 		00 : INT16
 * 		01 : UINT16
 * 		02 : INT32[MSB]
 * 		03 : INT32[LSB]
 * 		04 : FLOAT32[MSB]
 * 		05 : FLOAT32[LSB]
 *      FPort is 10 for RS485
*/
{
  "Field": 1,
  "slaveId": 2,
  "functionCode": 3,
  "Enable": 1,
  "dataType": 2,
  "numberOfParameters": 2,
  "Registeraddress": 3036
}

// for write modbus regiester
// PAYLOAD 
/*
*      numberofreg : you want to write like 1 or 2, for int16 1 and 2 for int32
*	value : you want to write 
*	address: address of register 
*       FPort is 9 for to write modbus and for coil fport is 8
*/

{
  "slaveId": 4,
    "numberofreg": 1,
    "address": 0,
    "value": 255
}
// reading rs485 data
{
  "slaveId": 5,
  "functionCode": 3,
  "dataType": 2,
  "numberOfParameters": 1,
  "Registeraddress": 3036
}
//  FPort is 8 for coil
{
  "slaveId": 10,
    "numberofreg": 1,
    "address": 0,
    "value": 65280
}
/////////////////////////////////////
// Alarms

{        // Regular
    "index": 1,
    "startTime": 3600,
    "stopTime": 7200,
    "dayData": 127,
    "relayStatus": 1,
    "triggerType": 1,
    "enable": 1
}

{      // Cylic
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

// Trigger

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

//********* baudrate*******//
// pairity->  0: none
//            1: odd
//            2: even
// port 12
//*************************//
{
    "baud": 9600,
    "pairity": 1
}

// reading alarm
{
    "index": 1
}
////////////////////////////////////////////





