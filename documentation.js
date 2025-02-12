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

/*
*/





