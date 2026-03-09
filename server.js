// ═══════════════════════════════════════════════════════════
// Happy Face — Backend Server v3.2
// Uses Node.js built-in SQLite (node:sqlite) — requires Node v22.5+
// No npm packages needed for the database. Zero compilation.
// ═══════════════════════════════════════════════════════════

const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3456;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'happyface.db');

// ── Database setup ───────────────────────────────────────────
// DatabaseSync creates the file automatically if it does not exist.
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS app_data (
    id   INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  )
`);

const DEFAULT_DATA = {
  settings: {
    pin: '1234',
    badFaceBehavior: 'separate',
    gridRows: 10,
    gridCols: 7,
    seasonalMode: 'auto',
    prizeOpacity: 0.08,
    biometricCredentialId: null,
  },
  currentDraw: {
    id: 1,
    startDate: new Date().toISOString().split('T')[0],
    winner: null,
  },
  kids: [
    { id: 'k1', name: 'Eileencita', photo: null, prizePhoto: null, prizeName: 'Special Prize!', prizeBrandLogo: null, goodFaces: [], badFaces: [], paletteIdx: 1 },
    { id: 'k2', name: 'Andy',       photo: null, prizePhoto: null, prizeName: 'Special Prize!', prizeBrandLogo: null, goodFaces: [], badFaces: [], paletteIdx: 9 },
  ],
  drawHistory: [],
};

function getData() {
  const row = db.prepare('SELECT data FROM app_data WHERE id = 1').get();
  if (row) {
    try { return JSON.parse(row.data); } catch {}
  }
  return DEFAULT_DATA;
}

const upsert = db.prepare(`
  INSERT INTO app_data (id, data) VALUES (1, ?)
  ON CONFLICT(id) DO UPDATE SET data = excluded.data
`);

function setData(data) {
  upsert.run(JSON.stringify(data));
}

// ── Express app ──────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '50mb' }));

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  console.warn('⚠️  dist/ not found — run: npm run build');
}

app.get('/api/data', (req, res) => {
  try { res.json(getData()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Load failed' }); }
});

app.post('/api/data', (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') return res.status(400).json({ error: 'Invalid data' });
    setData(req.body);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Save failed' }); }
});

app.get('*', (req, res) => {
  const idx = path.join(distPath, 'index.html');
  if (fs.existsSync(idx)) res.sendFile(idx);
  else res.status(503).send('App not built yet. Run: npm run build');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n😊 Happy Face server running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   DB:      ${DB_PATH} ${fs.existsSync(DB_PATH) ? '(existing)' : '(will be created on first save)'}\n`);
});
