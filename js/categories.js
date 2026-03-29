/* Category CRUD operations */

import { state, CAT_COLORS } from './state.js'
import { showToast } from './toast.js'
import { clearForm } from './ui.js'
import { saveVault } from './storage.js'
import { renderCategories, renderAccounts, updateDashboard } from './render.js'

export function addCategory() {
  const inp = document.getElementById('newCategory')
  const n = inp.value.trim()
  if (!n) return
  if (state.vaultData.categories[n]) return showToast('Category already exists', 'warning')

  const usedColors = Object.values(state.vaultData.categories).map(c => c.color)
  const available = CAT_COLORS.filter(c => !usedColors.includes(c))
  const color = available.length > 0
    ? available[0]
    : CAT_COLORS[Object.keys(state.vaultData.categories).length % CAT_COLORS.length]

  state.vaultData.categories[n] = { color, accounts: [] }
  inp.value = ''
  renderCategories()
  updateDashboard()
  saveVault()
  showToast(`Category "${n}" added`, 'success')
}

export function deleteCategory(name) {
  const count = state.vaultData.categories[name].accounts.length
  const msg = count > 0
    ? `Delete "${name}" and its ${count} account(s)?`
    : `Delete empty category "${name}"?`
  if (!confirm(msg)) return

  delete state.vaultData.categories[name]
  if (state.currentCategory === name) {
    state.currentCategory = null
    clearForm()
  }
  renderCategories()
  renderAccounts()
  updateDashboard()
  saveVault()
  showToast(`Category "${name}" deleted`, 'success')
}

export function selectCategory(name) {
  if (state.currentCategory === name) return
  state.currentCategory = name
  state.selectedIndex = null
  state.page = 1
  clearForm()
  renderCategories()
  renderAccounts()
}
