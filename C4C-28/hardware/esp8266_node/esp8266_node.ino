#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

// ======================
// WiFi Settings
// ======================
const char* ssid = "Not_Secured";
const char* password = "14052579";

// Raspberry Pi IP & Port Configuration
const char* host = "10.45.187.87";
const int port = 5000;

// ======================
// Pins
// ======================
#define BUZZER 2
#define GREEN_LED 14
#define YELLOW_LED 12
#define RED_LED 13
#define MQ135 A0

// Assigning ESP8266 Node ID to NODE_02 (Pimpalgaon Village)
#define NODE_ID "NODE_02"

void setup() {
  Serial.begin(115200); // Standard ESP8266 debug baud rate

  pinMode(BUZZER, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  // LCD Initialization
  lcd.init();
  lcd.backlight();
  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");

  // Connect to Local WiFi Hotspot
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");

  Serial.println("\nWiFi Connected");
  Serial.println(WiFi.localIP());

  delay(2000);
  lcd.clear();

  // Hardware Diagnostic Startup Sequence (Buzzer & LEDs test)
  digitalWrite(BUZZER, HIGH);
  delay(200);
  digitalWrite(BUZZER, LOW);

  digitalWrite(GREEN_LED, HIGH);
  delay(300);
  digitalWrite(GREEN_LED, LOW);

  digitalWrite(YELLOW_LED, HIGH);
  delay(300);
  digitalWrite(YELLOW_LED, LOW);

  digitalWrite(RED_LED, HIGH);
  delay(300);
  digitalWrite(RED_LED, LOW);
}

void loop() {
  int airValue = analogRead(MQ135);
  String statusText;

  // Map raw analog input (0-1023) to estimated rural AQI range (0-500)
  int estimated_aqi = map(airValue, 0, 1023, 0, 500);

  // ======================
  // LCD Display
  // ======================
  lcd.setCursor(0, 0);
  lcd.print("Air Value:      ");
  lcd.setCursor(11, 0);
  lcd.print(estimated_aqi);

  // ======================
  // Standardized Air Quality Threshold Logic
  // ======================
  if (estimated_aqi < 100) {
    statusText = "GOOD";
    lcd.setCursor(0, 1);
    lcd.print("Status: GOOD    ");

    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);
    digitalWrite(BUZZER, LOW);
  }
  else if (estimated_aqi < 200) {
    statusText = "MEDIUM";
    lcd.setCursor(0, 1);
    lcd.print("Status: MEDIUM  ");

    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    digitalWrite(BUZZER, LOW);
  }
  else {
    statusText = "DANGER";
    lcd.setCursor(0, 1);
    lcd.print("Status: DANGER! ");

    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, HIGH);
    digitalWrite(BUZZER, HIGH);
  }

  // ==========================================
  // Send Data to Raspberry Pi (HTTP POST JSON)
  // ==========================================
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    // Target the specific Flask REST API endpoint on the Raspberry Pi
    String serverUrl = "http://" + String(host) + ":" + String(port) + "/api/aqi/readings";
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Standardized JSON payload mapped to the SQL database schema
    String jsonPayload = "{\"node_code\":\"" + String(NODE_ID) + "\""
                         ",\"mq135_value\":" + String(estimated_aqi) +
                         ",\"temperature\":28.0"
                         ",\"humidity\":55.0"
                         ",\"battery_level\":95}";

    int httpResponseCode = http.POST(jsonPayload);

    Serial.print("HTTP POST to ");
    Serial.print(serverUrl);
    Serial.print(" -> ");
    Serial.println(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("✓ Success! Response Code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.print("✗ Failed! Error: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end(); // Free connection
  } else {
    Serial.println("⚠ WiFi Disconnected! Reconnecting...");
    WiFi.begin(ssid, password);
  }

  delay(5000); // Transmit environmental diagnostics every 5 seconds
}
