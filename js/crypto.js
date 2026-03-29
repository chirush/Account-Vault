/* AES-256-GCM key derivation and vault data migration */

import { SALT, CAT_COLORS } from './state.js'

export async function deriveKey(password) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: 100000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Converts old vault format (arrays) to new format (objects with color/timestamps) */
export function migrateVaultData(data) {
  let ci = 0
  for (const cat in data.categories) {
    if (Array.isArray(data.categories[cat])) {
      data.categories[cat] = {
        color: CAT_COLORS[ci % CAT_COLORS.length],
        accounts: data.categories[cat].map(a => ({
          ...a,
          favorite: a.favorite || false,
          lastModified: a.lastModified || Date.now()
        }))
      }
      ci++
    } else {
      if (!data.categories[cat].color) {
        data.categories[cat].color = CAT_COLORS[ci % CAT_COLORS.length]
      }
      data.categories[cat].accounts = (data.categories[cat].accounts || []).map(a => ({
        ...a,
        favorite: a.favorite || false,
        lastModified: a.lastModified || Date.now()
      }))
      ci++
    }
  }
  return data
}
