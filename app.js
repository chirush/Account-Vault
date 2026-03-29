/* ══════════════════════════════════════════
   Account Vault — Entry Point
   AES-256-GCM · Client-Side · No Backend
   ══════════════════════════════════════════ */

// ── Module Imports ──
import { state, AUTO_LOCK_MS } from './js/state.js'
import { deriveKey, migrateVaultData } from './js/crypto.js'
import { showToast } from './js/toast.js'
import { initTheme, toggleTheme } from './js/theme.js'
import { toggle, togglePassword, copyValue, quickCopy, clearForm } from './js/ui.js'
import { renderCategories, renderAccounts, updateDashboard, goToPage } from './js/render.js'
import { saveVault, exportVault, importVault } from './js/storage.js'
import { addCategory, deleteCategory, selectCategory } from './js/categories.js'
import { saveAccount, loadAccount, delAccount, toggleFavorite } from './js/accounts.js'

// ── Vault Unlock ──

async function unlock() {
  const pw = document.getElementById('master').value
  if (!pw) return showToast('Enter master password', 'warning')

  state.key = await deriveKey(pw)
  const saved = localStorage.getItem('vault')

  if (saved) {
    try {
      const { iv, data } = JSON.parse(saved)
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) }, state.key, new Uint8Array(data)
      )
      state.vaultData = JSON.parse(new TextDecoder().decode(decrypted))
      state.vaultData = migrateVaultData(state.vaultData)
    } catch {
      state.key = null
      return showToast('Wrong password', 'error')
    }
  }

  document.getElementById('lockScreen').classList.add('hidden')
  document.getElementById('vault').classList.remove('hidden')
  document.getElementById('vaultActions').classList.remove('hidden')

  renderCategories()
  updateDashboard()
  await saveVault() // persist migrated data format
  resetAutoLock()
  showToast('Vault unlocked', 'success')
}

// ── Vault Lock ──

function lockVault() {
  state.key = null
  state.vaultData = { categories: {} }
  state.currentCategory = null
  state.selectedIndex = null
  state.page = 1
  clearTimeout(state.autoLockTimer)

  clearForm()
  document.getElementById('vault').classList.add('hidden')
  document.getElementById('vaultActions').classList.add('hidden')
  document.getElementById('lockScreen').classList.remove('hidden')
  document.getElementById('master').value = ''
  document.getElementById('accountList').innerHTML = ''
  document.getElementById('pagination').innerHTML = ''
  document.getElementById('categoryList').innerHTML = ''

  showToast('Vault locked', 'info')
}

// ── Change Master Password ──

function showChangePassword() {
  document.getElementById('cpModal').classList.remove('hidden')
}

function closeChangePassword() {
  document.getElementById('cpModal').classList.add('hidden')
  document.getElementById('cpNew').value = ''
  document.getElementById('cpConfirm').value = ''
}

async function changePassword() {
  const np = document.getElementById('cpNew').value
  const cp = document.getElementById('cpConfirm').value
  if (!np) return showToast('Enter new password', 'warning')
  if (np !== cp) return showToast('Passwords do not match', 'error')

  state.key = await deriveKey(np)
  await saveVault()
  closeChangePassword()
  showToast('Master password changed', 'success')
}

// ── Auto-Lock ──

function resetAutoLock() {
  clearTimeout(state.autoLockTimer)
  if (state.key) state.autoLockTimer = setTimeout(lockVault, AUTO_LOCK_MS)
}

;['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(ev =>
  document.addEventListener(ev, resetAutoLock, { passive: true })
)

// ── Keyboard Shortcuts ──

document.addEventListener('keydown', e => {
  if (!state.key) return
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveAccount() }
  if (e.key === 'Escape') { clearForm(); renderAccounts() }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') { e.preventDefault(); lockVault() }
})

// ── Expose to Window (for inline onclick handlers in HTML) ──

Object.assign(window, {
  // UI
  toggle, toggleTheme, togglePassword, copyValue, quickCopy, clearForm,
  // Vault
  unlock, lockVault, saveVault, exportVault, importVault,
  // Change password
  showChangePassword, closeChangePassword, changePassword,
  // Categories
  addCategory, deleteCategory, selectCategory,
  // Accounts
  saveAccount, loadAccount, delAccount, toggleFavorite,
  // Rendering
  renderAccounts, goToPage
})

// ── Init ──

initTheme()
