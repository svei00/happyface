import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const PERM_GOOD_FACES = [
  { id: "g1",  emoji: "😊", label: "Happy" },
  { id: "g2",  emoji: "😄", label: "Big Smile" },
  { id: "g3",  emoji: "🥰", label: "Loved" },
  { id: "g4",  emoji: "😍", label: "Heart Eyes" },
  { id: "g5",  emoji: "🤩", label: "Star Eyes" },
  { id: "g6",  emoji: "😘", label: "Sending Love" },
  { id: "g7",  emoji: "🤗", label: "Hugs" },
  { id: "g8",  emoji: "😎", label: "Cool" },
  { id: "g9",  emoji: "🥳", label: "Party!" },
  { id: "g10", emoji: "😇", label: "Angel" },
  { id: "g11", emoji: "😜", label: "Wild & Crazy" },
  { id: "g12", emoji: "😅", label: "So Close!" },
];

const WILDCARD_FACES = [
  { id: "w1", emoji: "❤️",  label: "Red Heart" },
  { id: "w2", emoji: "🙃",  label: "Silly Happy" },
  { id: "w3", emoji: "⭐",  label: "Gold Star" },
  { id: "w4", emoji: "👍",  label: "Thumbs Up" },
  { id: "w5", emoji: "✅",  label: "Check!" },
  { id: "w6", emoji: "😽",  label: "Cat Kiss" },
];

const SEASONAL_SETS = {
  halloween: {
    label: "🎃 Halloween", dateCheck: (m) => m === 10,
    faces: [
      { id: "h1", emoji: "🎃", label: "Pumpkin" },
      { id: "h2", emoji: "👻", label: "Ghost" },
      { id: "h3", emoji: "🦇", label: "Bat" },
      { id: "h4", emoji: "🍬", label: "Candy" },
      { id: "h5", emoji: "🕷️", label: "Spider" },
      { id: "h6", emoji: "🦉", label: "Owl" },
    ],
  },
  christmas: {
    label: "🎄 Christmas", dateCheck: (m, d) => m === 12 && d <= 25,
    faces: [
      { id: "c1", emoji: "🎄", label: "Tree" },
      { id: "c2", emoji: "⛄", label: "Snowman" },
      { id: "c3", emoji: "🎅", label: "Santa" },
      { id: "c4", emoji: "🎁", label: "Gift" },
      { id: "c5", emoji: "🤶", label: "Mrs Claus" },
      { id: "c6", emoji: "✨", label: "Magic" },
    ],
  },
  valentine: {
    label: "💝 Valentine", dateCheck: (m, d) => m === 2 && d <= 14,
    faces: [
      { id: "v1", emoji: "💝", label: "Heart Gift" },
      { id: "v2", emoji: "💖", label: "Sparkling" },
      { id: "v3", emoji: "🌹", label: "Rose" },
      { id: "v4", emoji: "💌", label: "Love Letter" },
      { id: "v5", emoji: "🎀", label: "Ribbon" },
      { id: "v6", emoji: "💋", label: "Kiss" },
    ],
  },
  easter: {
    label: "🐣 Easter", dateCheck: (m, d) => (m === 3 && d >= 20) || (m === 4 && d <= 20),
    faces: [
      { id: "e1", emoji: "🐣", label: "Hatching" },
      { id: "e2", emoji: "🌷", label: "Tulip" },
      { id: "e3", emoji: "🐰", label: "Bunny" },
      { id: "e4", emoji: "🥚", label: "Egg" },
      { id: "e5", emoji: "🌸", label: "Blossom" },
      { id: "e6", emoji: "🦋", label: "Butterfly" },
    ],
  },
  summer: {
    label: "☀️ Summer", dateCheck: (m, d) => (m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d <= 21),
    faces: [
      { id: "su1", emoji: "🌞", label: "Sun" },
      { id: "su2", emoji: "🏖️", label: "Beach" },
      { id: "su3", emoji: "🌈", label: "Rainbow" },
      { id: "su4", emoji: "🍦", label: "Ice Cream" },
      { id: "su5", emoji: "🌺", label: "Hibiscus" },
      { id: "su6", emoji: "🤿",  label: "Diving" },
    ],
  },
};

const BAD_FACES = [
  { id: "b1",  emoji: "😡", label: "Angry" },
  { id: "b2",  emoji: "😤", label: "Frustrated" },
  { id: "b3",  emoji: "🤬", label: "Very Angry" },
  { id: "b4",  emoji: "😠", label: "Mad" },
  { id: "b5",  emoji: "👎", label: "No Good" },
  { id: "b6",  emoji: "❌", label: "No Way!" },
  { id: "b7",  emoji: "👿", label: "Angry Devil" },
  { id: "b8",  emoji: "😭", label: "Crying" },
  { id: "b9",  emoji: "😒", label: "Unamused" },
  { id: "b10", emoji: "😞", label: "Disappointed" },
  { id: "b11", emoji: "🤦", label: "Facepalm" },
  { id: "b12", emoji: "👺", label: "Ogre" },
];

function detectSeason() {
  const m = new Date().getMonth() + 1, d = new Date().getDate();
  for (const [key, s] of Object.entries(SEASONAL_SETS)) {
    if (s.dateCheck(m, d)) return key;
  }
  return null;
}

function getRow3(seasonalMode) {
  if (seasonalMode === "off") return WILDCARD_FACES;
  const key = seasonalMode === "auto" ? detectSeason() : seasonalMode;
  return (key && SEASONAL_SETS[key]) ? SEASONAL_SETS[key].faces : WILDCARD_FACES;
}

const ALL_GOOD_FACES = [...PERM_GOOD_FACES, ...WILDCARD_FACES, ...Object.values(SEASONAL_SETS).flatMap(s => s.faces)];
const ALL_FACES = [...ALL_GOOD_FACES, ...BAD_FACES];
const FACE_MAP = Object.fromEntries(ALL_FACES.map(f => [f.id, f]));
const GOOD_ID_SET = new Set(ALL_GOOD_FACES.map(f => f.id));

