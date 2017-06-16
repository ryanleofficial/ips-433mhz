---VARIABLE CONFIGURATION----
SSID="NETWORK_ID_GOES_HERE"
PASSWORD="NETWORK_PASSWORD_GOES_HERE"
ESP_ADDR = "ESP8266_IP"
HOST_ADDR = "HOST_IP"
GATEWAY="NETWORK_GATEWAY"
NETMASK= "NETMASK"
--NETWORK CONFIGURATION---
print("Setting up WIFI...")
wifi.setmode(wifi.STATION)
wifi.sta.config(SSID,PASSWORD)
tmr.delay(5000)
wifi.sta.connect()
--SET STATIC IP----
wifi.sta.setip({ip=IP_ADDR,netmask=NETMASK,gateway=GATEWAY})
print("ESP8266 mode is: " .. wifi.getmode())
print("The module MAC address is: " .. wifi.ap.getmac())
--CONNECT TO NETWORK--
tmr.alarm(0, 2000, 1, function()
    if wifi.sta.getip()== nil then
    print("IP unavaiable, Waiting..."..wifi.sta.status())
    else
    tmr.stop(0)
    end
end)
print("Connecting to "..wifi.sta.getip())

--LISTEN FOR DATA--
print("Please connect the wire! ")
        uart.on("data", "\r", function(data)
        if data == nil then
            print("Waiting for serial data ...") 
        else
        print(data)    
        length = string.len(data)
--SEND DATA TO SERVER--
    conn = nil
    conn = net.createConnection(net.TCP, 0) 
    conn:on("receive", function(conn, payload) 
       success = true
       print(payload) 
       end)
       conn:connect(80,HOST_ADDR) 
       conn:on("connection", function(conn, payload) 
       print('\nConnected') 
       conn:send("POST /post/"
        .." HTTP/1.1\r\n" 
        .."Host: ENTER_YOUR_HOST\r\n" 
        .."Connection: keep-alive\r\n"
        .."Accept: */*\r\n"
        .."User-Agent: Mozilla/4.0 "
        .."(compatible; esp8266 Lua; "
        .."Windows NT 5.1)\r\n"
        .."Content-Type: application/json\r\n"
        .."Content-Length: "
        ..length.."\r\n"
        .."\r\n"
        ..data.."\r\n")
       end)
  end
  end,0)
