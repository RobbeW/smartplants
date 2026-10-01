# Project Smart Plants - MakeCode Python
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



serial.redirect_to_usb()
serial.set_baud_rate(BaudRate.BAUD_RATE115200)

def on_forever():
    tijd_ms = input.running_time()
    raw = pins.analog_read_pin(AnalogPin.P0)

    serial.write_line(str(tijd_ms) + "," + str(raw))

    basic.pause(1000)

basic.forever(on_forever)
