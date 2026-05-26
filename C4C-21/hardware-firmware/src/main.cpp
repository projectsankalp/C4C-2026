#include <Arduino.h>
#include "sensor_handler.h"
#include "gsm_driver.h"
#include "storage_manager.h"

void setup() {
    Serial.begin(115200);
    StorageManager::init();
    GSMDriver::init();
    SensorHandler::init();
    
    Serial.println("JalRakshak Firmware Started");
}

void loop() {
    float level = SensorHandler::readLevel();
    
    if (GSMDriver::isConnected()) {
        if (!GSMDriver::sendTelemetry(level)) {
            StorageManager::saveOffline(level);
        }
    } else {
        StorageManager::saveOffline(level);
    }
    
    // Deep sleep for 1 hour to conserve power
    esp_sleep_enable_timer_wakeup(3600ULL * 1000000ULL);
    esp_deep_sleep_start();
}
