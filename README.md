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
- **Second screen:** *Live view in new window* (or the monitor icon in the top right) opens a second window, for example on another monitor, that shows the current label big. It can be zoomed (buttons bottom left, keys `+` `-` `0`). Under *Settings* you can set an optional welcome text for it, a large line and a smaller one below (default "Welcome!" / "Get your name tag here!"; the trash can clears it).
- **Second screen on another device (optional):** the QR icon in the top right opens a dialog. Nothing is sent until you press **Start sharing**. Then a phone or tablet scans the QR code and shows the label live; with *New QR code after each print* every guest only keeps their own name tag. This goes end-to-end encrypted through the public relay ntfy.sh, a third party, see Privacy below. If you do not want that, use the second window on a local monitor.
- **Look:** dark mode, a main color of your choice (any CSS color code), English and German (the button in the top right switches; English is the default).

## Printer

Developed for the **X6h** (50 mm labels, 48 mm print width). Other printers that speak the same Cat Printer protocol may work. The label is printed sideways so the text runs along the paper.

## Privacy

Everything stays in your browser. Attendee lists, settings and the last label live in the browser's local storage and are never uploaded. **Do not commit real attendee lists to a repository.**
Nothing leaves your computer unless you start *sharing to another device*. Then it happens in two steps:

1. **When you press Start sharing**, the page connects to the public service **ntfy.sh** (run by ntfy LLC) to wait for a device. The connection is made **directly from your browser** (not via GitHub). The service sees **your IP address**, the address of the page (`feststelltaste.github.io`), your browser type and a random room ID, but no label data and no cookies.
2. **When a phone or tablet opens the QR code**, it first shows the guest a **notice in their own language** (German or English) that explains what is sent and to whom, and connects **only after the guest taps Connect**. Nothing is sent before that, and "No, thanks" sends nothing at all. After the tap, the label data (title, name, intro line, hashtags and the second screen text) is sent to that room, **end-to-end encrypted** (AES-GCM; the key is only in the QR code, never sent to a server). The service stores the encrypted messages for up to **12 hours** and also sees the **IP addresses** of both devices and the timing. After each print a new, empty room is used, so a guest never sees someone else's name.

Free use needs no account but is limited (about 250 messages per day per IP address, no guarantee of availability). See ntfy's [privacy policy](https://docs.ntfy.sh/privacy/) and [terms](https://docs.ntfy.sh/terms/). Whether you need a **data processing agreement** (Auftragsverarbeitungsvertrag) or have to inform participants is for you to check; the encryption is meant to keep names away from the service, but it is not legal advice. If you do not want any third party, do not use this function and show the second window on a local monitor instead.

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
- **Zweiter Bildschirm:** „Live-Ansicht in neuem Fenster" (oder das Monitor-Symbol oben rechts) öffnet ein zweites Fenster, zum Beispiel auf dem anderen Monitor, das das aktuelle Etikett groß zeigt. Es lässt sich zoomen (Knöpfe unten links, Tasten `+` `-` `0`). Unter *Einstellungen* kannst du einen optionalen Willkommenstext dafür setzen, eine große Zeile und darunter eine kleinere (Vorgabe „Willkommen bei uns!" / „Hier gibt es dein Namensschild!"; der Papierkorb leert ihn).
- **Zweiter Bildschirm auf einem anderen Gerät (optional):** Das QR-Symbol oben rechts öffnet ein Fenster. Gesendet wird erst, wenn du **Teilen starten** drückst. Dann scannt ein Handy oder Tablet den QR-Code und zeigt das Etikett live; mit *Nach jedem Druck ein neuer QR-Code* behält jeder Gast nur sein eigenes Namensschild. Die Daten laufen Ende-zu-Ende verschlüsselt über den öffentlichen Relay-Dienst ntfy.sh, einen Drittanbieter, siehe Datenschutz. Wer das nicht möchte, nutzt das zweite Fenster an einem lokalen Monitor.
- **Aussehen:** Dark Mode, frei wählbare Hauptfarbe (jeder CSS-Farbcode), Englisch und Deutsch.

### Drucker

Entwickelt für den **X6h** (50-mm-Etiketten, 48 mm Druckbreite). Andere Drucker mit demselben Cat-Printer-Protokoll funktionieren möglicherweise. Das Etikett wird quer gedruckt, damit der Text entlang des Papiers läuft.

### Datenschutz

Alles bleibt in deinem Browser. Teilnehmerlisten, Einstellungen und das letzte Etikett liegen im lokalen Speicher des Browsers und werden nie hochgeladen. **Echte Teilnehmerlisten gehören nicht in ein Repository.**
Es verlässt nichts deinen Rechner, solange du das *Teilen auf einem anderen Gerät* nicht startest. Dann passiert es in zwei Schritten:

1. **Beim Klick auf „Teilen starten"** verbindet sich die Seite mit dem öffentlichen Dienst **ntfy.sh** (Betreiber ntfy LLC), um auf ein Gerät zu warten. Die Verbindung entsteht **direkt aus deinem Browser** (nicht über GitHub). Der Dienst sieht **deine IP-Adresse**, die Adresse der Seite (`feststelltaste.github.io`), deinen Browser-Typ und eine zufällige Raum-ID, aber keine Etikett-Daten und keine Cookies.
2. **Sobald ein Handy oder Tablet den QR-Code öffnet**, zeigt es dem Gast zuerst einen **Hinweis in seiner Sprache** (Deutsch oder Englisch), was gesendet wird und an wen, und verbindet sich **erst, wenn der Gast „Verbinden“ tippt**. Vorher wird nichts gesendet, und „Nein, danke“ sendet gar nichts. Nach dem Tippen gehen die Etikett-Daten (Titel, Name, Zwischenzeile, Hashtags und der Text für den zweiten Bildschirm) in diesen Raum, **Ende-zu-Ende verschlüsselt** (AES-GCM; der Schlüssel steckt nur im QR-Code und geht nie an einen Server). Der Dienst speichert die verschlüsselten Nachrichten bis zu **12 Stunden** und sieht außerdem die **IP-Adressen** beider Geräte und die Zeitpunkte. Nach jedem Druck gilt ein neuer, leerer Raum, damit ein Gast nie den Namen eines anderen sieht.

