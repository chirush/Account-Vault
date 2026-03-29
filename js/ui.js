/* DOM helpers: escaping, time formatting, card toggle, clipboard, password visibility, form clear */

import { state } from './state.js'
import { showToast } from './toast.js'

// ── String Helpers ──

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function timeAgo(ts) {
  const d = Date.now() - ts
  const s = Math.floor(d / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

// ── Card Toggle ──

export function toggle(el) {
  const body = el.nextElementSibling
  body.classList.toggle('collapsed')
  el.querySelector('.toggle-arrow').textContent =
    body.classList.contains('collapsed') ? '▼' : '▲'
}

// ── Password Visibility ──

function updateEye() {
  document.getElementById('eyeShow').style.display = state.passwordHidden ? 'none' : 'block'
  document.getElementById('eyeHide').style.display = state.passwordHidden ? 'block' : 'none'
}

export function togglePassword(force) {
  state.passwordHidden = force !== undefined ? force : !state.passwordHidden
  document.getElementById('accPass').type = state.passwordHidden ? 'password' : 'text'
  updateEye()
}

// ── Clipboard ──

export function copyValue(id) {
  const el = document.getElementById(id)
  if (!el.value) return
  navigator.clipboard.writeText(el.value)
  showToast('Copied to clipboard', 'success')
}

export function quickCopy(cat, idx, field) {
  const a = state.vaultData.categories[cat].accounts[idx]
  const val = field === 'user' ? a.user : a.pass
  if (!val) return
  navigator.clipboard.writeText(val)
  showToast(`${field === 'user' ? 'Username' : 'Password'} copied`, 'success')
}

// ── Form ──

export function clearForm() {
  document.getElementById('accName').value = ''
  document.getElementById('accUser').value = ''
  document.getElementById('accPass').value = ''
  document.getElementById('accNotes').value = ''
  document.getElementById('accFavorite').checked = false
  state.selectedIndex = null
  togglePassword(false)
}
