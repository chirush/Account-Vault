/* Dark / Light theme toggle */

function updateThemeIcon(theme) {
  document.getElementById('iconSun').style.display = theme === 'dark' ? 'block' : 'none'
  document.getElementById('iconMoon').style.display = theme === 'light' ? 'block' : 'none'
}

export function initTheme() {
  const saved = localStorage.getItem('vault-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', saved)
  updateThemeIcon(saved)
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('vault-theme', next)
  updateThemeIcon(next)
}