const KID_PALETTES = [
  { color: "#FF6B35", light: "#FFF0EA", gradient: "linear-gradient(135deg,#FF6B35,#FF9F7A)" },
  { color: "#EC4899", light: "#FEF0F8", gradient: "linear-gradient(135deg,#EC4899,#F472B6)" },
  { color: "#A855F7", light: "#F5EEFF", gradient: "linear-gradient(135deg,#A855F7,#C084FC)" },
  { color: "#4ECDC4", light: "#E8FFFE", gradient: "linear-gradient(135deg,#4ECDC4,#7EE8E4)" },
  { color: "#10B981", light: "#ECFDF5", gradient: "linear-gradient(135deg,#10B981,#34D399)" },
  { color: "#F59E0B", light: "#FFFBEB", gradient: "linear-gradient(135deg,#F59E0B,#FCD34D)" },
  { color: "#F43F5E", light: "#FFF0F2", gradient: "linear-gradient(135deg,#F43F5E,#FB7185)" },
  { color: "#6366F1", light: "#EEF2FF", gradient: "linear-gradient(135deg,#6366F1,#818CF8)" },
  { color: "#0EA5E9", light: "#E0F2FE", gradient: "linear-gradient(135deg,#0EA5E9,#38BDF8)" },
  { color: "#1D4ED8", light: "#EFF6FF", gradient: "linear-gradient(135deg,#1D4ED8,#3B82F6)" },
];

const API = "/api/data";

async function loadData() {
  try {
    const res = await fetch(API);
    if (res.ok) return await res.json();
  } catch (e) { console.warn("Load failed:", e); }
  return makeDefaultData();
}

let _saveTimer = null;
function saveData(d) {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try {
      await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    } catch (e) { console.warn("Save failed:", e); }
  }, 400);
}

function makeDefaultData() {
  return {
    settings: { pin: "1234", badFaceBehavior: "separate", gridRows: 10, gridCols: 7, seasonalMode: "auto", prizeOpacity: 0.08, biometricCredentialId: null },
    currentDraw: { id: 1, startDate: new Date().toISOString().split("T")[0], winner: null },
    kids: [
      { id: "k1", name: "Eileencita", photo: null, prizePhoto: null, prizeName: "Special Prize!", prizeBrandLogo: null, goodFaces: [], badFaces: [], paletteIdx: 1 },
      { id: "k2", name: "Andy",       photo: null, prizePhoto: null, prizeName: "Special Prize!", prizeBrandLogo: null, goodFaces: [], badFaces: [], paletteIdx: 9 },
    ],
    drawHistory: [],
  };
}


// ═══════════════════════════════════════════════════════════
// BIOMETRIC AUTH (WebAuthn — fingerprint / Face ID)
// ═══════════════════════════════════════════════════════════

async function biometricAvailable() {
  try {
    if (!window.PublicKeyCredential) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch { return false; }
}

function _b64encode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function _b64decode(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

async function registerBiometric() {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Happy Face", id: window.location.hostname },
      user: { id: new Uint8Array(16), name: "parent", displayName: "Parent" },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
    },
  });
  return _b64encode(credential.rawId);
}

async function authenticateBiometric(credentialId) {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ type: "public-key", id: _b64decode(credentialId) }],
      userVerification: "required",
      timeout: 60000,
    },
  });
  return true; // no throw = success
}

function useLongPress(onLong, onTap, ms = 600) {
  const timer = useRef(null);
  const fired = useRef(false);
  const start = useCallback(() => { fired.current = false; timer.current = setTimeout(() => { fired.current = true; onLong(); }, ms); }, [onLong, ms]);
  const end   = useCallback(() => { clearTimeout(timer.current); if (!fired.current) onTap(); }, [onTap]);
  const cancel = useCallback(() => clearTimeout(timer.current), []);
  return { onMouseDown: start, onMouseUp: end, onMouseLeave: cancel, onTouchStart: start, onTouchEnd: end };
}

