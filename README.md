# 🔒 Account Vault

A client-side encrypted password manager built with zero dependencies. Your data never leaves your browser — encrypted with AES-256-GCM, no backend, no tracking.

🔗 **[Live Demo](https://chirush.github.io/account-vault/)**

---

## ✨ Features

| Feature | Description |
|---|---|
| **AES-256-GCM Encryption** | Military-grade encryption with PBKDF2 key derivation (100k iterations) |
| **Zero Dependencies** | Pure HTML, CSS, and JavaScript — no frameworks, no npm |
| **Cloud Sync** | Sync encrypted vault across devices via private GitHub Gists |
| **Dark / Light Theme** | Toggle with persistence to localStorage |
| **Category Management** | Color-coded sidebar with account counts and quick delete |
| **Favorites** | Star accounts for priority sorting |
| **Quick Copy** | One-click copy for usernames and passwords |
| **Auto-Lock** | Vault locks after 5 minutes of inactivity |
| **Keyboard Shortcuts** | `Ctrl+S` save, `Esc` clear, `Ctrl+Shift+L` lock |
| **Import / Export** | Backup and restore encrypted vault files |
| **Change Master Password** | Re-encrypt vault with a new password anytime |

## 🔐 Security

- **Client-side only** — encryption/decryption happens entirely in your browser
- **Web Crypto API** — uses the browser's native cryptographic primitives
- **AES-256-GCM** — authenticated encryption with 12-byte random IV per save
- **PBKDF2** — 100,000 iteration key derivation from your master password
- **No telemetry** — zero external requests (except optional GitHub Gist sync)
- **Cloud sync is E2E encrypted** — GitHub only stores the ciphertext blob

## 🚀 Getting Started

### Option 1: GitHub Pages
Visit the **[live demo](https://chirush.github.io/account-vault/)** — works instantly, no setup needed.

### Option 2: Run Locally
```bash
git clone https://github.com/chirush/Account-Vault.git
cd Account-Vault
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.

> **Note:** ES modules require a local server — opening `index.html` directly via `file://` won't work.

## ☁️ Cloud Sync Setup

Sync your encrypted vault across devices using a private GitHub Gist.

### Device A (first time):
1. Unlock your vault
2. Click the **☁️ cloud icon** in the header
3. Paste a [GitHub Personal Access Token](https://github.com/settings/tokens) with the `gist` scope
4. Click **Enable Sync** — a private Gist is created automatically
5. Copy the **Gist ID** shown in the modal

### Device B (connect):
1. On the lock screen, click **☁ Cloud Sync**
2. Enter your token + the **Gist ID** from Device A
3. Click **Enable Sync**, then unlock with your master password
4. Your vault is pulled from the cloud automatically

Every save auto-pushes to GitHub. Manual push/pull is available in the sync modal.

## 📁 Project Structure

```
account-vault/
├── index.html          — Layout, modals, SVG icons
├── style.css           — Theme system, glassmorphism, responsive design
├── app.js              — Entry point, orchestrator, window bindings
└── js/
    ├── state.js        — Shared state object and constants
    ├── crypto.js       — AES-256-GCM key derivation + data migration
    ├── toast.js        — Toast notification system
    ├── theme.js        — Dark/light theme toggle
    ├── ui.js           — DOM helpers, clipboard, form utilities
    ├── render.js       — Category, account, pagination, dashboard rendering
    ├── storage.js      — Vault encrypt/save/export/import
    ├── categories.js   — Category CRUD operations
    ├── accounts.js     — Account CRUD operations
    └── sync.js         — GitHub Gist cloud sync
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + S` | Save current account |
| `Escape` | Clear form |
| `Ctrl + Shift + L` | Lock vault |
| `Enter` | Unlock (on lock screen) / Add category |

## 🛠️ Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, glassmorphism, grid layout
- **JavaScript** — ES modules, Web Crypto API, Fetch API
- **Fonts** — [Inter](https://fonts.google.com/specimen/Inter), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

## 📄 License

MIT
