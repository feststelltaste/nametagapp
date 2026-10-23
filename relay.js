// Zweiter Bildschirm auf einem anderen Gerät: eine "Raum"-URL, die live mitläuft.
// Der Editor legt jede Änderung des Etiketts (nur Text und Einstellungen, kein Bild) verschlüsselt in einem Raum ab; jedes Gerät,
// das die Raum-URL öffnet, holt sie ab und zeichnet das Etikett selbst. Verschlüsselt wird mit AES-GCM, der Schlüssel steht nur im
// QR-Code/Link (hinter dem #, wird nie an einen Server geschickt). Als Zwischenstelle dient der öffentliche Dienst ntfy.sh, der nur
// verschlüsselte Daten sieht. Ohne Internet bleibt die Live-Ansicht im zweiten Fenster desselben Browsers (BroadcastChannel).
"use strict";

const Relay = (() => {
  const SERVER = "https://ntfy.sh";
  const MAX_PAYLOAD = 3000;   // ntfy erlaubt 4096 Bytes je Nachricht; verschlüsselt und base64-kodiert bleibt Luft

  const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64url = text => Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  const randomText = n => b64url(crypto.getRandomValues(new Uint8Array(n)));
  const aesKey = keyText => crypto.subtle.importKey("raw", unb64url(keyText), "AES-GCM", false, ["encrypt", "decrypt"]);

  async function seal(keyText, text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(keyText), new TextEncoder().encode(text)));
    return b64url(new Uint8Array([...iv, ...encrypted]));
  }
  async function unseal(keyText, sealed) {
    const bytes = unb64url(sealed);
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.slice(0, 12) }, await aesKey(keyText), bytes.slice(12)));
  }

  const TOKEN = /^([A-Za-z0-9_-]{16,64})\.([A-Za-z0-9_-]{16,64})$/;
  /** Neuer Raum: unratbares Thema (Adresse beim Relay) und Schlüssel, zusammen das Kennwort "<Thema>.<Schlüssel>". */
  function createRoom() {
    const topic = randomText(16), key = randomText(32);
    return { topic, key, token: `${topic}.${key}` };
  }
  function parseRoom(token) {
    const m = TOKEN.exec(String(token || "").trim());
    return m ? { topic: m[1], key: m[2], token: m[0] } : null;
  }

  // Frische: jede Nachricht trägt einen steigenden Zeitstempel (_t) im verschlüsselten Teil. Der Empfänger nimmt nur Nachrichten an, die neuer sind
  // als die zuletzt angenommene; so kann niemand eine ältere Nachricht aus dem Cache von ntfy.sh (bis zu 12 Stunden) erneut einspielen.
  let lastStamp = 0;
  const stamp = () => (lastStamp = Math.max(Date.now(), lastStamp + 1));   // wächst auch, wenn die Uhr zurückspringt
  const fresher = () => { let last = 0; return t => (typeof t !== "number" || t > last ? (last = Math.max(last, t || 0), true) : false); };   // ohne _t (ältere Version): annehmen

  async function post(topic, key, object) {
    const sealed = await seal(key, JSON.stringify({ ...object, _t: stamp() }));
    if (sealed.length > MAX_PAYLOAD) throw new Error("Nachricht zu groß");
    const response = await fetch(`${SERVER}/${topic}`, { method: "POST", body: sealed });
    if (!response.ok) { const error = new Error(`Relay ${response.status}`); error.status = response.status; throw error; }
  }

  /** Schickt ein Objekt verschlüsselt in den Raum. Wirft, wenn der Relay nicht erreichbar ist oder die Nachricht zu groß ist. */
  const publish = (room, object) => post(room.topic, room.key, object);

  // Rückkanal ("<Thema>a"): Ein Gerät, das den QR-Code öffnet, meldet sich kurz. Erst darauf sendet der Editor, vorher geht nichts raus.
  const signal = room => post(room.topic + "a", room.key, { hello: true });
  // Quittung: der Gast tippt „Passt“, der Editor zeigt es neben dem Druckknopf. Läuft über denselben Rückkanal wie das „Hallo“.
  const ack = room => post(room.topic + "a", room.key, { ok: true });
  function listen(room, onSignal, onAck) {
    const source = new EventSource(`${SERVER}/${room.topic}a/sse?since=latest`);   // Rückkanal: mehrere Gäste mit eigenen Uhren schreiben hierher, deshalb keine Reihenfolge-Prüfung (ein wiedereingespieltes „Hallo“ kostet höchstens eine Nachricht)
    source.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);
        if (data.event !== "message") return;
        const message = JSON.parse(await unseal(room.key, data.message));
        if (message.hello) onSignal();
        else if (message.ok) onAck?.();
      } catch { /* fremde Nachricht: ignorieren */ }
    };
    return { close: () => source.close() };
  }

  /**
   * Hört auf einen Raum: die zuletzt abgelegte Nachricht kommt sofort, neue folgen live.
   * onMessage(objekt), onState("verbunden" | "getrennt"). Gibt { close() } zurück.
   */
  function subscribe(room, onMessage, onState) {
    const source = new EventSource(`${SERVER}/${room.topic}/sse?since=latest`);
    const isFresh = fresher();
    source.onopen = () => onState?.("verbunden");
    source.onerror = () => onState?.("getrennt");   // EventSource verbindet sich von selbst neu
    source.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);
        if (data.event !== "message") return;
        const message = JSON.parse(await unseal(room.key, data.message));
        if (isFresh(message._t)) onMessage(message);   // ältere oder doppelte Nachrichten (z. B. nach einer Wiederverbindung) werden verworfen
      } catch { /* fremde oder beschädigte Nachricht: ignorieren */ }
    };
    return { close: () => source.close() };
  }

  /** Prüft, ob der Relay erreichbar ist. */
  async function reachable() {
    try { return (await fetch(`${SERVER}/v1/health`, { cache: "no-store" })).ok; } catch { return false; }
  }

  // ---- QR-Code (Bibliothek vendor/qrcode.js) ----
  function qrSvg(text) {
    const qr = qrcode(0, "L");   // 0 = kleinste passende Version
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: 3, margin: 8, scalable: true });
  }

  return { createRoom, parseRoom, publish, signal, ack, listen, subscribe, reachable, qrSvg };
})();
