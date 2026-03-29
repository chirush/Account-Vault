/* Account CRUD operations */

import { state } from './state.js'
import { showToast } from './toast.js'
import { togglePassword, clearForm } from './ui.js'
import { saveVault } from './storage.js'
import { renderCategories, renderAccounts, updateDashboard } from './render.js'

export function saveAccount() {
  const c = state.currentCategory
  if (!c) return showToast('Select a category first', 'warning')

  const data = {
    name: document.getElementById('accName').value,
    user: document.getElementById('accUser').value,
    pass: document.getElementById('accPass').value,
    notes: document.getElementById('accNotes').value,
    favorite: document.getElementById('accFavorite').checked,
    lastModified: Date.now()
  }

  if (state.selectedIndex === null) {
    state.vaultData.categories[c].accounts.push(data)
    showToast('Account saved', 'success')
  } else {
    state.vaultData.categories[c].accounts[state.selectedIndex] = data
    showToast('Account updated', 'success')
  }

  clearForm()
  renderCategories()
  renderAccounts()
  updateDashboard()
  saveVault()
}

export function loadAccount(c, i) {
  state.currentCategory = c
  state.selectedIndex = i
  const a = state.vaultData.categories[c].accounts[i]
  document.getElementById('accName').value = a.name
  document.getElementById('accUser').value = a.user
  document.getElementById('accPass').value = a.pass
  document.getElementById('accNotes').value = a.notes || ''
  document.getElementById('accFavorite').checked = a.favorite || false
  togglePassword(true)
  renderCategories()
  renderAccounts()
}

export function delAccount(c, i) {
  if (!confirm('Delete this account?')) return
  state.vaultData.categories[c].accounts.splice(i, 1)
  clearForm()
  renderCategories()
  renderAccounts()
  updateDashboard()
  saveVault()
  showToast('Account deleted', 'success')
}

export function toggleFavorite(c, i) {
  state.vaultData.categories[c].accounts[i].favorite = !state.vaultData.categories[c].accounts[i].favorite
  renderAccounts()
  saveVault()
}
