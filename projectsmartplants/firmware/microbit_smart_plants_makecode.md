# Project Smart Plants - micro:bit MakeCode

Gebruik deze route alleen wanneer de sensoruitgang veilig is voor micro:bit.

## Veiligheid eerst

- Sluit nooit een 5V analoge sensoruitgang rechtstreeks aan op een micro:bit-pin.
- Gebruik alleen een sensor of schakeling waarvan de analoge uitgang binnen het veilige micro:bit-bereik blijft.
- Gebruik een gemeenschappelijke GND.
- Gebruik `P0` als analoge ingang.
- Arduino blijft de standaardroute voor de eerste klasversie.

## Seriele afspraak

De micro:bit stuurt:

```text
tijd_ms,raw
```

Gebruik in het platform het profiel:

```text
micro:bit - 115200 baud
```

## Blokken in MakeCode

1. Open MakeCode voor micro:bit.
2. Maak een nieuw project.
3. Ga naar `Geavanceerd` > `Serieel`.
4. Zet de baud rate op `115200`.
5. Maak een `voor altijd`-lus.
6. Lees analoog van pin `P0`.
7. Stuur een seriele regel met:

```text
looptijd (ms), analoge waarde P0
```

## JavaScript in MakeCode

Plak dit in de JavaScript-weergave van MakeCode:

```javascript
serial.redirectToUSB()
serial.setBaudRate(BaudRate.BaudRate115200)

basic.forever(function () {
    const tijdMs = input.runningTime()
    const raw = pins.analogReadPin(AnalogPin.P0)
    serial.writeLine("" + tijdMs + "," + raw)
    basic.pause(1000)
})
```

## Belangrijk

Zet geen vaste droog/nat-drempel in deze code. De browser doet de kalibratie met de metingen van de klas.