function KidAvatar({ kid, size = 56, ring = true }) {
  const pal = KID_PALETTES[kid.paletteIdx % KID_PALETTES.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: kid.photo ? "transparent" : pal.gradient, border: ring ? `3px solid ${pal.color}` : "none", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, fontWeight: 700, color: "#fff", boxShadow: ring ? `0 0 0 2px #fff, 0 2px 8px ${pal.color}55` : "none" }}>
      {kid.photo ? <img src={kid.photo} alt={kid.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : kid.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  return (
    <div style={{ background: "#EEE8E0", borderRadius: 99, height: 10, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", borderRadius: 99, width: `${Math.min(100, (value / max) * 100)}%`, background: color, transition: "width 0.4s cubic-bezier(.34,1.56,.64,1)" }} />
    </div>
  );
}

function PhotoPicker({ label, icon, value, onSet, onClear }) {
  const pick = (capture) => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    if (capture) inp.capture = "environment";
    inp.onchange = e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => onSet(ev.target.result); r.readAsDataURL(f); };
    inp.click();
  };
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#9B8FA0", marginBottom: 6 }}>{icon} {label}</div>
      {value ? (
        <div style={{ position: "relative" }}>
          <img src={value} alt={label} style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 12 }} />
          <button onClick={onClear} style={{ position: "absolute", top: 4, right: 4, background: "#00000066", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer", padding: "2px 6px" }}>✕</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => pick(true)}  style={{ flex: 1, background: "#F0EBE6", border: "none", borderRadius: 10, padding: "8px 4px", fontSize: 18, cursor: "pointer" }}>📷</button>
          <button onClick={() => pick(false)} style={{ flex: 1, background: "#F0EBE6", border: "none", borderRadius: 10, padding: "8px 4px", fontSize: 18, cursor: "pointer" }}>🖼️</button>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ data, onSelectKid, onOpenSettings }) {
  const totalCells = data.settings.gridRows * data.settings.gridCols;
  const lastWinner = data.drawHistory.at(-1);
  const drawWins = id => data.drawHistory.filter(d => d.winnerId === id).length;
  const sortedKids = [...data.kids].sort((a, b) => {
    if (b.goodFaces.length !== a.goodFaces.length) return b.goodFaces.length - a.goodFaces.length;
    if (a.badFaces.length !== b.badFaces.length) return a.badFaces.length - b.badFaces.length;
    return drawWins(b.id) - drawWins(a.id);
  });
  const opacity = data.settings.prizeOpacity ?? 0.08;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#FFF9F0" }}>
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E", lineHeight: 1 }}>😊 Happy Face</div>
          <div style={{ fontSize: 13, color: "#9B8FA0" }}>Draw #{data.currentDraw.id} · {data.currentDraw.startDate}</div>
        </div>
        <button onClick={onOpenSettings} style={{ background: "#1A1A2E", color: "#fff", border: "none", borderRadius: 14, padding: "10px 16px", fontSize: 22, cursor: "pointer" }}>⚙️</button>
      </div>

      {lastWinner && (
        <div style={{ margin: "16px 20px 0", background: "linear-gradient(135deg,#FFD700,#FFA500)", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 20px #FFD70055" }}>
          <div style={{ fontSize: 36 }}>🏆</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#7A4A00", textTransform: "uppercase", letterSpacing: 1 }}>Last Draw Winner</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#3D2000" }}>{lastWinner.winnerName} won Draw #{lastWinner.id}! 🎉</div>
          </div>
        </div>
      )}

      {data.currentDraw.winner && (() => {
        const w = data.kids.find(k => k.id === data.currentDraw.winner);
        if (!w) return null;
        const pal = KID_PALETTES[w.paletteIdx % KID_PALETTES.length];
        return (
          <div style={{ margin: "16px 20px 0", background: pal.gradient, borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: `0 4px 20px ${pal.color}66`, animation: "winner-pulse 2s ease-in-out infinite" }}>
            <KidAvatar kid={w} size={48} />
            <div>
              <div style={{ fontSize: 11, color: "#fff", opacity: 0.85, textTransform: "uppercase", letterSpacing: 1 }}>🎉 This Draw's Winner!</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{w.name} filled the grid first!</div>
            </div>
          </div>
        );
      })()}

      <div style={{ margin: "20px 20px 0", background: "#fff", borderRadius: 20, padding: "16px", boxShadow: "0 2px 16px #0000000a" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", marginBottom: 12 }}>🏅 Leaderboard</div>
        {sortedKids.map((kid, i) => {
          const pal = KID_PALETTES[kid.paletteIdx % KID_PALETTES.length];
          const medals = ["🥇", "🥈", "🥉"];
          const prev = sortedKids[i - 1];
          const tiedH = prev && prev.goodFaces.length === kid.goodFaces.length;
          const tiedB = tiedH && prev.badFaces.length === kid.badFaces.length;
          const wins = drawWins(kid.id);
          return (
            <div key={kid.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < sortedKids.length - 1 ? 14 : 0 }}>
              <div style={{ fontSize: 22, width: 28, textAlign: "center" }}>{medals[i] || "⭐"}</div>
              <KidAvatar kid={kid} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15, color: "#1A1A2E" }}>{kid.name}</span>
                    {tiedB && <span style={{ fontSize: 10, color: "#9B8FA0" }}>↑ draw wins</span>}
                    {tiedH && !tiedB && <span style={{ fontSize: 10, color: "#9B8FA0" }}>↑ fewer 😡</span>}
                  </div>
                  <span style={{ fontSize: 13, color: pal.color, fontWeight: 600 }}>{kid.goodFaces.length}/{totalCells} 😊</span>
                </div>
                <ProgressBar value={kid.goodFaces.length} max={totalCells} color={pal.color} />
                <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                  {kid.badFaces.length > 0 && <span style={{ fontSize: 11, color: "#FF4444" }}>{kid.badFaces.length} 😡</span>}
                  {wins > 0 && <span style={{ fontSize: 11, color: "#F59E0B" }}>🏆 {wins} win{wins > 1 ? "s" : ""}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "20px 20px 40px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#9B8FA0", marginBottom: 12 }}>👆 Tap a card to open grid</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {data.kids.map(kid => {
            const pal = KID_PALETTES[kid.paletteIdx % KID_PALETTES.length];
            const isBlocked = data.settings.badFaceBehavior === "block" && kid.badFaces.length > 0;
            return (
              <button key={kid.id} onClick={() => onSelectKid(kid.id)} style={{ border: "none", cursor: "pointer", textAlign: "left", background: "#fff", borderRadius: 22, padding: 16, boxShadow: "0 4px 20px #0000000d", borderLeft: `5px solid ${pal.color}`, position: "relative", overflow: "hidden" }}>
                {isBlocked && <div style={{ position: "absolute", top: 8, right: 8, background: "#FF4444", color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>🚫 BLOCKED</div>}
                {kid.prizePhoto && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${kid.prizePhoto})`, backgroundSize: "cover", backgroundPosition: "center", opacity, borderRadius: 18 }} />}
                {kid.prizeBrandLogo && <div style={{ position: "absolute", bottom: 8, right: 8, opacity: opacity * 3, pointerEvents: "none" }}><img src={kid.prizeBrandLogo} alt="brand" style={{ height: 28, objectFit: "contain" }} /></div>}
                <div style={{ position: "relative" }}>
                  <KidAvatar kid={kid} size={52} />
                  <div style={{ marginTop: 10, fontWeight: 700, fontSize: 18, color: "#1A1A2E" }}>{kid.name}</div>
                  <div style={{ fontSize: 12, color: "#9B8FA0", marginBottom: 10 }}>🎁 {kid.prizeName}</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ background: pal.light, color: pal.color, borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{kid.goodFaces.length} 😊</span>
                    {kid.badFaces.length > 0 && <span style={{ background: "#FFF0F0", color: "#FF4444", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{kid.badFaces.length} 😡</span>}
                  </div>
                  <ProgressBar value={kid.goodFaces.length} max={totalCells} color={pal.color} />
                  <div style={{ fontSize: 11, color: "#9B8FA0", marginTop: 4 }}>{Math.round((kid.goodFaces.length / totalCells) * 100)}% to goal</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GridCell({ face, cellIndex, onTap, onLongPress, size }) {
  const isGood = face ? GOOD_ID_SET.has(face.faceId) : null;
  const lp = useLongPress(useCallback(() => onLongPress(cellIndex), [cellIndex, onLongPress]), useCallback(() => onTap(cellIndex), [cellIndex, onTap]));
  return (
    <div {...lp} style={{ width: size, height: size, borderRadius: size * 0.22, background: face ? (isGood ? "#DCFCE7" : "#FEE2E2") : "#F0EBE6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.56, cursor: "pointer", border: face ? (isGood ? "1.5px solid #86EFAC" : "1.5px solid #FCA5A5") : "1.5px dashed #D4C9C2", userSelect: "none", WebkitUserSelect: "none", transition: "transform 0.1s" }}>
      {face ? (FACE_MAP[face.faceId]?.emoji || "") : ""}
    </div>
  );
}

function BadFaceChip({ faceId, index, onLongPress }) {
  const lp = useLongPress(useCallback(() => onLongPress(`bad-${index}`), [index, onLongPress]), () => {});
  return <div {...lp} style={{ background: "#FEE2E2", borderRadius: 10, padding: "6px 10px", fontSize: 22, cursor: "pointer", userSelect: "none", border: "1.5px solid #FCA5A5" }}>{FACE_MAP[faceId]?.emoji}</div>;
}

function GridScreen({ kid, data, totalCells, onBack, onAddFace, onCellTap, onCellLongPress, defaultFaceId }) {
  const pal = KID_PALETTES[kid.paletteIdx % KID_PALETTES.length];
  const cols = data.settings.gridCols, rows = data.settings.gridRows;
  const opacity = data.settings.prizeOpacity ?? 0.08;
  const isBlocked = data.settings.badFaceBehavior === "block" && kid.badFaces.length > 0;
  const cellSize = Math.floor((Math.min(window.innerWidth, 480) - 40 - (cols - 1) * 4) / cols);
  const defaultFace = defaultFaceId ? FACE_MAP[defaultFaceId] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#FFF9F0" }}>
      <div style={{ padding: "16px 20px 12px", background: "#fff", boxShadow: "0 2px 12px #0000000a", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "#F0EBE6", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 20, cursor: "pointer" }}>←</button>
        <KidAvatar kid={kid} size={44} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: "#1A1A2E" }}>{kid.name}</div>
          <div style={{ fontSize: 12, color: "#9B8FA0" }}>🎁 {kid.prizeName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: pal.color }}>{kid.goodFaces.length}</div>
          <div style={{ fontSize: 11, color: "#9B8FA0" }}>of {totalCells}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "16px 20px", position: "relative", overflowY: "auto" }}>
        {kid.prizePhoto && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `url(${kid.prizePhoto})`, backgroundSize: "cover", backgroundPosition: "center", opacity }} />}
        <div style={{ position: "relative", zIndex: 1 }}>
          {isBlocked && <div style={{ background: "linear-gradient(135deg,#FF4444,#FF6B6B)", color: "#fff", borderRadius: 16, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}><div style={{ fontSize: 28 }}>🚫</div><div><div style={{ fontWeight: 700, fontSize: 15 }}>Grid is Blocked!</div><div style={{ fontSize: 12, opacity: 0.9 }}>{kid.name} must earn back before adding more 😊</div></div></div>}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: pal.color }}>Progress to win</span>
              <span style={{ fontSize: 13, color: "#9B8FA0" }}>{Math.round((kid.goodFaces.length / totalCells) * 100)}%</span>
            </div>
            <ProgressBar value={kid.goodFaces.length} max={totalCells} color={pal.color} />
          </div>
          {defaultFace && !isBlocked && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, background: "#fff", borderRadius: 12, padding: "8px 12px", border: "1.5px solid #E8E0DA", fontSize: 13 }}>
              <span style={{ fontSize: 20 }}>{defaultFace.emoji}</span>
              <span style={{ color: "#9B8FA0" }}>Default: <strong style={{ color: "#1A1A2E" }}>{defaultFace.label}</strong> — tap any empty cell to add · long press to change</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 4, marginBottom: 4 }}>
            {["M","T","W","T","F","S","S"].slice(0, cols).map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9B8FA0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 4 }}>
            {Array.from({ length: rows * cols }, (_, i) => {
              const row = Math.floor(i / cols), col = i % cols;
              const faceIdx = col * rows + row;
              return <GridCell key={i} face={kid.goodFaces[faceIdx] || null} cellIndex={faceIdx} size={cellSize} onTap={onCellTap} onLongPress={onCellLongPress} />;
            })}
          </div>
          {kid.badFaces.length > 0 && (
            <div style={{ marginTop: 16, background: "#FEF2F2", borderRadius: 16, padding: "12px 14px", border: "1.5px solid #FCA5A5" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#DC2626", marginBottom: 8 }}>😡 Bad Faces ({kid.badFaces.length}) — long press to remove</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {kid.badFaces.map((f, i) => <BadFaceChip key={i} faceId={f.faceId} index={i} onLongPress={onCellLongPress} />)}
              </div>
            </div>
          )}
          <button onClick={onAddFace} disabled={isBlocked || kid.goodFaces.length >= totalCells} style={{ marginTop: 16, width: "100%", padding: "16px", background: isBlocked || kid.goodFaces.length >= totalCells ? "#D4C9C2" : pal.gradient, color: "#fff", border: "none", borderRadius: 18, fontSize: 16, fontWeight: 700, cursor: isBlocked ? "not-allowed" : "pointer", boxShadow: isBlocked ? "none" : `0 4px 20px ${pal.color}66` }}>
            {isBlocked ? "🚫 Blocked – earn back first" : kid.goodFaces.length >= totalCells ? "🎉 Grid Complete!" : defaultFace ? `＋ Add ${defaultFace.emoji} ${defaultFace.label}` : "＋ Add a Happy Face"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PINScreen({ correctPin, credentialId, onSuccess, onBack }) {
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState("");
  const [bioAvail, setBioAvail] = useState(false);
  const [bioTried, setBioTried] = useState(false);

  useEffect(() => {
    biometricAvailable().then(ok => {
      setBioAvail(ok && !!credentialId);
    });
  }, [credentialId]);

  // Auto-trigger fingerprint if available
  useEffect(() => {
    if (bioAvail && credentialId && !bioTried) {
      setBioTried(true);
      tryBiometric();
    }
  }, [bioAvail]);

  const tryBiometric = async () => {
    try {
      setHint("👆 Touch the fingerprint sensor...");
      await authenticateBiometric(credentialId);
      onSuccess();
    } catch (e) {
      setHint("Fingerprint failed — use your PIN below");
      setTimeout(() => setHint(""), 2500);
    }
  };

  const press = d => {
    const next = (entered + d).slice(0, 4); setEntered(next);
    if (next.length === 4) {
      if (next === correctPin) { onSuccess(); }
      else { setShake(true); setHint("Wrong PIN"); setTimeout(() => { setShake(false); setEntered(""); setHint(""); }, 700); }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#FFF9F0", padding: 24 }}>
      <div style={{ fontSize: 52, marginBottom: 8, animation: "spin-slow 4s linear infinite" }}>😊</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>Parent Area</div>
      <div style={{ fontSize: 15, color: "#9B8FA0", marginBottom: bioAvail ? 16 : 32 }}>
        {bioAvail ? "Use fingerprint or PIN" : "Enter your PIN to continue"}
      </div>

      {bioAvail && (
        <button onClick={tryBiometric} style={{
          marginBottom: 24, background: "linear-gradient(135deg,#1A1A2E,#3B3B5E)",
          border: "none", borderRadius: 20, padding: "14px 32px",
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
          boxShadow: "0 4px 20px #1A1A2E33",
        }}>
          <span style={{ fontSize: 32 }}>👆</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Use Fingerprint</div>
            <div style={{ fontSize: 12, color: "#aaa" }}>Touch sensor to unlock</div>
          </div>
        </button>
      )}

      <div style={{ display: "flex", gap: 14, marginBottom: 12, animation: shake ? "shake 0.4s" : "none" }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < entered.length ? "#1A1A2E" : "#D4C9C2", transition: "background 0.15s" }} />)}
      </div>
      {hint && <div style={{ color: hint.includes("Touch") ? "#6366F1" : "#FF4444", fontSize: 14, marginBottom: 12, textAlign: "center" }}>{hint}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 12, marginBottom: 20 }}>
        {[1,2,3,4,5,6,7,8,9,null,0,"⌫"].map((n, i) => n === null ? <div key={i} /> :
          <button key={i} onClick={() => n === "⌫" ? setEntered(e => e.slice(0,-1)) : press(String(n))} style={{ width: 72, height: 72, borderRadius: 18, border: "none", background: n === "⌫" ? "#F0EBE6" : "#fff", fontSize: 22, fontWeight: 600, color: "#1A1A2E", cursor: "pointer", boxShadow: "0 2px 8px #0000000d" }}>{n}</button>
        )}
      </div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#9B8FA0", fontSize: 15, cursor: "pointer" }}>← Back</button>
    </div>
  );
}

function BioSection({ credentialId, onRegister, onRemove }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => { biometricAvailable().then(setAvailable); }, []);

  if (!available) {
    return (
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontWeight:600, fontSize:15 }}>👆 Fingerprint Unlock</div>
          <div style={{ fontSize:12, color:"#9B8FA0" }}>Not available on this device / browser</div>
        </div>
        <div style={{ fontSize:11, color:"#D4C9C2", background:"#F8F5F2", borderRadius:8, padding:"4px 10px" }}>N/A</div>
      </div>
    );
  }
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div>
        <div style={{ fontWeight:600, fontSize:15 }}>👆 Fingerprint Unlock</div>
        <div style={{ fontSize:12, color:"#9B8FA0" }}>
          {credentialId ? "Registered — tap to unlock on this device" : "Register to unlock with fingerprint/Face ID"}
        </div>
      </div>
      {credentialId ? (
        <button onClick={onRemove} style={{ background:"#FEE2E2", border:"none", borderRadius:12, padding:"8px 14px", cursor:"pointer", fontWeight:600, fontSize:13, color:"#DC2626" }}>Remove</button>
      ) : (
        <button onClick={onRegister} style={{ background:"#1A1A2E", color:"#fff", border:"none", borderRadius:12, padding:"8px 14px", cursor:"pointer", fontWeight:600, fontSize:13 }}>Set Up</button>
      )}
    </div>
  );
}

function SettingsScreen({ data, updateData, onBack }) {
  const [newPin, setNewPin] = useState(""); const [showPinChange, setShowPinChange] = useState(false);
  const save = patch => updateData(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  const updateKid = (id, patch) => updateData(prev => ({ ...prev, kids: prev.kids.map(k => k.id === id ? { ...k, ...patch } : k) }));
  const addKid = () => { const id = "k" + Date.now(); updateData(prev => ({ ...prev, kids: [...prev.kids, { id, name: "New Kid", photo: null, prizePhoto: null, prizeName: "Special Prize!", prizeBrandLogo: null, goodFaces: [], badFaces: [], paletteIdx: prev.kids.length % KID_PALETTES.length }] })); };
  const removeKid = id => { if (data.kids.length <= 1) return; updateData(prev => ({ ...prev, kids: prev.kids.filter(k => k.id !== id) })); };
  const endDraw = winnerId => {
    updateData(prev => {
      const w = prev.kids.find(k => k.id === winnerId);
      return { ...prev, currentDraw: { id: prev.currentDraw.id + 1, startDate: new Date().toISOString().split("T")[0], winner: null }, kids: prev.kids.map(k => ({ ...k, goodFaces: [], badFaces: [] })), drawHistory: [...prev.drawHistory, { id: prev.currentDraw.id, startDate: prev.currentDraw.startDate, endDate: new Date().toISOString().split("T")[0], winnerId, winnerName: w?.name || "Unknown" }] };
    });
    onBack();
  };
  const h2 = t => <div style={{ fontSize: 13, fontWeight: 700, color: "#9B8FA0", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 20 }}>{t}</div>;
  const card = c => <div style={{ background: "#fff", borderRadius: 20, padding: "4px 18px", marginBottom: 16, boxShadow: "0 2px 12px #0000000a" }}>{c}</div>;
  const row = (label, content) => <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid #F0EBE6" }}><span style={{ fontSize: 15, color: "#1A1A2E", fontWeight: 500 }}>{label}</span><span>{content}</span></div>;
  const opacity = data.settings.prizeOpacity ?? 0.08;
  const sm = data.settings.seasonalMode || "auto";
  const autoSeason = detectSeason();
  const autoInfo = autoSeason ? SEASONAL_SETS[autoSeason] : null;
  const seasonOpts = [
    { val: "auto", label: "🤖 Auto", desc: autoInfo ? `Active: ${autoInfo.label}` : "No season — wildcards showing" },
    { val: "off",  label: "🃏 Off",  desc: "Always wildcard row" },
    ...Object.entries(SEASONAL_SETS).map(([k, s]) => ({ val: k, label: s.label, desc: "Force on" })),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#FFF9F0" }}>
      <div style={{ padding: "16px 20px 12px", background: "#fff", boxShadow: "0 2px 12px #0000000a", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "#F0EBE6", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 20, cursor: "pointer" }}>←</button>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#1A1A2E" }}>⚙️ Settings</div>
      </div>
      <div style={{ padding: "8px 20px 40px", overflowY: "auto" }}>
        {h2("Current Draw")}
        {card(<>{row("Draw #", <strong>#{data.currentDraw.id}</strong>)}{row("Started", <span style={{ fontSize:14 }}>{data.currentDraw.startDate}</span>)}{row("Total slots", <strong>{data.settings.gridRows * data.settings.gridCols}</strong>)}</>)}

        {h2("Bad Face Rule")}
        {card(<>{[{val:"block",emoji:"🚫",label:"Block",desc:"No happy faces until bad removed"},{val:"separate",emoji:"📊",label:"Separate",desc:"Track separately, no blocking"},{val:"cancel",emoji:"⚖️",label:"Cancel Out",desc:"Bad face removes one good face"}].map((opt,i) => (
          <div key={opt.val} onClick={() => save({ badFaceBehavior: opt.val })} style={{ padding:"13px 0",display:"flex",alignItems:"center",gap:12,cursor:"pointer",borderBottom:i<2?"1px solid #F0EBE6":"none" }}>
            <div style={{ fontSize:22 }}>{opt.emoji}</div>
            <div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:15,color:"#1A1A2E" }}>{opt.label}</div><div style={{ fontSize:12,color:"#9B8FA0" }}>{opt.desc}</div></div>
            <div style={{ width:22,height:22,borderRadius:"50%",background:data.settings.badFaceBehavior===opt.val?"#1A1A2E":"transparent",border:`2px solid ${data.settings.badFaceBehavior===opt.val?"#1A1A2E":"#D4C9C2"}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              {data.settings.badFaceBehavior===opt.val && <div style={{ width:8,height:8,borderRadius:"50%",background:"#fff" }} />}
            </div>
          </div>
        ))}</>)}

        {h2("Grid Size")}
        {card(<>{row("Columns (days)",<div style={{display:"flex",gap:6}}>{[5,6,7].map(n=><button key={n} onClick={()=>save({gridCols:n})} style={{width:36,height:36,borderRadius:10,border:"none",cursor:"pointer",background:data.settings.gridCols===n?"#1A1A2E":"#F0EBE6",color:data.settings.gridCols===n?"#fff":"#1A1A2E",fontWeight:600}}>{n}</button>)}</div>)}{row("Rows (per day)",<div style={{display:"flex",gap:6}}>{[8,10,12].map(n=><button key={n} onClick={()=>save({gridRows:n})} style={{width:36,height:36,borderRadius:10,border:"none",cursor:"pointer",background:data.settings.gridRows===n?"#1A1A2E":"#F0EBE6",color:data.settings.gridRows===n?"#fff":"#1A1A2E",fontWeight:600}}>{n}</button>)}</div>)}</>)}

        {h2("Prize Background Opacity")}
        {card(<div style={{padding:"14px 0"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:14,color:"#1A1A2E",fontWeight:500}}>🎁 Visibility: <strong>{Math.round(opacity*400)}%</strong></span><span style={{fontSize:12,color:"#9B8FA0"}}>All grids & cards</span></div><input type="range" min={0.02} max={0.35} step={0.01} value={opacity} onChange={e=>save({prizeOpacity:parseFloat(e.target.value)})} style={{width:"100%",accentColor:"#1A1A2E"}} /><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9B8FA0",marginTop:4}}><span>Subtle</span><span>Bold</span></div></div>)}

        {h2("🎭 Seasonal Faces")}
        {card(<><div style={{fontSize:12,color:"#9B8FA0",padding:"10px 0 10px",lineHeight:1.5}}>Row 3 auto-swaps by season. Force any season anytime!</div><div style={{display:"flex",flexWrap:"wrap",gap:8,paddingBottom:12}}>{seasonOpts.map(opt=><button key={opt.val} onClick={()=>save({seasonalMode:opt.val})} style={{padding:"8px 14px",borderRadius:12,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:sm===opt.val?"#1A1A2E":"#F0EBE6",color:sm===opt.val?"#fff":"#1A1A2E"}}>{opt.label}</button>)}</div><div style={{fontSize:12,color:"#9B8FA0",paddingBottom:10}}>ℹ️ {seasonOpts.find(o=>o.val===sm)?.desc}</div></>)}

        {h2("Kids")}
        {data.kids.map(kid => {
          const pal = KID_PALETTES[kid.paletteIdx % KID_PALETTES.length];
          return (
            <div key={kid.id} style={{ background:"#fff",borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px #0000000a",borderLeft:`4px solid ${pal.color}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                <KidAvatar kid={kid} size={50} />
                <div style={{ flex:1 }}>
                  <input value={kid.name} onChange={e=>updateKid(kid.id,{name:e.target.value})} style={{ fontSize:18,fontWeight:700,color:"#1A1A2E",border:"none",background:"transparent",width:"100%",fontFamily:"Fredoka,sans-serif",outline:"none" }} />
                  <input value={kid.prizeName} onChange={e=>updateKid(kid.id,{prizeName:e.target.value})} style={{ fontSize:13,color:"#9B8FA0",border:"none",background:"transparent",width:"100%",fontFamily:"Fredoka,sans-serif",outline:"none" }} placeholder="Prize name..." />
                </div>
                {data.kids.length > 1 && <button onClick={()=>removeKid(kid.id)} style={{ background:"#FEE2E2",border:"none",borderRadius:10,padding:"6px 10px",cursor:"pointer",color:"#DC2626",fontSize:14 }}>✕</button>}
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12,fontWeight:600,color:"#9B8FA0",marginBottom:8 }}>Color (10 options)</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                  {KID_PALETTES.map((p,i) => <div key={i} onClick={()=>updateKid(kid.id,{paletteIdx:i})} style={{ width:28,height:28,borderRadius:"50%",background:p.gradient,cursor:"pointer",border:kid.paletteIdx===i?"3px solid #1A1A2E":"3px solid transparent",boxShadow:kid.paletteIdx===i?"0 0 0 2px #fff":"none" }} />)}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <PhotoPicker label="Kid Photo" icon="👤" value={kid.photo} onSet={v=>updateKid(kid.id,{photo:v})} onClear={()=>updateKid(kid.id,{photo:null})} />
                <PhotoPicker label="Prize Photo" icon="🎁" value={kid.prizePhoto} onSet={v=>updateKid(kid.id,{prizePhoto:v})} onClear={()=>updateKid(kid.id,{prizePhoto:null})} />
                <PhotoPicker label="Brand Logo" icon="🏷️" value={kid.prizeBrandLogo} onSet={v=>updateKid(kid.id,{prizeBrandLogo:v})} onClear={()=>updateKid(kid.id,{prizeBrandLogo:null})} />
              </div>
            </div>
          );
        })}
        <button onClick={addKid} style={{ width:"100%",background:"#F0EBE6",border:"2px dashed #D4C9C2",borderRadius:18,padding:14,fontSize:16,fontWeight:600,color:"#9B8FA0",cursor:"pointer",marginBottom:16 }}>＋ Add Kid</button>

        {h2("Security")}
        {/* Biometric registration */}
        {card(<div style={{padding:"14px 0"}}>
          <BioSection credentialId={data.settings.biometricCredentialId} onRegister={async () => {
            try {
              const id = await registerBiometric();
              save({ biometricCredentialId: id });
            } catch(e) {
              alert("Could not register fingerprint: " + (e.message || e));
            }
          }} onRemove={() => save({ biometricCredentialId: null })} />
        </div>)}
        {card(<div style={{padding:"14px 0"}}>{showPinChange ? (
          <div><div style={{fontSize:14,color:"#9B8FA0",marginBottom:8}}>New 4-digit PIN:</div><div style={{display:"flex",gap:8}}><input value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/,"").slice(0,4))} type="password" inputMode="numeric" maxLength={4} style={{flex:1,borderRadius:12,border:"2px solid #D4C9C2",padding:"10px 14px",fontSize:20,fontFamily:"Fredoka,sans-serif",outline:"none"}} placeholder="••••" /><button onClick={()=>{if(newPin.length===4){save({pin:newPin});setShowPinChange(false);setNewPin("");}}} style={{background:"#1A1A2E",color:"#fff",border:"none",borderRadius:12,padding:"10px 16px",cursor:"pointer",fontWeight:600}}>Save</button><button onClick={()=>{setShowPinChange(false);setNewPin("");}} style={{background:"#F0EBE6",border:"none",borderRadius:12,padding:"10px 12px",cursor:"pointer"}}>✕</button></div></div>
        ) : (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,fontSize:15}}>🔐 PIN Lock</div><div style={{fontSize:12,color:"#9B8FA0"}}>Current: {"•".repeat(data.settings.pin.length)}</div></div><button onClick={()=>setShowPinChange(true)} style={{background:"#F0EBE6",border:"none",borderRadius:12,padding:"8px 14px",cursor:"pointer",fontWeight:600,fontSize:14}}>Change</button></div>
        )}</div>)}

        {data.drawHistory.length > 0 && (<>{h2("Past Draws")}{card(<>{data.drawHistory.map((d,i)=><div key={d.id} style={{padding:"12px 0",borderBottom:i<data.drawHistory.length-1?"1px solid #F0EBE6":"none",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,color:"#9B8FA0"}}>Draw #{d.id} · {d.startDate}</span><span style={{fontSize:14,fontWeight:600}}>🏆 {d.winnerName}</span></div>)}</>)}</>)}

        {h2("Draw Management")}
        <div style={{ background:"#FFF0EA",borderRadius:20,padding:18,border:"2px solid #FFDDD0" }}>
          <div style={{ fontWeight:700,fontSize:16,color:"#1A1A2E",marginBottom:6 }}>🏁 End Current Draw</div>
          <div style={{ fontSize:13,color:"#9B8FA0",marginBottom:14 }}>Choose the winner — all faces will reset!</div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {data.kids.map(kid => {
              const pal = KID_PALETTES[kid.paletteIdx % KID_PALETTES.length];
              return <button key={kid.id} onClick={()=>endDraw(kid.id)} style={{ background:pal.gradient,color:"#fff",border:"none",borderRadius:14,padding:"12px 16px",fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:10 }}><KidAvatar kid={kid} size={32} ring={false} />🏆 {kid.name} Wins!</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FacePickerModal({ onSelect, onClose, seasonalMode, isBlocked, initialId }) {
  const [highlighted, setHighlighted] = useState(initialId || null);
  const row3 = getRow3(seasonalMode || "auto");
  const activeSeason = seasonalMode === "auto" ? detectSeason() : (seasonalMode !== "off" ? seasonalMode : null);
  const seasonInfo = activeSeason ? SEASONAL_SETS[activeSeason] : null;
  const btn = (f, bg, border, tc) => {
    const hl = highlighted === f.id;
    return <button key={f.id} onClick={()=>{setHighlighted(f.id);onSelect(f.id);}} style={{ background:hl?border:bg,border:`2px solid ${border}`,borderRadius:14,padding:"8px 4px",fontSize:24,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transform:hl?"scale(1.12)":"scale(1)",transition:"transform 0.1s",boxShadow:hl?`0 2px 12px ${border}88`:"none" }}>{f.emoji}<span style={{fontSize:8,color:hl?"#fff":tc,fontWeight:600,textAlign:"center",lineHeight:1.2}}>{f.label}</span></button>;
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"20px 20px 40px",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 -8px 40px #0000001a"}}>
        <div style={{width:40,height:4,background:"#D4C9C2",borderRadius:99,margin:"0 auto 20px"}} />
        <div style={{fontWeight:700,fontSize:18,color:"#1A1A2E",marginBottom:4}}>Choose a Face</div>
        <div style={{fontSize:12,color:"#9B8FA0",marginBottom:16}}>{initialId?`Default: ${FACE_MAP[initialId]?.emoji} — tap to change`:"Pick a face — becomes the default for quick taps"}</div>
        <div style={{fontSize:11,fontWeight:700,color:"#22C55E",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>😊 Good Faces</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:5,marginBottom:8}}>{PERM_GOOD_FACES.map(f=>btn(f,"#DCFCE7","#86EFAC","#16A34A"))}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,marginTop:4,padding:"6px 10px",borderRadius:10,background:seasonInfo?"#FFF8E7":"#F8F8F8",border:`1px solid ${seasonInfo?"#FFD97D":"#EEE"}`}}>
          <span style={{fontSize:16}}>{seasonInfo?seasonInfo.label.split(" ")[0]:"🃏"}</span>
          <span style={{fontSize:11,fontWeight:700,color:seasonInfo?"#B45309":"#9B8FA0"}}>{seasonInfo?`${seasonInfo.label} Special!`:"Wildcards"}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:5,marginBottom:16}}>{row3.map(f=>btn(f,seasonInfo?"#FFF8E7":"#F0F4FF",seasonInfo?"#FFD97D":"#C7D7FF",seasonInfo?"#92400E":"#3B5BDB"))}</div>
        {!isBlocked && (<><div style={{fontSize:11,fontWeight:700,color:"#EF4444",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>😡 Bad Faces</div><div style={{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:5}}>{BAD_FACES.map(f=>btn(f,"#FEE2E2","#FCA5A5","#DC2626"))}</div></>)}
      </div>
    </div>
  );
}

function CellOptionsModal({ faceId, type, onRemove, onChange, onClose }) {
  const face = faceId ? FACE_MAP[faceId] : null;
  return (
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"20px 20px 40px",boxShadow:"0 -8px 40px #0000001a"}}>
        <div style={{width:40,height:4,background:"#D4C9C2",borderRadius:99,margin:"0 auto 20px"}} />
        {face && <div style={{textAlign:"center",fontSize:52,marginBottom:6}}>{face.emoji}</div>}
        {face && <div style={{textAlign:"center",fontSize:16,fontWeight:600,color:"#1A1A2E",marginBottom:20}}>{face.label}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {onChange && <button onClick={onChange} style={{background:"#F0EBE6",border:"none",borderRadius:16,padding:16,fontSize:16,fontWeight:600,cursor:"pointer",color:"#1A1A2E"}}>🔄 Change this face</button>}
          <button onClick={onRemove} style={{background:"#FEE2E2",border:"none",borderRadius:16,padding:16,fontSize:16,fontWeight:600,cursor:"pointer",color:"#DC2626"}}>🗑️ Remove this face</button>
          <button onClick={onClose} style={{background:"#F0EBE6",border:"none",borderRadius:16,padding:16,fontSize:16,fontWeight:600,cursor:"pointer",color:"#9B8FA0"}}>✕ Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function HappyFaceApp() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState("home");
  const [activeKidId, setActiveKidId] = useState(null);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [facePicker, setFacePicker] = useState(null);
  const [cellOptions, setCellOptions] = useState(null);
  const [defaultFaceId, setDefaultFaceId] = useState(null);

  useEffect(() => { loadData().then(setData); }, []);

  const update = useCallback(fn => {
    setData(prev => { const next = fn(prev); saveData(next); return next; });
  }, []);

  if (!data) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#FFF9F0",fontFamily:"Fredoka, sans-serif",gap:16}}>
      <div style={{fontSize:72,animation:"spin-slow 2s linear infinite"}}>😊</div>
      <div style={{fontSize:18,fontWeight:600,color:"#9B8FA0"}}>Connecting to server...</div>
      <div style={{fontSize:13,color:"#C4B8BD"}}>Make sure the Happy Face server is running</div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap'); @keyframes spin-slow{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const totalCells = data.settings.gridRows * data.settings.gridCols;
  const activeKid = data.kids.find(k => k.id === activeKidId);
  const isActiveBlocked = activeKid && data.settings.badFaceBehavior === "block" && activeKid.badFaces.length > 0;

  const applyFaceSelect = faceId => {
    if (!activeKidId) return;
    const isGood = GOOD_ID_SET.has(faceId);
    if (isGood) setDefaultFaceId(faceId);
    if (facePicker?.mode === "change" && facePicker.idx !== undefined) {
      update(prev => ({ ...prev, kids: prev.kids.map(k => { if (k.id !== activeKidId) return k; const ng = [...k.goodFaces]; ng[facePicker.idx] = { faceId, ts: Date.now() }; return { ...k, goodFaces: ng }; }) }));
    } else if (isGood) {
      update(prev => {
        const kids = prev.kids.map(k => { if (k.id !== activeKidId) return k; if (k.goodFaces.length >= totalCells) return k; if (prev.settings.badFaceBehavior === "block" && k.badFaces.length > 0) return k; return { ...k, goodFaces: [...k.goodFaces, { faceId, ts: Date.now() }] }; });
        let winner = prev.currentDraw.winner;
        if (!winner) { const w = kids.find(k => k.goodFaces.length >= totalCells); if (w) winner = w.id; }
        return { ...prev, kids, currentDraw: { ...prev.currentDraw, winner } };
      });
    } else {
      update(prev => ({ ...prev, kids: prev.kids.map(k => { if (k.id !== activeKidId) return k; const nb = [...k.badFaces, { faceId, ts: Date.now() }]; if (prev.settings.badFaceBehavior === "cancel") { const ng = [...k.goodFaces]; ng.pop(); return { ...k, goodFaces: ng, badFaces: nb }; } return { ...k, badFaces: nb }; }) }));
    }
    setFacePicker(null);
  };

  const handleCellTap = idx => {
    if (isActiveBlocked) return;
    const face = activeKid?.goodFaces[idx];
    if (face) { setCellOptions({ type: "good", idx }); }
    else if (defaultFaceId && GOOD_ID_SET.has(defaultFaceId)) { applyFaceSelect(defaultFaceId); }
    else { setFacePicker({ mode: "add" }); }
  };

  const handleCellLongPress = idx => {
    if (typeof idx === "string" && idx.startsWith("bad-")) { setCellOptions({ type: "bad", idx: parseInt(idx.split("-")[1]) }); return; }
    const face = activeKid?.goodFaces[idx];
    if (face) { setCellOptions({ type: "good", idx }); }
    else { setFacePicker({ mode: "set-default" }); }
  };

  const handleRemove = () => {
    if (!cellOptions || !activeKidId) return;
    update(prev => ({ ...prev, kids: prev.kids.map(k => { if (k.id !== activeKidId) return k; if (cellOptions.type === "good") { const ng = [...k.goodFaces]; ng.splice(cellOptions.idx, 1); return { ...k, goodFaces: ng }; } else { const nb = [...k.badFaces]; nb.splice(cellOptions.idx, 1); return { ...k, badFaces: nb }; } }) }));
    setCellOptions(null);
  };

  return (
    <div style={{ fontFamily: "'Fredoka', sans-serif", background: "#FFF9F0", minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes winner-pulse { 0%,100%{box-shadow:0 4px 20px rgba(255,215,0,0.4)} 50%{box-shadow:0 4px 40px rgba(255,215,0,0.9)} }
        @keyframes pop { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        button:active { transform: scale(0.95); }
        input[type=range] { height: 6px; }
      `}</style>
      {screen === "home" && <HomeScreen data={data} onSelectKid={id => { setActiveKidId(id); setScreen("grid"); }} onOpenSettings={() => { setPinUnlocked(false); setScreen("pin"); }} />}
      {screen === "grid" && activeKid && <GridScreen kid={activeKid} data={data} totalCells={totalCells} onBack={() => setScreen("home")} onAddFace={() => setFacePicker({ mode: "add" })} onCellTap={handleCellTap} onCellLongPress={handleCellLongPress} defaultFaceId={defaultFaceId} />}
      {screen === "pin" && <PINScreen correctPin={data.settings.pin} credentialId={data.settings.biometricCredentialId} onSuccess={() => { setPinUnlocked(true); setScreen("settings"); }} onBack={() => setScreen("home")} />}
      {screen === "settings" && pinUnlocked && <SettingsScreen data={data} updateData={update} onBack={() => setScreen("home")} />}
      {facePicker && <FacePickerModal onSelect={applyFaceSelect} onClose={() => setFacePicker(null)} seasonalMode={data.settings.seasonalMode || "auto"} isBlocked={!!isActiveBlocked && facePicker.mode !== "set-default"} initialId={defaultFaceId} />}
      {cellOptions && <CellOptionsModal faceId={cellOptions.type === "good" ? activeKid?.goodFaces[cellOptions.idx]?.faceId : activeKid?.badFaces[cellOptions.idx]?.faceId} type={cellOptions.type} onRemove={handleRemove} onChange={cellOptions.type === "good" ? () => { setFacePicker({ mode: "change", idx: cellOptions.idx }); setCellOptions(null); } : undefined} onClose={() => setCellOptions(null)} />}
    </div>
  );
}
