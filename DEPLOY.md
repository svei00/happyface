# 😊 Happy Face — Deployment & User Guide
**Version 3.1 · SQLite database · Shared across all devices · Biometric unlock**

---

## 🔑 Default PIN: `1234`
Change on first use: tap ⚙️ → type 1234 → Security → Change PIN.

---

## 🏗️ Architecture

```
Any device on WiFi ──► DietPi :3456 ──► Express (server.js) ──► happyface.db (SQLite)
                                               │
                                               └──► serves React app (dist/)
```

- **One SQLite file** on the server = one source of truth for every device
- Photos stored as base64 inside SQLite — upload on one phone, visible everywhere
- No separate database server — SQLite is just a file, very low RAM usage

---

## 🔌 Get Your Real Server IP

`hostname -I` may show Docker bridge IPs, not your real LAN address. Use this instead:
```bash
ip route get 8.8.8.8 | grep -oP 'src \K\S+'
```
This always returns the real LAN IP that your phones and laptop use to reach the server.

---

## 🚀 Fresh Installation

### Step 1 — Transfer zip to server
```bash
scp happyface-project.zip svei@YOUR_SERVER_IP:/home/svei/
```

### Step 2 — SSH in and install
```bash
ssh svei@YOUR_SERVER_IP
cd /home/svei
unzip happyface-project.zip
cd happyface-project/happyface

# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build

# Test manually first
node server.js
# Open http://YOUR_SERVER_IP:3456 in browser — app should load and data should persist
# Press Ctrl+C when confirmed working
```

### Step 3 — Install as systemd service (auto-start on reboot)
```bash
sudo cp happyface.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable happyface
sudo systemctl start happyface
sudo systemctl status happyface   # should say: active (running)
```

### Check logs if something goes wrong
```bash
journalctl -u happyface -n 50 -f
```

---

## 🔄 Updating the App (manual)

Your `happyface.db` is never included in the zip — all family data is always safe.

```bash
sudo systemctl stop happyface
# Upload new zip and unzip, or just replace App.jsx in src/
npm run build
sudo systemctl start happyface
```

---

## 🤖 GitHub Auto-Deploy (recommended)

Push code to GitHub → server automatically pulls, rebuilds, and restarts. No SSH needed.

### Step 1 — Create a deploy SSH key on your server
```bash
ssh-keygen -t ed25519 -C "happyface-deploy" -f ~/.ssh/happyface_deploy -N ""
cat ~/.ssh/happyface_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/happyface_deploy   # copy the PRIVATE key — you need it next
```

### Step 2 — Add secrets to your GitHub repository
Settings → Secrets and variables → Actions → New repository secret:
- `SERVER_HOST` → your server's LAN IP (e.g. `192.168.1.45`)
- `SERVER_USER` → `svei`
- `SERVER_SSH_KEY` → contents of `~/.ssh/happyface_deploy` (the private key)

### Step 3 — Push to GitHub
```bash
cd /home/svei/happyface-project/happyface
git init
git remote add origin https://github.com/YOURUSER/happyface.git
git add .
git commit -m "v3.1 initial"
git push -u origin main
```

From now on: edit code → `git push` → server updates in ~30 seconds automatically.

---

## 🌐 Access the App

**Direct (always works on your home WiFi):**
```
http://YOUR_SERVER_IP:3456
```

**Via Nginx Proxy Manager (optional nice URL):**
1. Open NPM at `http://YOUR_SERVER_IP:81`
2. Proxy Hosts → Add Proxy Host
3. Domain: `happyface` or `happyface.local`
4. Forward IP: your real LAN IP (from `ip route get 8.8.8.8 | grep -oP 'src \K\S+'`)
5. Forward Port: `3456`
6. Save

---

## 📱 Install as App on Phone (PWA)

### Android — Chrome
1. Go to `http://YOUR_SERVER_IP:3456` in Chrome
2. Tap ⋮ menu → **Install app** or **Add to Home Screen**
3. The 😊 icon appears on your home screen — opens full-screen with no browser bar ✅

### iPhone / iPad — Safari ONLY
1. Open **Safari** (not Chrome) → navigate to the URL
2. Tap the Share button (↑) → **Add to Home Screen** → Add
3. The 😊 icon appears on your home screen ✅

---

## 👆 Setting Up Fingerprint Unlock (per device)

Fingerprint uses the WebAuthn standard built into Android Chrome and iPhone Safari. It works on mobile only — desktop/laptop always uses the PIN.

**Register your fingerprint (do this on each phone separately):**
1. Open the app → tap ⚙️ → enter your PIN
2. Settings → Security → tap **"Set Up"** next to Fingerprint Unlock
3. Your phone will prompt you to scan a finger — do it
4. Done. The credential is saved in the database

**After registration:**
- Tap ⚙️ → fingerprint prompt appears automatically
- Touch the sensor → instant access
- If fingerprint fails, the PIN keypad is right below it as fallback

