// Please make sure you have all 3 sender nodes config as
//"Node1","Node2",and "Node3"
#include <SPI.h>
#include <RH_RF69.h>
#include <ArduinoJson.h>

/************ Radio Setup ***************/

// Change to 434.0 or other frequency, must match RX's freq!
#define RF69_FREQ 434.0

#define RFM69_INT     2  // Interrupt (G0)
#define RFM69_CS      10 // Chip Set  (CS)
#define RFM69_RST     9  // Reset     (RST)
#define LED           3  // LED
// Singleton instance of the radio driver
RH_RF69 rf69(RFM69_CS, RFM69_INT);

int16_t packetnum = 0;  // packet counter, we increment per xmission
struct Beacon {
  char  ssid;
  int   rssi;
};
struct Beacon b1, b2, b3;
int dataIn1 = 0, dataIn2 = 0, dataIn3 = 0;

void setup() 
{
  Serial.begin(115200);
  pinMode(LED, OUTPUT);     
  pinMode(RFM69_RST, OUTPUT);
  digitalWrite(RFM69_RST, LOW);

  // manual reset
  digitalWrite(RFM69_RST, HIGH);
  delay(10);
  digitalWrite(RFM69_RST, LOW);
  delay(10);
  
  if (!rf69.init()) {
    Serial.println("RFM69 radio init failed");
    while (1);
  }
  Serial.println("RFM69 radio init OK!");
  
  if (!rf69.setFrequency(RF69_FREQ)) {
    Serial.println("setFrequency failed");
  }

  rf69.setTxPower(20, true);  // range from 14-20 for power, 2nd arg must be true for 69HCW

  // The encryption key has to be the same as the one in the server
  uint8_t key[] = { 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
                    0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08};
  rf69.setEncryptionKey(key);
  
  pinMode(LED, OUTPUT);

  Serial.print("RFM69 radio @");  Serial.print((int)RF69_FREQ);  Serial.println(" MHz");
}

void loop() {
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& root = jsonBuffer.createObject();
  JsonArray& data = root.createNestedArray("Data");
 if (rf69.available()) {
    // Should be a message for us now   
    uint8_t buf[RH_RF69_MAX_MESSAGE_LEN];
    uint8_t len = sizeof(buf);
    if (rf69.recv(buf, &len)) {
      if (!len) return;
      buf[len] = 0;
      
     if (strstr((char *)buf,"Node1")) {
        b1.ssid = (char*)buf;
        b1.rssi = rf69.lastRssi();
        dataIn1 = 1; 
     }
     if (strstr((char *)buf,"Node2")) {
        b2.ssid = (char*)buf;
        b2.rssi = rf69.lastRssi();
        dataIn2 = 1;
     }
     if (strstr((char *)buf,"Node3")) {
        b3.ssid = (char*)buf;
        b3.rssi = rf69.lastRssi();
        dataIn3 = 1;
     }
    
    } else {
      Serial.println("Receive failed");
    }
  }
   if ((dataIn1 > 0) && (dataIn2 > 0) && (dataIn3 > 0)) {
      dataIn1 = 0; dataIn2 = 0; dataIn3 = 0;
      JsonObject& node1 = data.createNestedObject();
          node1["ssid"] = "Node1";
          node1["rssi"] = b1.rssi;
      JsonObject& node2 = data.createNestedObject();
          node2["ssid"] = "Node2";
          node2["rssi"] = b2.rssi;
      JsonObject& node3 = data.createNestedObject();
          node3["ssid"] = "Node3";
          node3["rssi"] = b3.rssi;
   root.printTo(Serial);
   //delay(500);
   Serial.println("\n"); 
   } 
}

