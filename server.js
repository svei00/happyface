// ═══════════════════════════════════════════════════════════
// Happy Face — Backend Server
// Express serves the React app + a simple JSON API backed by SQLite
// All devices on the network share the same data
// ═══════════════════════════════════════════════════════════

const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3456;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'happyface.db');

// ── Database setup ───────────────────────────────────────────
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS app_data (
    id   INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  )
`);

// Default data if database is empty
const DEFAULT_DATA = {
  settings: {
    pin: '1234',
    badFaceBehavior: 'separate',
    gridRows: 10,
    gridCols: 7,
    seasonalMode: 'auto'
  },
  currentDraw: {
    id: 1,
    startDate: new Date().toISOString().split('T')[0],
    winner: null
  },
  kids: [
    { id: 'k1', name: 'Kid 1', photo: null, prizePhoto: null, prizeName: '🎁 Special Prize!', goodFaces: [], badFaces: [], paletteIdx: 0 },
    { id: 'k2', name: 'Kid 2', photo: null, prizePhoto: null, prizeName: '🎁 Special Prize!', goodFaces: [], badFaces: [], paletteIdx: 1 }
  ],
  drawHistory: []
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

// Parse large JSON (photos are base64 encoded images — can be big)
app.use(express.json({ limit: '50mb' }));

// Serve built React app
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  console.warn('⚠️  dist/ folder not found. Run "npm run build" first.');
}

// ── API routes ───────────────────────────────────────────────

// GET /api/data — load all app state
app.get('/api/data', (req, res) => {
  try {
    res.json(getData());
  } catch (err) {
    console.error('GET /api/data error:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// POST /api/data — save all app state
app.post('/api/data', (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data' });
    }
    setData(data);
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/data error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// All other routes → serve React app (SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('App not built yet. Run: npm run build');
  }
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n😊 Happy Face server running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://YOUR_SERVER_IP:${PORT}`);
  console.log(`   DB:      ${DB_PATH}\n`);
});
