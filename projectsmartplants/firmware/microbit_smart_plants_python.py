from microbit import *

# Project Smart Plants - micro:bit Python
#
# Veiligheid:
# - Sluit nooit een 5V analoge sensoruitgang rechtstreeks aan op een micro:bit-pin.
# - Gebruik alleen een sensoruitgang die veilig binnen het micro:bit-bereik blijft.
# - Gebruik gedeelde GND.
# - P0 is de analoge ingang.
#
# Seriele afspraak voor het platform:
# 115200 baud
# tijd_ms,raw
#
# De browser doet de kalibratie. Zet hier dus geen vaste droog/nat-drempels.

uart.init(baudrate=115200)

while True:
    tijd_ms = running_time()
    raw = pin0.read_analog()
    uart.write(str(tijd_ms) + "," + str(raw) + "\n")
    sleep(1000)
