# NametagApp

**A small app for creating name tags with a Cat thermal printer.**
Type a name, pick a few words, press print: the label goes straight from your browser to the printer over Bluetooth. No server, no installation, no account.

*by feststelltaste · [Deutsch](#deutsch) · [For developers](#for-developers)*

---

## Quick start

1. Open the app in **Chrome or Edge** (a computer or an Android phone; Firefox and Safari do not support Web Bluetooth).
2. Switch the printer on and make sure no phone is connected to it.
3. Fill in the label and press **Print**. The first time, the browser asks you to pick the printer (`X6h-…`).

## What you can do

- **Label:** a title on top, an optional intro line, the name in large letters and hashtags at the bottom. Every line you type in the hashtag field stays its own line.
- **First name only:** the button next to the name field prints just the first name. It switches itself back on after every print.
- **Title lock:** the lock next to the title keeps it when you press **Clear**. Without the lock, **Clear** empties the title too.
- **Intro line:** write your own or roll positive adjectives with the dice (one, two or three), for example "Awesome, brilliant & brave". In German there are male and female forms.
- **Attendee list:** load a CSV export from Meetup (or a text file with one name per line).
  - Pick the column that holds the name, by title or by number, and say whether the first row contains column titles.
  - While you type a name, the field suggests names from the list. Printed names are checked off automatically, or check them off with the box next to the name.
  - **Download CSV** saves the list with the check marks; upload that file later and the check marks come back. **Remove list** takes the loaded list out again.
- **Print settings:** label length (automatic, up to 100 mm, or fixed), zoom 1 / 0.75 / 0.5 for smaller text and shorter labels, side margins 0 / 0.5 / 1 cm, reversed print direction, re-roll the intro line after each print.
- **Live view:** *Live view in new window* opens a second window (for example on another monitor) that shows the current label big.
- **Mirror mode:** the QR icon in the top right connects a second device (phone, tablet) directly. Scan the code, paste the answer code back, and every label then appears live on the second device. A code is valid for 5 minutes and works once.
- **Look:** dark mode, a main color of your choice (any CSS color code), English and German (the button in the top right switches; English is the default).

## Printer

Developed for the **X6h** (50 mm labels, 48 mm print width). Other printers that speak the same Cat Printer protocol may work. The label is printed sideways so the text runs along the paper.

## Privacy

Everything stays in your browser. Attendee lists, settings and the last label live in the browser's local storage and are never uploaded. **Do not commit real attendee lists to a repository.**
Mirror mode connects the two devices directly; names do not pass through any server. Only to find each other's address, the devices ask a public STUN server (`stun.l.google.com`).

---

## Deutsch

**NametagApp** druckt Namensschilder direkt aus dem Browser auf einen Cat-Thermodrucker, über Bluetooth. Ohne Server, ohne Installation, ohne Konto.

### Schnellstart

1. Die App in **Chrome oder Edge** öffnen (Computer oder Android-Handy; Firefox und Safari unterstützen Web Bluetooth nicht).
2. Drucker einschalten. Er darf nicht mit dem Handy verbunden sein.
3. Etikett ausfüllen und **Print** (Drucken) klicken. Beim ersten Mal fragt der Browser nach dem Drucker (`X6h-…`).

Die App startet auf Englisch. Mit dem Button **DE** oben rechts schaltest du auf Deutsch um; die Wahl wird gemerkt.

### Funktionen

- **Etikett:** Titel oben, optionale Zwischenzeile, Name in großen Buchstaben, unten Hashtags. Jede Zeile im Hashtag-Feld bleibt eine eigene Zeile.
- **Nur Vorname:** Der Button neben dem Namensfeld druckt nur den Vornamen. Er springt nach jedem Druck von selbst wieder an.
- **Titel-Schloss:** Das Schloss neben dem Titel schützt ihn vor **Leeren**. Ohne Schloss leert **Leeren** den Titel mit.
- **Zwischenzeile:** Selbst schreiben oder mit den Würfeln positive Adjektive würfeln (eins, zwei oder drei), zum Beispiel „Großartige(r), geniale(r) & mutige(r)". Mit 👨 und 👩 wählst du die männliche oder weibliche Form.
- **Teilnehmerliste:** CSV-Export von Meetup laden (oder eine Textdatei mit einem Namen pro Zeile).
  - Wähle die Spalte mit dem Namen (nach Titel oder Nummer) und gib an, ob die erste Zeile Spaltentitel enthält.
  - Beim Tippen schlägt das Namensfeld Namen aus der Liste vor. Gedruckte Namen werden automatisch abgehakt, oder du hakst sie mit dem Kästchen neben dem Namen ab.
  - **CSV herunterladen** speichert die Liste mit den Haken; lädst du die Datei später wieder hoch, kommen die Haken zurück. **Liste entfernen** nimmt die geladene Liste wieder heraus.
- **Druckeinstellungen:** Etikettenlänge (automatisch bis 100 mm oder fest), Zoom 1 / 0,75 / 0,5 für kleinere Schrift und kürzere Etiketten, Seitenränder 0 / 0,5 / 1 cm, Druckrichtung umkehren, Zwischenzeile nach jedem Druck neu würfeln.
- **Live-Ansicht:** „Live-Ansicht in neuem Fenster" öffnet ein zweites Fenster (zum Beispiel auf dem anderen Monitor), das das aktuelle Etikett groß zeigt.
- **Spiegelmodus:** Das QR-Symbol oben rechts verbindet ein zweites Gerät (Handy, Tablet) direkt. Code scannen, Antwort-Code zurück einfügen, danach erscheint jedes Etikett live auf dem zweiten Gerät. Ein Code gilt 5 Minuten und nur einmal.
- **Aussehen:** Dark Mode, frei wählbare Hauptfarbe (jeder CSS-Farbcode), Englisch und Deutsch.

### Drucker

Entwickelt für den **X6h** (50-mm-Etiketten, 48 mm Druckbreite). Andere Drucker mit demselben Cat-Printer-Protokoll funktionieren möglicherweise. Das Etikett wird quer gedruckt, damit der Text entlang des Papiers läuft.

### Datenschutz

Alles bleibt in deinem Browser. Teilnehmerlisten, Einstellungen und das letzte Etikett liegen im lokalen Speicher des Browsers und werden nie hochgeladen. **Echte Teilnehmerlisten gehören nicht in ein Repository.**
Der Spiegelmodus verbindet die beiden Geräte direkt, die Namen laufen über keinen Server. Nur um die Adresse des anderen Geräts zu finden, fragen die Geräte einen öffentlichen STUN-Server (`stun.l.google.com`).

---

## For developers

The app is a handful of static files with **no build step and no runtime dependencies**.

| File | Purpose |
|---|---|
| `index.html` | the editor: UI, label rendering, printing (inline script) |
| `view.html` | live view and the second device in mirror mode |
| `mirror.js` | WebRTC pairing and messaging for mirror mode |
| `vendor/qrcode.js` | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 2.0.4 (MIT), used for the pairing QR code |
| `LICENSE` | MIT license of this project |

### Run locally

Open `index.html` in Chrome or Edge, or serve the folder (a secure context is needed for Web Bluetooth; `localhost`, `https://` and `file://` pages qualify):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

It also works unchanged on GitHub Pages (HTTPS). `index.html` and `view.html` must be served from the same origin for the live view.

### How it works

- **Rendering:** the label is laid out in printer dots (384 dots = 48 mm, 8 dots/mm) on a canvas, landscape. `paint(scale)` draws the same layout at any scale: 3x for the smooth preview, `zoom` for the print image. The print image is thresholded to pure black and white (`toOneBit`) and rotated by 90°, so the text runs along the paper; at zoom < 1 the text is smaller and the label shorter, the width stays 48 mm. Side margins and the maximum length are specified as printed sizes and divided by the zoom to get layout dots.
- **Printing:** Web Bluetooth with the common Cat Printer protocol (service `0xAE30`, write characteristic `0xAE01`). `buildJob()` creates the packets (`51 78 cmd 00 len16 data crc8 ff`): state, quality, energy, speed, then one `0xA2` packet per image row (48 bytes, leftmost pixel in the lowest bit) and the feed. Speed 24 / energy `0x0040` are the "fast" values; chunk size, pause and the estimated print duration are in the `PRINT` constants. The printer does not report when it is done, so "Printed" appears after an estimate. The protocol follows what the Cat Printer apps use (for example NaitLee's Cat-Printer).
- **Attendee list:** `parseCsv()` detects the delimiter (`,` `;` tab) and handles quotes. The name column is chosen with `extractNamesFromRows(rows, choice, hasHeader)`. The list and the check marks are kept in `localStorage`; the download is a CSV with a `Printed` column that the import reads back.
- **Intro line:** adjective lists (`ADJECTIVES`, `ADJECTIVES_EN`), no repeats within one text (`sameWord` treats spelling variants as equal), German male/female forms by `convertText()`, history of the last 10 lines.
- **i18n:** the `T` dictionary holds German and English; elements carry `data-i18n*` attributes and `applyI18n()` fills them. The static HTML is English, so the page is correct without JavaScript. The language switch is stored under `meetupapp.lang`.
- **Live view:** the editor publishes every label as a PNG over a `BroadcastChannel` (`meetup-label`) and keeps the last one in `localStorage`.
- **Mirror mode:** two manual WebRTC handshakes without a signaling server. The editor creates an offer, shown as a link and QR code (`view.html#o=<code>`); the second device creates the answer; the answer code is pasted into the editor. The SDP is compressed (`deflate-raw`) and base64url-encoded; messages are sent in chunks over a data channel. A code is valid for 5 minutes and works once; pairing again invalidates the old one.
- **State:** fields and options live in `localStorage` under `meetupapp.*`. Nothing leaves the browser except the STUN requests of mirror mode.

### Contributing

Keep the app dependency-free and single-purpose: a static page that works from a double-click. Please do not add real attendee data to the repository, not even as test data.

### License

[MIT](LICENSE) © 2026 Markus Harrer. The bundled QR code library is MIT-licensed too, see `vendor/qrcode-generator.LICENSE`.
