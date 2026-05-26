#include <Arduino.h>

namespace GSMDriver {
    void init() {
        // Init SIM800L
    }

    bool isConnected() {
        return true;
    }

    bool sendTelemetry(float value) {
        // Post to FastAPI endpoint
        return true;
    }
}