Die kostenlose Nutzung braucht kein Konto, ist aber begrenzt (etwa 250 Nachrichten pro Tag und IP-Adresse, keine Verfügbarkeitszusage). Siehe die [Datenschutzerklärung](https://docs.ntfy.sh/privacy/) und die [Nutzungsbedingungen](https://docs.ntfy.sh/terms/) von ntfy. Ob du einen **Auftragsverarbeitungsvertrag** brauchst oder die Teilnehmer informieren musst, prüfst du selbst; die Verschlüsselung soll die Namen vom Dienst fernhalten, ersetzt aber keine Rechtsberatung. Wer keinen Dritten möchte, nutzt diese Funktion nicht und zeigt das zweite Fenster auf einem lokalen Monitor.

---

## For developers

The app is a handful of static files with **no build step and no runtime dependencies**.

| File | Purpose |
|---|---|
| `index.html` | the editor: UI, label rendering, printing (inline script) |
| `view.html` | the second screen: live view in a second window, or on another device via a shared room |
| `label.js` | shared label layout and drawing (used by the editor and the live view) |
| `relay.js` | optional sharing to another device: encrypted rooms on ntfy.sh, QR code |
| `vendor/qrcode.js` | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 2.0.4 (MIT), used for the pairing QR code |
| `LICENSE` | MIT license of this project |

### Run locally

Open `index.html` in Chrome or Edge, or serve the folder (a secure context is needed for Web Bluetooth; `localhost`, `https://` and `file://` pages qualify):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

It also works unchanged on GitHub Pages (HTTPS). `index.html` and `view.html` must be served from the same origin for the live view.

### How it works

- **Rendering (`label.js`):** the label is laid out in printer dots (384 dots = 48 mm, 8 dots/mm) on a canvas, landscape. `paint(scale)` draws the same layout at any scale: 3x for the smooth preview, `zoom` for the print image. The print image is thresholded to pure black and white (`toOneBit`) and rotated by 90°, so the text runs along the paper; at zoom < 1 the text is smaller and the label shorter, the width stays 48 mm. Side margins and the maximum length are specified as printed sizes and divided by the zoom to get layout dots.
- **Printing:** Web Bluetooth with the common Cat Printer protocol (service `0xAE30`, write characteristic `0xAE01`). `buildJob()` creates the packets (`51 78 cmd 00 len16 data crc8 ff`): state, quality, energy, speed, then one `0xA2` packet per image row (48 bytes, leftmost pixel in the lowest bit) and the feed. Speed 24 / energy `0x0040` are the "fast" values; chunk size, pause and the estimated print duration are in the `PRINT` constants. The printer does not report when it is done, so "Printed" appears after an estimate. The protocol follows what the Cat Printer apps use (for example NaitLee's Cat-Printer).
- **Attendee list:** `parseCsv()` detects the delimiter (`,` `;` tab) and handles quotes. The name column is chosen with `extractNamesFromRows(rows, choice, hasHeader)`. The list and the check marks are kept in `localStorage`; the download is a CSV with a `Printed` column that the import reads back.
- **Intro line:** adjective lists (`ADJECTIVES`, `ADJECTIVES_EN`), no repeats within one text (`sameWord` treats spelling variants as equal), German male/female forms by `convertText()`, history of the last 10 lines.
- **i18n:** the `T` dictionary holds German and English; elements carry `data-i18n*` attributes and `applyI18n()` fills them. The static HTML is English, so the page is correct without JavaScript. The language switch is stored under `meetupapp.lang`.
- **Live view (same browser):** the editor publishes every label as a PNG over a `BroadcastChannel` (`meetup-label`) and keeps the last one in `localStorage`; nothing leaves the computer.
- **Sharing to another device (opt-in):** a guest's phone first shows a consent page (`view.html`, text in `TEXT.consent*`, language from the browser, consent remembered per tab in `sessionStorage`) and only then subscribes. A "room" is a random ntfy.sh topic plus a random AES-GCM key; the QR code/link is `view.html#r=<topic>.<key>` (the key is in the fragment and never sent to a server). The editor sends only the label *model* (title, name, tags, zoom, margins, texts), sealed with the key and debounced to about one message per 1.2 s, never a picture. `view.html` subscribes to the topic (`since=latest` over Server-Sent Events), decrypts and draws the label itself with `label.js`, so it is sharp on any screen. After a print a new, empty room is started, so the next guest does not see the previous name. It is off by default, not resumed after a reload, and counts the messages against the free limit (about 250 per day and IP).
- **State:** fields and options live in `localStorage` under `meetupapp.*`. Nothing leaves the browser unless sharing to another device is started.

### Contributing

Keep the app dependency-free and single-purpose: a static page that works from a double-click. Please do not add real attendee data to the repository, not even as test data.

### License

[MIT](LICENSE) © 2026 Markus Harrer. The bundled QR code library is MIT-licensed too, see `vendor/qrcode-generator.LICENSE`.
