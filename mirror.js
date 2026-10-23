// Spiegelmodus: verbindet den Editor (index.html) und eine Live-Ansicht (view.html) auf einem zweiten Gerät
// direkt per WebRTC, ohne Server. Die Kopplung läuft über zwei Codes, die man als Link oder QR-Code weitergibt:
//   Editor erzeugt ein Angebot (offer)  ->  zweites Gerät öffnet den Link und erzeugt eine Antwort (answer)
//   ->  Antwort wird im Editor eingefügt  ->  Verbindung steht, der Editor schickt jedes neue Etikett.
// Es gibt keine Signalisierung über einen Server; nur für die Adressfindung wird ein öffentlicher STUN-Server gefragt.
"use strict";

const Mirror = (() => {
  const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  const GATHER_TIMEOUT_MS = 4000;
  const PIECE = 12000;            // Zeichen pro Nachricht (DataChannel-Nachrichten dürfen nicht beliebig groß sein)

  // ---- Codes (SDP -> kurzer Text) ----
  const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unb64url = text => Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  async function pipe(bytes, stream) {
    const out = new Blob([bytes]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(out).arrayBuffer());
  }
  async function pack(sdp) {   // "z." = komprimiert, "r." = roh (falls der Browser keine Kompression kann)
    const raw = new TextEncoder().encode(sdp);
    if (typeof CompressionStream === "function") return "z." + b64url(await pipe(raw, new CompressionStream("deflate-raw")));
    return "r." + b64url(raw);
  }
  async function unpack(code) {
    code = code.trim();
    const bytes = unb64url(code.slice(2));
    if (code.startsWith("z.")) return new TextDecoder().decode(await pipe(bytes, new DecompressionStream("deflate-raw")));
    return new TextDecoder().decode(bytes);
  }

  // Wartet, bis alle Verbindungsadressen (ICE-Kandidaten) gesammelt sind, höchstens GATHER_TIMEOUT_MS
  function gathered(pc) {
    return new Promise(resolve => {
      if (pc.iceGatheringState === "complete") return resolve();
      const done = () => { pc.removeEventListener("icegatheringstatechange", check); resolve(); };
      const check = () => { if (pc.iceGatheringState === "complete") done(); };
      pc.addEventListener("icegatheringstatechange", check);
      setTimeout(done, GATHER_TIMEOUT_MS);
    });
  }

  // ---- Nachrichten (JSON, in Stücken) ----
  function send(channel, object) {
    if (!channel || channel.readyState !== "open") return false;
    const text = JSON.stringify(object);
    const id = Math.random().toString(36).slice(2, 8);
    const n = Math.ceil(text.length / PIECE) || 1;
    for (let i = 0; i < n; i++) channel.send(`${id}|${i}|${n}|${text.slice(i * PIECE, (i + 1) * PIECE)}`);
    return true;
  }
  function receiver(onMessage) {
    const parts = new Map();
    return event => {
      const [id, i, n, ...rest] = String(event.data).split("|");
      const data = rest.join("|");
      const entry = parts.get(id) || { n: Number(n), pieces: [], count: 0 };
      if (entry.pieces[Number(i)] === undefined) { entry.pieces[Number(i)] = data; entry.count++; }
      parts.set(id, entry);
      if (entry.count === entry.n) {
        parts.delete(id);
        for (const old of parts.keys()) if (old !== id && parts.size > 4) parts.delete(old);   // alte, unvollständige Nachrichten verwerfen
        try { onMessage(JSON.parse(entry.pieces.join(""))); } catch {}
      }
    };
  }

  // ---- Editor-Seite ----
  async function host({ onOpen, onClose, onMessage }) {
    const pc = new RTCPeerConnection(ICE);
    const channel = pc.createDataChannel("nametag");
    channel.onopen = () => onOpen?.();
    channel.onclose = () => onClose?.();
    channel.onmessage = receiver(m => onMessage?.(m));
    pc.onconnectionstatechange = () => { if (["failed", "disconnected", "closed"].includes(pc.connectionState)) onClose?.(); };
    await pc.setLocalDescription(await pc.createOffer());
    await gathered(pc);
    return {
      pc, channel,
      code: await pack(pc.localDescription.sdp),
      async accept(answerCode) { await pc.setRemoteDescription({ type: "answer", sdp: await unpack(answerCode) }); },
      send: object => send(channel, object),
      get open() { return channel.readyState === "open"; },
      close() { try { channel.close(); pc.close(); } catch {} },
    };
  }

  // ---- Ansicht-Seite ----
  async function guest(offerCode, { onOpen, onClose, onMessage }) {
    const pc = new RTCPeerConnection(ICE);
    let channel = null;
    pc.ondatachannel = event => {
      channel = event.channel;
      channel.onopen = () => onOpen?.();
      channel.onclose = () => onClose?.();
      channel.onmessage = receiver(m => onMessage?.(m));
    };
    pc.onconnectionstatechange = () => { if (["failed", "disconnected", "closed"].includes(pc.connectionState)) onClose?.(); };
    await pc.setRemoteDescription({ type: "offer", sdp: await unpack(offerCode) });
    await pc.setLocalDescription(await pc.createAnswer());
    await gathered(pc);
    return { pc, code: await pack(pc.localDescription.sdp), send: object => send(channel, object), close() { try { pc.close(); } catch {} } };
  }

  // ---- QR-Code (Bibliothek vendor/qrcode.js) ----
  function qrSvg(text) {
    const qr = qrcode(0, "L");   // 0 = kleinste passende Version
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: 3, margin: 8, scalable: true });
  }

  return { host, guest, qrSvg };
})();
