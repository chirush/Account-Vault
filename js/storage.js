/* Vault persistence: encrypt/save, export, import */

import { state } from './state.js'
import { showToast } from './toast.js'
import { updateDashboard } from './render.js'

export async function saveVault() {
  if (!state.key) return
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = new TextEncoder().encode(JSON.stringify(state.vaultData))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, state.key, data)
  localStorage.setItem('vault', JSON.stringify({
    iv: [...iv], data: [...new Uint8Array(encrypted)]
  }))
  state.lastSavedTime = Date.now()
  updateDashboard()
}

export function exportVault() {
  const d = localStorage.getItem('vault')
  if (!d) return showToast('Nothing to export', 'warning')
  const b = new Blob([d], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(b)
  a.download = 'vault.json'
  a.click()
  showToast('Vault exported', 'success')
}

export function importVault(e) {
  const file = e.target.files[0]
  if (!file) return
  const r = new FileReader()
  r.onload = () => {
    localStorage.setItem('vault', r.result)
    showToast('Vault imported — please unlock', 'success')
  }
  r.readAsText(file)
  e.target.value = ''
}
