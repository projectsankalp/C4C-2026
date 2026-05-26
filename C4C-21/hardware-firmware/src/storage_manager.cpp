#include <Arduino.h>
#include <SPIFFS.h>

namespace StorageManager {
    void init() {
        if (!SPIFFS.begin(true)) {
            Serial.println("SPIFFS Mount Failed");
        }
    }

    void saveOffline(float value) {
        // Write to SPIFFS for later sync
    }
}
