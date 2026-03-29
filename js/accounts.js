/* Account CRUD operations */

import { state } from './state.js'
import { showToast } from './toast.js'
import { togglePassword, clearForm } from './ui.js'
import { saveVault } from './storage.js'
import { renderCategories, renderAccounts, updateDashboard } from './render.js'

/** Safely access accounts array from either old or new format */
function getAccounts(c) {
  const cat = state.vaultData.categories[c]
  if (Array.isArray(cat)) return cat
  return cat?.accounts || []
}

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

  const accounts = getAccounts(c)
  if (state.selectedIndex === null) {
    accounts.push(data)
    showToast('Account saved', 'success')
  } else {
    accounts[state.selectedIndex] = data
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
  const a = getAccounts(c)[i]
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
  getAccounts(c).splice(i, 1)
  clearForm()
  renderCategories()
  renderAccounts()
  updateDashboard()
  saveVault()
  showToast('Account deleted', 'success')
}

export function toggleFavorite(c, i) {
  const accounts = getAccounts(c)
  accounts[i].favorite = !accounts[i].favorite
  renderAccounts()
  saveVault()
}