**Multiple devices:**
Each device (your phone, your wife's phone) registers independently. Both credentials are stored in the database so each device works on its own. Your wife taps "Set Up" on her phone — done.

**To remove a fingerprint registration:**
Settings → Security → tap **"Remove"** next to Fingerprint Unlock.

---

## 🎮 App Quick Reference

| Action | How |
|--------|-----|
| Add face (quick) | Tap empty grid cell — uses default face if one is set |
| Add face (choose) | Tap the **＋ Add** button at the bottom |
| Set default face | Long press any empty cell → pick a face → becomes the tap default |
| Change a face | Long press a filled cell → Change |
| Remove a good face | Long press a filled cell → Remove |
| Remove a bad face | Long press the red chip below the grid |
| Edit kid name | ⚙️ Settings → kid card → tap the name field |
| Edit prize name | ⚙️ Settings → kid card → tap the prize name field |
| Upload kid photo | ⚙️ Settings → kid card → 📷 camera or 🖼️ gallery |
| Upload prize photo | ⚙️ Settings → kid card → 🎁 |
| Upload brand logo | ⚙️ Settings → kid card → 🏷️ |
| Prize opacity | ⚙️ Settings → Prize Background Opacity slider |
| Seasonal mode | ⚙️ Settings → Seasonal Faces → Auto / Off / Force season |
| End draw / new week | ⚙️ Settings → scroll to bottom → choose winner |
| Change PIN | ⚙️ Settings → Security → Change |
| Set up fingerprint | ⚙️ Settings → Security → Set Up (mobile only) |

---

## 😊 Face Reference

### Good Faces — Row 1 (permanent)
😊 Happy · 😄 Big Smile · 🥰 Loved · 😍 Heart Eyes · 🤩 Star Eyes · 😘 Sending Love

### Good Faces — Row 2 (permanent)
🤗 Hugs · 😎 Cool · 🥳 Party! · 😇 Angel · 😜 Wild & Crazy · 😅 So Close!

### Good Faces — Row 3 (wildcard / seasonal)
❤️ Red Heart · 🙃 Silly Happy · ⭐ Gold Star · 👍 Thumbs Up · ✅ Check! · 😽 Cat Kiss

### Bad Faces
😡 Angry · 😤 Frustrated · 🤬 Very Angry · 😠 Mad · 👎 No Good · ❌ No Way!
👿 Angry Devil · 😭 Crying · 😒 Unamused · 😞 Disappointed · 🤦 Facepalm · 👺 Ogre

---

## 🎭 Seasonal Schedule

| Season | Dates | Row 3 becomes |
|--------|-------|---------------|
| 🎃 Halloween | All of October | 🎃 👻 🦇 🍬 🕷️ 🦉 |
| 🎄 Christmas | Dec 1 – Dec 25 | 🎄 ⛄ 🎅 🎁 🤶 ✨ |
| 💝 Valentine | Feb 1 – Feb 14 | 💝 💖 🌹 💌 🎀 💋 |
| 🐣 Easter | Mar 20 – Apr 20 | 🐣 🌷 🐰 🥚 🌸 🦋 |
| ☀️ Summer | Jun 21 – Sep 21 | 🌞 🏖️ 🌈 🍦 🌺 🤿 |

Force any season manually: ⚙️ Settings → Seasonal Faces.

---

## 🏅 Ranking Logic

1. **Most 😊 good faces**
2. Tiebreaker: **Fewest 😡 bad faces**
3. Tiebreaker: **Most all-time draw wins 🏆**

---

## 🛑 Troubleshooting

**"Connecting to server..." stuck on screen**
→ Server is not running: `sudo systemctl start happyface`
→ Check logs: `journalctl -u happyface -n 30`

**npm install fails**
→ `rm -rf node_modules package-lock.json && npm install`

**Data not shared between devices**
→ Make sure all devices use the server IP, not `localhost`
→ `localhost` always means "this device" — everyone must use the server's LAN IP

**Fingerprint button not showing**
→ Only appears on Android Chrome and iPhone Safari with a registered credential
→ Must be accessed over HTTPS or `localhost` — plain HTTP on LAN may block WebAuthn on some devices. If this is an issue, enable SSL in NPM for the proxy host

**Fingerprint prompt appears but fails**
→ Try removing and re-registering: Settings → Security → Remove → Set Up again
→ PIN is always available below as fallback

**NPM proxy 502 error**
→ Check service is running: `systemctl status happyface`
→ Try `127.0.0.1` instead of LAN IP in the NPM forward hostname field

**Seasonal faces showing wrong emojis**
→ Fixed in v3.0. If still happening, you have old data with old face IDs in the database. Clear it:
```bash
sudo systemctl stop happyface
rm /home/svei/happyface-project/happyface/happyface.db
sudo systemctl start happyface
```
⚠️ This resets all family data. Only do this if the bug is severe.

**Service fails to start after update**
→ `sudo nano /etc/systemd/system/happyface.service` — verify the WorkingDirectory path is correct
→ After editing: `sudo systemctl daemon-reload && sudo systemctl restart happyface`
