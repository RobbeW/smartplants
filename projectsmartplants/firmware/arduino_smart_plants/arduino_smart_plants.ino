/*
  Project Smart Plants
  Arduino-firmware voor bodemvochtigheid.

  Stuurt CSV naar het platform op 9600 baud:
  tijd_ms,raw,average,category_code

  Led-uitbreiding:
  - D10: rode statusled, knippert wanneer een meetregel verstuurd wordt.
  - D11: rood kanaal RGB-led.
  - D12: blauw kanaal RGB-led.
  - D13: groen kanaal RGB-led.

  Gebruik voor elke led of RGB-kleur een eigen weerstand van 220 ohm of 330 ohm.
  De RGB-led werkt pas als USE_RGB_SOIL_LED op true staat en de drempels ingevuld zijn.
  Het platform blijft de eerste plaats voor kalibratie.
*/

const int SENSOR_PIN = A0;
const byte STATUS_LED_PIN = 10;
const byte RGB_RED_PIN = 11;
const byte RGB_BLUE_PIN = 12;
const byte RGB_GREEN_PIN = 13;

const unsigned long SERIAL_INTERVAL_MS = 1000;
const unsigned int STATUS_BLINK_MS = 80;
const byte SAMPLE_COUNT = 10;
const byte CATEGORY_UNKNOWN = 0;
const byte CATEGORY_DRY = 1;
const byte CATEGORY_MOIST = 2;
const byte CATEGORY_WET = 3;

// Zet dit pas op true nadat je in het platform droog/vochtig/nat gekalibreerd hebt.
const bool USE_RGB_SOIL_LED = false;

// De meeste capacitieve bodemvochtsensoren geven een lagere waarde bij nattere bodem.
// Kijk in het platform naar "Richting" en pas dit aan als jouw sensor andersom werkt.
const bool LOWER_VALUE_IS_WETTER = true;

// Vul hier de twee drempels uit het platform in wanneer USE_RGB_SOIL_LED true wordt.
const int DRY_MOIST_THRESHOLD = 650;
const int MOIST_WET_THRESHOLD = 450;

// Zet op true bij een common-anode RGB-led. Laat false bij common-cathode.
const bool RGB_COMMON_ANODE = false;

unsigned long previousSerialMs = 0;
unsigned long statusLedOffMs = 0;

int readAverage();
byte classifySoil(int sensorValue);
void pulseStatusLed(unsigned long now);
void updateStatusLed(unsigned long now);
void setRgbForCategory(byte category);
void writeRgb(bool redOn, bool greenOn, bool blueOn);
void writeRgbChannel(byte pin, bool on);

void setup() {
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(RGB_RED_PIN, OUTPUT);
  pinMode(RGB_GREEN_PIN, OUTPUT);
  pinMode(RGB_BLUE_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);
  writeRgb(false, false, false);

  Serial.begin(9600);
  delay(100);

  Serial.println(F("# Smart Plants 2026"));
  Serial.println(F("# CSV: tijd_ms,raw,average,category_code"));
  Serial.println(F("# D10 knippert wanneer data verstuurd wordt."));
  Serial.println(F("# Kalibratie gebeurt in het platform."));
}

void loop() {
  const unsigned long now = millis();
  updateStatusLed(now);

  if (now - previousSerialMs < SERIAL_INTERVAL_MS) {
    return;
  }
  previousSerialMs = now;

  const int averageValue = readAverage();
  const byte category = classifySoil(averageValue);
  setRgbForCategory(category);
  pulseStatusLed(millis());

  Serial.print(now);
  Serial.print(F(","));
  Serial.print(averageValue);
  Serial.print(F(","));
  Serial.print(averageValue);
  Serial.print(F(","));
  Serial.println(category);
}

int readAverage() {
  long total = 0;

  for (byte i = 0; i < SAMPLE_COUNT; i++) {
    total += analogRead(SENSOR_PIN);
    delay(5);
  }

  return total / SAMPLE_COUNT;
}

byte classifySoil(int sensorValue) {
  if (!USE_RGB_SOIL_LED) {
    return CATEGORY_UNKNOWN;
  }

  if (LOWER_VALUE_IS_WETTER) {
    if (sensorValue > DRY_MOIST_THRESHOLD) {
      return CATEGORY_DRY;
    }
    if (sensorValue <= MOIST_WET_THRESHOLD) {
      return CATEGORY_WET;
    }
    return CATEGORY_MOIST;
  }

  if (sensorValue < DRY_MOIST_THRESHOLD) {
    return CATEGORY_DRY;
  }
  if (sensorValue >= MOIST_WET_THRESHOLD) {
    return CATEGORY_WET;
  }
  return CATEGORY_MOIST;
}

void pulseStatusLed(unsigned long now) {
  digitalWrite(STATUS_LED_PIN, HIGH);
  statusLedOffMs = now + STATUS_BLINK_MS;
}

void updateStatusLed(unsigned long now) {
  if (statusLedOffMs != 0 && (long)(now - statusLedOffMs) >= 0) {
    digitalWrite(STATUS_LED_PIN, LOW);
    statusLedOffMs = 0;
  }
}

void setRgbForCategory(byte category) {
  if (!USE_RGB_SOIL_LED) {
    writeRgb(false, false, false);
    return;
  }

  if (category == CATEGORY_DRY) {
    writeRgb(true, false, false);
  } else if (category == CATEGORY_MOIST) {
    writeRgb(false, true, false);
  } else if (category == CATEGORY_WET) {
    writeRgb(false, false, true);
  } else {
    writeRgb(false, false, false);
  }
}

void writeRgb(bool redOn, bool greenOn, bool blueOn) {
  writeRgbChannel(RGB_RED_PIN, redOn);
  writeRgbChannel(RGB_GREEN_PIN, greenOn);
  writeRgbChannel(RGB_BLUE_PIN, blueOn);
}

void writeRgbChannel(byte pin, bool on) {
  digitalWrite(pin, RGB_COMMON_ANODE ? !on : on);
}
