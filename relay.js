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

  async function post(topic, key, object) {
    const sealed = await seal(key, JSON.stringify(object));
    if (sealed.length > MAX_PAYLOAD) throw new Error("Nachricht zu groß");
    const response = await fetch(`${SERVER}/${topic}`, { method: "POST", body: sealed });
    if (!response.ok) { const error = new Error(`Relay ${response.status}`); error.status = response.status; throw error; }
  }

  /** Schickt ein Objekt verschlüsselt in den Raum. Wirft, wenn der Relay nicht erreichbar ist oder die Nachricht zu groß ist. */
  const publish = (room, object) => post(room.topic, room.key, object);

  // Rückkanal ("<Thema>a"): Ein Gerät, das den QR-Code öffnet, meldet sich kurz. Erst darauf sendet der Editor, vorher geht nichts raus.
  const signal = room => post(room.topic + "a", room.key, { hello: Date.now() });
  function listen(room, onSignal) {
    const source = new EventSource(`${SERVER}/${room.topic}a/sse?since=latest`);
    source.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "message" && JSON.parse(await unseal(room.key, data.message)).hello) onSignal();
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
    source.onopen = () => onState?.("verbunden");
    source.onerror = () => onState?.("getrennt");   // EventSource verbindet sich von selbst neu
    source.onmessage = async event => {
      try {
        const data = JSON.parse(event.data);
        if (data.event !== "message") return;
        onMessage(JSON.parse(await unseal(room.key, data.message)));
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

  return { createRoom, parseRoom, publish, signal, listen, subscribe, reachable, qrSvg };
})();
