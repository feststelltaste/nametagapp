# NametagApp

**A small app for creating name tags with a Cat thermal printer.**
Type a name, pick a few words, press print: the label goes straight from your browser to the printer over Bluetooth (Web Bluetooth). No server, no build step, no dependencies to install.

*by feststelltaste · [Deutsch weiter unten](#deutsch)*

## Quick start

1. Open `index.html` in **Chrome or Edge** (double-click works; `python3 -m http.server 8000` and `http://localhost:8000` is the safer variant).
2. Switch the printer on and make sure no phone is connected to it.
3. Fill in the label and press **Print**. The first time, the browser asks you to pick the printer (`X6h-…`).

Web Bluetooth only works in Chromium-based browsers and in a secure context (`https://`, `localhost` or a `file://` page). It also works from GitHub Pages.

## What it does

- **Label:** title text on top, an optional intro line, the name in large letters, hashtags at the bottom (every line you type stays its own line).
- **First name only:** one button next to the name field. It switches back on after every print.
- **Intro line:** write your own or roll positive adjectives (one, two or three), e.g. "Awesome, brilliant & brave". In German with male/female forms.
- **Attendee list:** load a CSV export from Meetup (or a text file with one name per line), pick the column that holds the name, search while typing, and printed names are checked off automatically. Download the list with the check marks and upload it again later.
- **Print settings:** automatic label length (up to 100 mm), zoom 1 / 0.75 / 0.5 for smaller labels, reversed direction, and the length shown under the preview.
- **Live view:** `view.html` in a second window (for example on another monitor) shows the current label big.
- **Mirror mode:** show the label live on a second device via a direct WebRTC connection. Scan a QR code, paste the answer code back in. Codes are valid for 5 minutes and work once.
- Dark mode, adjustable main color, German and English.

## Printer

Developed for the **X6h** (384 dots = 48 mm print width, 50 mm labels). It speaks the common "Cat Printer" protocol (service `0xAE30`, write characteristic `0xAE01`); other printers with the same protocol may work. The label is printed sideways (rotated by 90°) so the text runs along the paper.

The protocol code follows the Cat Printer protocol as used by NaitLee's Cat-Printer app. Print speed is fixed to the fast mode (speed 24); if you want to tune it, see the `PRINT` constants in `index.html`.

## Privacy

Everything stays in your browser. Attendee lists, settings and the last label live in `localStorage` and are never uploaded. Do not commit real attendee lists to a repository.
Mirror mode connects the two devices directly; only to find each other's address it asks a public STUN server (`stun.l.google.com`). Names do not pass through any server.

## Files

| File | Purpose |
|---|---|
| `index.html` | the editor and printing |
| `view.html` | live view / second device |
| `mirror.js` | WebRTC pairing for mirror mode |
| `vendor/qrcode.js` | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 2.0.4 (MIT) |

## License

[MIT](LICENSE) © 2026 Markus Harrer. The bundled QR code library is MIT-licensed too, see `vendor/qrcode-generator.LICENSE`.

---

## Deutsch

**NametagApp** druckt Namensschilder direkt aus dem Browser auf einen Cat-Thermodrucker (Web Bluetooth), ohne Server und ohne Installation.

**Start:** `index.html` in Chrome oder Edge öffnen, Drucker einschalten (nicht mit dem Handy verbunden), Etikett ausfüllen, **Drucken** klicken und beim ersten Mal den Drucker `X6h-…` auswählen.

**Funktionen:** Titel, Zwischenzeile (auch mit zufälligen positiven Adjektiven, gegendert), Name groß (auf Wunsch nur der Vorname), Hashtags mit eigenen Zeilen, Teilnehmerliste aus dem Meetup-CSV-Export mit wählbarer Namensspalte und automatischem Abhaken, Etikettenlänge automatisch bis 100 mm, Zoom 1 / 0,75 / 0,5, Live-Ansicht im zweiten Fenster, Spiegelmodus auf einem zweiten Gerät per WebRTC und QR-Code, Dark Mode, einstellbare Hauptfarbe, Deutsch und Englisch.

**Datenschutz:** Alles bleibt im Browser (`localStorage`). Teilnehmerlisten werden nie hochgeladen und gehören nicht ins Repository. Der Spiegelmodus verbindet die Geräte direkt, nur zum Finden der Adresse wird ein öffentlicher STUN-Server gefragt.

**Lizenz:** MIT, © 2026 Markus Harrer.
