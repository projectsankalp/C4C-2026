#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// D2 is SDA (GPIO 4), D1 is SCL (GPIO 5) on ESP8266 NodeMCU
#define I2C_SDA 4
#define I2C_SCL 5

// --- IMPORTANT: Set your LCD Address ---
// If your screen is blank, change 0x27 to 0x3F below:
LiquidCrystal_I2C lcd(0x27, 16, 2); 

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("LCD Test Started");

  // Initialize Hardware I2C on pins D2 (SDA) and D1 (SCL)
  Wire.begin(I2C_SDA, I2C_SCL);
  
  // Initialize LCD
  lcd.init();
  
  // Turn on Backlight!
  lcd.backlight();
  
  // Clear any garbage pixels
  lcd.clear();
  
  // Write message on Line 1
  lcd.setCursor(0, 0); // (column 0, row 0)
  lcd.print("  SWACHH VAYU  ");
  
  // Write message on Line 2
  lcd.setCursor(0, 1); // (column 0, row 1)
  lcd.print("NODE 01: ONLINE ");

  Serial.println("Printed successfully to LCD!");
}

void loop() {
  // Just blink the built-in LED to show the code is running
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
}