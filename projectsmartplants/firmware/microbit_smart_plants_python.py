from microbit import *

# Project Smart Plants - micro:bit Python
#
# Deze code leest de bodemvochtsensor uit
# en stuurt de meetwaarde naar het Smart Plants-platform.
#
# Veiligheid:
# - Sluit nooit een 5V analoge sensoruitgang rechtstreeks
#   aan op een micro:bit-pin.
# - Gebruik alleen een sensor die veilig werkt met 3V.
# - Verbind de GND van de sensor met de GND van de micro:bit.
# - P0 is de analoge ingang.
#
# De micro:bit stuurt elke seconde:
# tijd_ms,raw
#
# Het platform gebruikt deze waarden om te onderzoeken
# welke getallen horen bij droge en natte aarde.
# Daarna bepalen we de grenzen tussen:
# droog - halfdroog - nat.

uart.init(baudrate=115200)

while True:
    tijd_ms = running_time()
    raw = pin0.read_analog()

    uart.write(str(tijd_ms) + "," + str(raw) + "\n")

    sleep(1000)
