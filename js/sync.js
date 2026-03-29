/* GitHub Gist cloud sync — encrypted vault blob only */

import { showToast } from './toast.js'

const SYNC_KEY = 'vault-sync'
const API = 'https://api.github.com/gists'

// ── Config ──

function getConfig() {
  const raw = localStorage.getItem(SYNC_KEY)
  return raw ? JSON.parse(raw) : null
}

function setConfig(config) {
  localStorage.setItem(SYNC_KEY, JSON.stringify(config))
}

export function isSyncEnabled() {
  return !!getConfig()
}

export function getSyncStatus() {
  const c = getConfig()
  if (!c) return { enabled: false }
  return { enabled: true, gistId: c.gistId, lastSync: c.lastSync }
}

// ── Push (local → Gist) ──

export async function pushToGist(silent = true) {
  const config = getConfig()
  if (!config) return false

  const vaultData = localStorage.getItem('vault')
  if (!vaultData) return false

  try {
    const res = await fetch(`${API}/${config.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: { 'vault.json': { content: vaultData } }
      })
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    config.lastSync = Date.now()
    setConfig(config)
    if (!silent) showToast('Pushed to cloud', 'success')
    updateSyncIndicator()
    return true
  } catch (e) {
    console.error('Sync push failed:', e)
    if (!silent) showToast('Push failed: ' + e.message, 'error')
    return false
  }
}

// ── Pull (Gist → local) ──

export async function pullFromGist(silent = true) {
  const config = getConfig()
  if (!config) return false

  try {
    const res = await fetch(`${API}/${config.gistId}`, {
      headers: { 'Authorization': `Bearer ${config.token}` }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const gist = await res.json()
    const content = gist.files?.['vault.json']?.content
    if (!content) throw new Error('No vault data in Gist')

    localStorage.setItem('vault', content)
    config.lastSync = Date.now()
    setConfig(config)
    if (!silent) showToast('Pulled from cloud', 'success')
    updateSyncIndicator()
    return true
  } catch (e) {
    console.error('Sync pull failed:', e)
    if (!silent) showToast('Pull failed: ' + e.message, 'error')
    return false
  }
}

// ── Setup ──

export async function setupSync(token, existingGistId) {
  // Link to existing Gist
  if (existingGistId) {
    const res = await fetch(`${API}/${existingGistId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Cannot access Gist — check ID and token')

    setConfig({ token, gistId: existingGistId, lastSync: null })
    return existingGistId
  }

  // Create new private Gist
  const vaultData = localStorage.getItem('vault') || '{}'
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'Account Vault — Encrypted Sync (do not edit manually)',
      public: false,
      files: { 'vault.json': { content: vaultData } }
    })
  })

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

  const gist = await res.json()
  setConfig({ token, gistId: gist.id, lastSync: Date.now() })
  return gist.id
}

export function disconnectSync() {
  localStorage.removeItem(SYNC_KEY)
  updateSyncIndicator()
}

// ── UI Indicator ──

export function updateSyncIndicator() {
  const dot = document.getElementById('syncDot')
  if (dot) dot.style.display = isSyncEnabled() ? 'block' : 'none'
}
