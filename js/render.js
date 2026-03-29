/* All rendering: categories, accounts, pagination, dashboard */

import { state, PER_PAGE } from './state.js'
import { esc, timeAgo } from './ui.js'

// ── Categories ──

export function renderCategories() {
  const el = document.getElementById('categoryChips')
  el.innerHTML = ''
  Object.entries(state.vaultData.categories).forEach(([name, cat]) => {
    const active = state.currentCategory === name ? 'active' : ''
    const count = cat.accounts.length
    el.innerHTML += `
      <div class="category-chip ${active}" onclick="selectCategory('${esc(name)}')">
        <span class="color-dot" style="background:${cat.color}"></span>
        <span>${esc(name)}</span>
        <span class="chip-count">${count}</span>
        <span class="chip-delete" onclick="event.stopPropagation();deleteCategory('${esc(name)}')" title="Delete category">&times;</span>
      </div>`
  })
}

// ── Accounts ──

export function renderAccounts() {
  const c = state.currentCategory
  const catTitle = document.getElementById('catTitle')
  const accountList = document.getElementById('accountList')
  const pagination = document.getElementById('pagination')

  catTitle.textContent = c || 'No category selected'
  if (!c || !state.vaultData.categories[c]) {
    accountList.innerHTML = ''
    pagination.innerHTML = ''
    return
  }

  const q = document.getElementById('search').value.toLowerCase()
  let list = state.vaultData.categories[c].accounts
    .map((a, i) => ({ ...a, _idx: i }))
    .filter(a => a.name.toLowerCase().includes(q) || (a.user && a.user.toLowerCase().includes(q)))

  // Favorites first
  list.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))

  const start = (state.page - 1) * PER_PAGE
  const items = list.slice(start, start + PER_PAGE)

  accountList.innerHTML = ''
  items.forEach(a => {
    const idx = a._idx
    const isActive = state.currentCategory === c && state.selectedIndex === idx
    const starClass = a.favorite ? 'active' : ''
    const ts = a.lastModified ? timeAgo(a.lastModified) : ''

    accountList.innerHTML += `
      <div class="list-item ${isActive ? 'active' : ''}" onclick="loadAccount('${esc(c)}',${idx})">
        <div class="item-left">
          <span class="item-star ${starClass}" onclick="event.stopPropagation();toggleFavorite('${esc(c)}',${idx})" title="Toggle favorite">★</span>
          <div class="item-info">
            <strong>${esc(a.name || 'Untitled')}</strong>
            <small>${esc(a.user || '')}</small>
            ${ts ? `<small class="timestamp">${ts}</small>` : ''}
          </div>
        </div>
        <div class="item-actions">
          <button class="action-btn" onclick="event.stopPropagation();quickCopy('${esc(c)}',${idx},'user')" title="Copy username">
            <svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="action-btn" onclick="event.stopPropagation();quickCopy('${esc(c)}',${idx},'pass')" title="Copy password">
            <svg viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          </button>
          <button class="action-btn del" onclick="event.stopPropagation();delAccount('${esc(c)}',${idx})" title="Delete">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>`
  })

  renderPagination(list.length)
}

// ── Pagination ──

function renderPagination(total) {
  const el = document.getElementById('pagination')
  el.innerHTML = ''
  const pages = Math.ceil(total / PER_PAGE)
  if (pages <= 1) return
  for (let i = 1; i <= pages; i++) {
    el.innerHTML += `<button class="page-btn ${state.page === i ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`
  }
}

export function goToPage(p) {
  state.page = p
  renderAccounts()
}

// ── Dashboard ──

export function updateDashboard() {
  const cats = Object.keys(state.vaultData.categories).length
  let accs = 0
  for (const c in state.vaultData.categories) accs += state.vaultData.categories[c].accounts.length
  document.getElementById('statCats').textContent = cats
  document.getElementById('statAccs').textContent = accs
  document.getElementById('statSaved').textContent = state.lastSavedTime ? timeAgo(state.lastSavedTime) : '–'
}
