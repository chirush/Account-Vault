/* Shared application state and constants */

export const state = {
  vaultData: { categories: {} },
  key: null,
  page: 1,
  selectedIndex: null,
  passwordHidden: false,
  currentCategory: null,
  autoLockTimer: null,
  lastSavedTime: null
}

export const PER_PAGE = 5
export const SALT = new TextEncoder().encode('vault-salt')
export const AUTO_LOCK_MS = 5 * 60 * 1000 // 5 minutes

export const CAT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#f97316', '#ef4444', '#14b8a6'
]
