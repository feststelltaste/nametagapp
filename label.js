// Gemeinsame Etikett-Berechnung und -Zeichnung für den Editor (index.html) und die Live-Ansicht (view.html).
// Das Etikett entsteht liegend (Länge x 384 Punkte) in Druckerpunkten (8 Punkte = 1 mm). Es wird immer 48 mm breit gedruckt;
// mit dem Zoom wird die Schrift kleiner und das Etikett kürzer.
"use strict";

const Label = (() => {
  const PREVIEW_SCALE = 3;   // Vorschau in 3-facher Auflösung, damit sie glatt statt pixelig aussieht
  const WIDTH = 384, MARGIN = 10, DOTS_PER_MM = 8;   // WIDTH = Druckbreite des Druckers in Punkten
  // Schriften liegen in vendor/fonts (Roboto, Roboto Mono): auf jedem Gerät sieht das Etikett gleich aus. Danach kommen Ersatzschriften, falls sie fehlen.
  const FONT_SANS = '"Roboto", Arial, "Segoe UI", sans-serif';
  const FONT_TEXT = '"Roboto", Arial, "Segoe UI", sans-serif';
  const FONT_CODE = '"Roboto Mono", Consolas, "Cascadia Mono", "Courier New", monospace';

  function wrapWords(ctx, text, maxWidth) {
    const lines = [];
    let line = "";
    for (const word of text.split(/\s+/).filter(Boolean)) {
      const trial = line ? line + " " + word : word;
      if (!line || ctx.measureText(trial).width <= maxWidth) line = trial;
      else { lines.push(line); line = word; }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Größte Schrift (max..min), bei der der Text in höchstens maxLines Zeilen passt.
  function fitName(ctx, text, maxWidth, maxSize = 84, minSize = 28, maxLines = 3) {
    for (let size = maxSize; size >= minSize; size -= 2) {
      ctx.font = `900 ${size}px ${FONT_SANS}`;
      const lines = wrapWords(ctx, text, maxWidth);
      const widest = Math.max(0, ...lines.map(l => ctx.measureText(l).width));
      if (lines.length <= maxLines && widest <= maxWidth) return { size, lines };
    }
    ctx.font = `900 ${minSize}px ${FONT_SANS}`;
    return { size: minSize, lines: wrapWords(ctx, text, maxWidth) };
  }

  // Jede Zeile der Eingabe bleibt eine eigene Zeile auf dem Etikett; zu lange Zeilen brechen dort selbst um.
  function parseTags(raw) {
    return raw.split(/\r?\n/)
      .map(line => line.split(/[\s,]+/).filter(Boolean).map(t => (t.startsWith("#") ? t : "#" + t)))
      .filter(line => line.length);
  }

  // Aus "Dr. Anna Maria Müller" wird "Anna"; bei "Müller, Anna" wird "Anna".
  function firstName(full) {
    full = full.trim();
    if (full.includes(",")) full = full.split(",").slice(1).join(" ").trim();
    const words = full.split(/\s+/).filter(w => !/^(dr|prof|mr|mrs|ms)\.?$/i.test(w));
    return words[0] || full;
  }
  const displayName = (full, firstOnly) => (firstOnly ? firstName(full) : full.trim());

  /**
   * Berechnet das Etikett aus den Eingaben.
   * model: { title, greeting, name, firstOnly, tags, autoLength, lengthMm, zoom, sideLeftCm, sideRightCm }   (sideCm: älterer gemeinsamer Wert für beide Seiten)
   * Ergebnis: { lengthPx, fullPrintedPx, printedPx, paint(scale) }
   *   lengthPx      Länge des Layouts in Layout-Punkten (bei Zoom < 1 größer als gedruckt)
   *   printedPx     gedruckte Länge in Druckpunkten (= lengthPx * zoom)
   *   fullPrintedPx gedruckte Länge bei Zoom 1 (bestimmt den Anzeigemaßstab der Vorschau)
   *   paint(scale)  zeichnet das Layout auf ein neues Canvas (lengthPx*scale x 384*scale)
   */
  function plan(model) {
    const title = (model.title || "").trim();
    const greeting = (model.greeting || "").trim();
    const name = displayName(model.name || "", model.firstOnly !== false);
    const tags = parseTags(model.tags || "");
    const zoom = model.zoom || 1;
    const leftCm = model.sideLeftCm ?? model.sideCm ?? 0, rightCm = model.sideRightCm ?? model.sideCm ?? 0;   // Rand links und rechts getrennt (cm)
    const autoLength = model.autoLength !== false;
    const lengthMm = model.lengthMm || 80;

    const probe = document.createElement("canvas").getContext("2d");
    const TITLE_INSET = 14;   // Titel etwas weiter vom oberen Rand weg
    const titleSize = 26, titleLineH = 32, greetSize = 36, greetLineH = 44;
    const tagSize = 30, chipPadX = 6, chipH = 33, chipGap = 14, tagRowGap = 3;   // tagRowGap: Abstand zwischen zwei Hashtag-Zeilen (chipGap gilt waagerecht)

    // Misst Titel, Name und Hashtags für eine gegebene Etikettenlänge (in Punkten).
    function measure(lengthPx, leftMargin, rightMargin) {
      const inner = Math.max(60, lengthPx - leftMargin - rightMargin);
      const cx = leftMargin + (lengthPx - leftMargin - rightMargin) / 2;   // Mitte des Textbereichs zwischen den Rändern
      probe.font = `bold ${titleSize}px ${FONT_TEXT}`;
      const titleLines = title ? wrapWords(probe, title, inner) : [];
      const titleWidth = Math.max(0, ...titleLines.map(l => probe.measureText(l).width));

      probe.font = `${greetSize}px ${FONT_TEXT}`;
      const greetLines = greeting ? wrapWords(probe, greeting, inner) : [];
      const greetWidth = Math.max(0, ...greetLines.map(l => probe.measureText(l).width));

      probe.font = `500 ${tagSize}px ${FONT_CODE}`;
      const rows = [];
      for (const line of tags) {   // jede Eingabezeile beginnt eine neue Etikettzeile
        let row = [], rowW = 0;
        for (const tag of line) {
          const w = Math.min(inner, Math.ceil(probe.measureText(tag).width) + 2 * chipPadX);
          if (row.length && rowW + chipGap + w > inner) { rows.push(row); row = []; rowW = 0; }
          row.push({ tag, w });
          rowW += (row.length > 1 ? chipGap : 0) + w;
        }
        if (row.length) rows.push(row);
      }
      const rowsWidth = Math.max(0, ...rows.map(r => r.reduce((s, c) => s + c.w, 0) + chipGap * (r.length - 1)));

      // Name so groß wie möglich, solange alles in die 384 px Höhe passt.
      const titleHeight = titleLines.length ? TITLE_INSET + titleLines.length * titleLineH + 8 : 0;
      const greetHeight = greetLines.length * greetLineH;
      const fixedHeight = 2 * MARGIN + titleHeight + greetHeight + rows.length * (chipH + tagRowGap);
      let fit = { size: 0, lines: [] };
      // Bevorzugt eine Zeile (lange Namen werden dafür kleiner), erst unter 48 px wird umbrochen.
      if (name) {
        search: for (const [maxLines, minSize] of [[1, 48], [2, 28]]) {
          for (let maxSize = 120; maxSize >= minSize; maxSize -= 4) {
            fit = fitName(probe, name, inner, maxSize, minSize, maxLines);
            if (fit.lines.length <= maxLines &&
                fixedHeight + fit.lines.length * Math.round(fit.size * 1.12) + 14 <= WIDTH) break search;
          }
        }
      }
      probe.font = `900 ${fit.size}px ${FONT_SANS}`;
      const nameWidth = Math.max(0, ...fit.lines.map(l => probe.measureText(l).width));
      const nameLineH = Math.round(fit.size * 1.12);
      const bodyHeight = greetHeight + rows.length * (chipH + tagRowGap) + fit.lines.length * nameLineH + (fit.lines.length ? 14 : 0);
      return { cx, titleLines, greetLines, rows, fit, nameLineH, titleHeight, bodyHeight,
               usedWidth: Math.max(titleWidth, greetWidth, rowsWidth, nameWidth) };
    }

    // Länge und Seitenränder gelten für das gedruckte Etikett. Das Layout wird mit dem Zoom verkleinert, deshalb rechnen wir
    // sie in Layout-Punkte um (durch den Zoom teilen); gedruckt bleiben Rand und maximale Länge so groß wie eingestellt.
    function planFor(z) {
      const leftMargin = leftCm * 10 * DOTS_PER_MM / z, rightMargin = rightCm * 10 * DOTS_PER_MM / z;
      const minPx = 25 * DOTS_PER_MM / z, maxPx = 100 * DOTS_PER_MM / z;   // 25 bis 100 mm gedruckt
      const clamp = v => Math.max(minPx, Math.min(maxPx, v));
      let lengthPx;
      if (autoLength) {
        const m = measure(maxPx, leftMargin, rightMargin);   // längere Namen werden kleiner statt das Etikett zu verlängern
        lengthPx = clamp(Math.ceil(m.usedWidth) + leftMargin + rightMargin);
      } else {
        lengthPx = clamp(Math.round(lengthMm * DOTS_PER_MM / z));
      }
      return { lengthPx, m: measure(lengthPx, leftMargin, rightMargin) };
    }
    const { lengthPx, m } = planFor(zoom);
    const fullPrintedPx = zoom === 1 ? lengthPx : planFor(1).lengthPx;   // gedruckte Länge bei Zoom 1: bestimmt den Anzeigemaßstab
    const { cx, titleLines, greetLines, rows, fit, nameLineH, titleHeight, bodyHeight } = m;

    // Zeichnet das liegende Etikett; scale > 1 ergibt dasselbe Bild in höherer Auflösung (glatte Vorschau).
    function paint(scale) {
      const layout = document.createElement("canvas");
      layout.width = lengthPx * scale;
      layout.height = WIDTH * scale;
      const lctx = layout.getContext("2d");
      lctx.scale(scale, scale);
      lctx.fillStyle = "#fff";
      lctx.fillRect(0, 0, lengthPx, WIDTH);
      lctx.fillStyle = "#000";
      lctx.textAlign = "center";
      lctx.textBaseline = "middle";

      // Der Titel (Meetup-Name) steht immer ganz oben; der Rest wird im verbleibenden Platz zentriert.
      let y = MARGIN + (titleLines.length ? TITLE_INSET : 0);
      lctx.font = `bold ${titleSize}px ${FONT_TEXT}`;
      for (const line of titleLines) {
        lctx.fillText(line, cx, y + titleLineH / 2);
        y += titleLineH;
      }
      y = MARGIN + titleHeight;
      y += Math.max(0, (WIDTH - MARGIN - y - bodyHeight) / 2);

      lctx.font = `${greetSize}px ${FONT_TEXT}`;
      for (const line of greetLines) {
        lctx.fillText(line, cx, y + greetLineH / 2);
        y += greetLineH;
      }

      lctx.font = `900 ${fit.size}px ${FONT_SANS}`;
      for (const line of fit.lines) {
        lctx.fillText(line, cx, y + nameLineH / 2);
        y += nameLineH;
      }
      if (fit.lines.length) y += 14;

      lctx.font = `500 ${tagSize}px ${FONT_CODE}`;
      for (const r of rows) {
        const total = r.reduce((s, c) => s + c.w, 0) + chipGap * (r.length - 1);
        let x = cx - total / 2;
        for (const chip of r) {
          lctx.fillText(chip.tag, x + chip.w / 2, y + chipH / 2 + 1, chip.w - 2 * chipPadX / 2);
          x += chip.w + chipGap;
        }
        y += chipH + tagRowGap;
      }
      return layout;
    }

    // Senkrechte Lage von Zwischenzeile, Name und Hashtags als Anteil der Etikettbreite (0 = oben, 1 = unten), wie in paint() und previewCanvas()
    const bodyTop = MARGIN + titleHeight + Math.max(0, (WIDTH - MARGIN - (MARGIN + titleHeight) - bodyHeight) / 2);
    const greetH = greetLines.length * greetLineH, nameH = fit.lines.length * nameLineH;
    const tagsTop = bodyTop + greetH + nameH + (fit.lines.length ? 14 : 0), tagsH = rows.length * (chipH + tagRowGap);
    const frac = y => 0.5 * (1 - zoom) + zoom * y / WIDTH;
    const regions = { greeting: [frac(bodyTop), frac(bodyTop + greetH)], name: [frac(bodyTop + greetH), frac(bodyTop + greetH + nameH)], tags: [frac(tagsTop), frac(tagsTop + tagsH)], tagFont: zoom * tagSize / WIDTH, tagRow: zoom * (chipH + tagRowGap) / WIDTH };   // tagFont/tagRow: Schriftgröße und Zeilenhöhe der Hashtags als Anteil der Etikettbreite

    return { lengthPx, fullPrintedPx, printedPx: lengthPx * zoom, paint, regions, leftDots: leftCm * 10 * DOTS_PER_MM, rightDots: rightCm * 10 * DOTS_PER_MM };   // leftDots/rightDots: eingestellte Ränder in gedruckten Punkten
  }

  /** Vorschau-Canvas (glatt, 3-fach): immer 48 mm breit, mit Zoom < 1 kürzer und die Schrift kleiner, mittig auf der festen Breite. */
  // marginDots: der eigene Rand des Druckers (leeres Papier an beiden Enden, in Druckpunkten); er steht in der Vorschau links und rechts
  // vom Etikett, gedruckt wird er nicht (den lässt der Drucker selbst frei). Eine gestrichelte Linie zeigt, wo der bedruckte Bereich beginnt.
  function previewCanvas(p, zoom, marginDots = 0, showMargins = false) {
    const hi = p.paint(PREVIEW_SCALE * zoom);
    const pad = Math.round(marginDots * PREVIEW_SCALE);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(p.lengthPx * zoom * PREVIEW_SCALE) + 2 * pad;
    canvas.height = WIDTH * PREVIEW_SCALE;
    const ctx = canvas.getContext("2d");
    if (pad) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(hi, pad, Math.round((canvas.height - hi.height) / 2));
    if (pad) {
      ctx.strokeStyle = "rgba(0,0,0,.22)"; ctx.lineWidth = PREVIEW_SCALE; ctx.setLineDash([4 * PREVIEW_SCALE, 4 * PREVIEW_SCALE]);
      for (const x of [pad, canvas.width - pad]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    }
    if (showMargins) {   // nur im Editor: eingestellte Ränder links und rechts rötlich getönt, mit durchgezogener Linie am Textbereich (nicht in der Live-Ansicht, nicht gedruckt)
      const end = canvas.width - pad, l = p.leftDots * PREVIEW_SCALE, r = p.rightDots * PREVIEW_SCALE;
      ctx.setLineDash([]); ctx.fillStyle = "rgba(200,16,46,.13)"; ctx.strokeStyle = "rgba(200,16,46,.85)"; ctx.lineWidth = PREVIEW_SCALE;
      if (l) { ctx.fillRect(pad, 0, l, canvas.height); ctx.beginPath(); ctx.moveTo(pad + l, 0); ctx.lineTo(pad + l, canvas.height); ctx.stroke(); }
      if (r) { ctx.fillRect(end - r, 0, r, canvas.height); ctx.beginPath(); ctx.moveTo(end - r, 0); ctx.lineTo(end - r, canvas.height); ctx.stroke(); }
    }
    return canvas;
  }
  /** Eigener Rand des Druckers aus dem Etikettmodell (cm) in Druckpunkten; 0 bis 3 cm. */
  const printerMarginDots = model => Math.max(0, Math.min(3, Number(model.printerMarginCm) || 0)) * 10 * DOTS_PER_MM;

  // Die Schriften laden erst, wenn sie gebraucht werden; wer zeichnet, wartet vorher darauf (sonst erscheint kurz die Ersatzschrift)
  const FONT_LOADS = ['900 40px "Roboto"', '700 40px "Roboto"', '400 40px "Roboto"', '500 40px "Roboto Mono"'];
  const loadFonts = () => (typeof document !== "undefined" && document.fonts
    ? Promise.all(FONT_LOADS.map(font => document.fonts.load(font, "AaÄäÖöÜüß#Łł"))).then(() => {}, () => {})
    : Promise.resolve());

  return { PREVIEW_SCALE, WIDTH, MARGIN, DOTS_PER_MM, plan, previewCanvas, printerMarginDots, firstName, displayName, loadFonts };
})();
