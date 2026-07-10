# Project Smart Plants

Auteur: Robbe Wulgaert - AI in de Klas - robbewulgaert.be

## Korte uitleg

Project Smart Plants is een STEM- en ICT-opdracht waarin leerlingen bodemvochtigheid onderzoeken met een analoge bodemvochtsensor en een Arduino. De website begeleidt hen door voorspellen, bouwen, kalibreren, meten, analyseren en besluiten. Arduino is de standaardroute; micro:bit kan gebruikt worden als de sensoruitgang veilig is voor de micro:bit.

De opdracht begint niet met automatische bewatering. Leerlingen bepalen eerst wat de ruwe sensorwaarde betekent voor hun eigen bodem, sensorpositie en meetopstelling.

## Wat leerlingen doen

Leerlingen:

- formuleren een onderzoeksvraag en hypothese met `als ..., dan ..., omdat ...`;
- controleren bord, GND, analoge ingang, sensorpositie en firmware;
- verbinden via WebSerial, gebruiken demomodus of importeren een opgeslagen CSV-log;
- kiezen het juiste seriele profiel: Arduino op 9600 baud of micro:bit op 115200 baud;
- kalibreren droge, licht vochtige en natte bodem;
- verzamelen meetreeksen met ruwe sensorwaarden;
- vergelijken gemiddelden, minimum en maximum;
- kiezen een drempelwaarde op basis van eigen data;
- controleren of de kalibratiekwaliteit goed genoeg is;
- schrijven een besluit, betrouwbaarheid en verbetering;
- exporteren CSV-data en een PDF-rapport.

## Benodigdheden

- Arduino-compatibel board;
- optioneel: micro:bit met veilige analoge sensoruitgang;
- AZ-Delivery V1.2 Soil Moisture Sensor Hygrometer of vergelijkbare analoge capacitieve bodemvochtsensor;
- optioneel: rode statusled op pin 10 met serieweerstand;
- optioneel: RGB-led op pin 11, 12 en 13 met een weerstand per kleur;
- USB-kabel die data doorgeeft;
- potgrond of bodemmonsters;
- watermaatje of spuitfles;
- Chrome of Edge voor WebSerial.

CSV-import blijft bruikbaar wanneer live meten niet lukt of wanneer data eerst op een ander toestel verzameld wordt.

## Seriele data

Arduino is de eerste route en stuurt data op 9600 baud. De micro:bit-route stuurt data op 115200 baud.

Het platform accepteert twee vormen:

```text
tijd_ms,raw
tijd_ms,raw,average,category_code
```

Statusregels beginnen met `#` en worden als diagnose getoond:

```text
# Smart Plants 2026
# CSV: tijd_ms,raw,average,category_code
```

Het platform blijft de bron van waarheid voor kalibratie en categorieen. De firmware moet dus geen vaste droog/nat-drempels bevatten.

## Arduino-leds

De Arduino-code gebruikt optioneel vier led-uitgangen:

```text
D10  rode statusled
D11  RGB rood
D12  RGB blauw
D13  RGB groen
```

Gebruik per ledkanaal een eigen weerstand van 220 ohm of 330 ohm.

De statusled op D10 knippert wanneer de Arduino een meetregel naar de laptop stuurt. Dat toont dus dat de firmware actief meet en data verstuurt. Een Arduino Uno of Nano kan niet altijd betrouwbaar weten of het platform echt luistert; daarvoor zou het platform actief een commando naar de Arduino moeten sturen.

De RGB-led staat standaard uit. Zet in de firmware `USE_RGB_SOIL_LED` pas op `true` nadat leerlingen in het platform hun eigen droog/vochtig/nat-drempels hebben bepaald. Zo blijft de kalibratie van de klas leidend en kopieren leerlingen geen willekeurige online drempelwaarde.

Deze versie gebruikt eenvoudige aan/uit-kleuren: rood voor droog, groen voor vochtig en blauw voor nat. Op een Arduino Uno kan de ingebouwde led op D13 mee oplichten wanneer het groene RGB-kanaal brandt. Dat is normaal.

## Kalibratiekwaliteit

Na de droge en natte referentiemeting toont het platform al een snelle kwaliteitscheck. De licht vochtige referentiemeting blijft nuttig als controle voor de middenzone.

```text
Goed
Twijfelachtig
Hermeet
Sneltest goed
Sneltest
```

De regel is bewust eenvoudig voor klasgebruik. Met alleen droog en nat gebruikt het platform het verschil tussen die twee punten als snelle check. Met droog, licht vochtig en nat controleert het platform ook of licht vochtig echt tussen droog en nat ligt.

```text
droog/nat verschil >= 150 ADC-punten  -> Sneltest goed
droog/nat verschil 90-149 ADC-punten  -> Sneltest
droog/nat verschil < 90 ADC-punten    -> Hermeet
kleinste verschil met 3 punten >= 50   -> Goed
kleinste verschil met 3 punten 25-49   -> Twijfelachtig
kleinste verschil met 3 punten < 25    -> Hermeet
```

Het platform vraagt ook om opnieuw te meten wanneer de licht vochtige referentie niet tussen droog en nat ligt. Dat wijst vaak op een andere sensorpositie, te korte wachttijd of bodemmonsters die te weinig verschillen.

Gebruik dit label als gesprek over betrouwbaarheid. Het is geen wetenschappelijke foutenanalyse, maar helpt leerlingen zien of hun drempelwaarde genoeg steun krijgt van hun eigen data.

## CSV import

Het platform kan opgeslagen meetdata importeren. Dat is handig bij gedeelde hardware, een opgeslagen seriele-monitorlog of micro:bit datalogging.

Ondersteunde vormen:

```text
tijd_ms,raw
trial,condition,water_ml,tijd_ms,raw,note
```

De map `data/` bevat:

```text
data/template_soil_moisture_measurements.csv
data/sample_soil_moisture_log.csv
```

Na import worden de meetpunten gewone meetreeksen in het platform. Ze verschijnen dus in de grafieken, de samenvatting, de CSV-export en het PDF-rapport.

De CSV-export start met commentaarregels die beginnen met `#`. Daarin staan de kalibratiewaarden, drempels en kalibratiecheck. Het platform slaat die regels over wanneer je hetzelfde bestand later opnieuw importeert.

## Firmware

Gebruik in de klas eerst de Arduino-code:

```text
firmware/arduino_smart_plants/arduino_smart_plants.ino
```

Gebruik micro:bit alleen wanneer de analoge sensoruitgang veilig is voor de micro:bit. Sluit geen 5V analoge uitgang rechtstreeks aan op een micro:bit-pin.

De micro:bit-route staat in twee vormen klaar:

```text
firmware/microbit_smart_plants_makecode.md
firmware/microbit_smart_plants_python.py
```

Beide micro:bit-versies sturen `tijd_ms,raw`. Het platform doet daarna dezelfde kalibratie, grafiek, CSV-export en PDF-rapportage als bij Arduino.

## Bestandsstructuur

```text
projectsmartplants/
|-- index.html
|-- platform.html
|-- evaluatie.html
|-- style.css
|-- script.js
|-- readme.md
|-- data/
|   |-- sample_soil_moisture_log.csv
|   |-- template_soil_moisture_measurements.csv
|-- firmware/
|   |-- arduino_smart_plants/
|   |   |-- arduino_smart_plants.ino
|   |-- microbit_smart_plants_makecode.md
|   |-- microbit_smart_plants_python.py
|-- media/
|   |-- Project Smart Plants.png
|   |-- smartplants_hero.jpg
|   |-- smartplants_microbit_reference.jpg
|   |-- schema_arduino_soil_sensor.svg
|   |-- schema_microbit_soil_sensor_safe_connection.svg
|-- vendor/
|   |-- chart.umd.min.js
|   |-- jspdf.umd.min.js
|   |-- jspdf.plugin.autotable.min.js
```

## Lokale vendor-bestanden en geen buildstap

Deze versie is bewust een statische website. Er is geen npm-, pnpm-, Vite-, Webpack- of andere buildstap nodig om de leerlingenpagina te gebruiken.

De platformpagina laadt de klas-kritische bibliotheken lokaal uit `vendor/`:

- Chart.js 4.4.9 voor de live- en vergelijkingsgrafiek;
- jsPDF 2.5.1 voor het PDF-rapport;
- jsPDF AutoTable 3.5.25 voor tabellen in het PDF-rapport.

Vervang deze bestanden alleen bewust en test daarna opnieuw of demomodus, CSV-export en PDF-export werken. De site mag tijdens de les niet afhankelijk zijn van een CDN of pakketmanager.

## Privacy en opslag

De website gebruikt geen server en geen leerlingenaccounts. Meetgegevens blijven in de browser en worden alleen een bestand wanneer een leerling zelf CSV of PDF exporteert.

## Publicatie

Publiceer de map `projectsmartplants/` via GitHub Pages of gebruik `localhost` tijdens het testen. WebSerial werkt niet betrouwbaar vanuit elke gewone `file://` context.

## Finale publicatiecheck

Controleer voor publicatie:

- open `index.html`, `platform.html` en `evaluatie.html`;
- controleer dat alle afbeeldingen laden;
- test de taalknop op de landingspagina;
- test op het platform minstens demomodus, CSV-import, kalibratiekwaliteit, CSV-export en PDF-export;
- open de firmwarelinks in de codehulp;
- open de template en voorbeelddata in `data/`;
- maak op `evaluatie.html` een korte scorekaart en download die;
- publiceer de hele map `projectsmartplants/`, inclusief `vendor/`, `media/`, `firmware/` en `data/`.

Tijdens de les is Chrome of Edge aanbevolen voor live WebSerial. Demomodus en CSV-import blijven bruikbaar wanneer WebSerial niet beschikbaar is.
