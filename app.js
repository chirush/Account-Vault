let vaultData = { categories: {} }
let key = null
let page = 1
let selectedIndex = null
let passwordHidden = false
let selectedCategory = null
let currentCategory = null

const PER_PAGE = 5
const SALT = new TextEncoder().encode('vault-salt')

function toggle(el) {
  const body = el.nextElementSibling
  body.classList.toggle('collapsed')
  el.querySelector('.toggle').textContent =
    body.classList.contains('collapsed') ? '▼' : '▲'
}

function copyValue(id) {
  const el = document.getElementById(id)
  if (el.value) navigator.clipboard.writeText(el.value)
}

function updateEye() {
  eyeShow.style.display = passwordHidden ? 'none' : 'block'
  eyeHide.style.display = passwordHidden ? 'block' : 'none'
}

function togglePassword(force) {
  passwordHidden = force !== undefined ? force : !passwordHidden
  accPass.type = passwordHidden ? 'password' : 'text'
  updateEye()
}

async function deriveKey(password) {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function unlock() {
  if (!master.value) return alert('Enter master password')

  key = await deriveKey(master.value)
  const saved = localStorage.getItem('vault')

  if (saved) {
    try {
      const { iv, data } = JSON.parse(saved)
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      )
      vaultData = JSON.parse(new TextDecoder().decode(decrypted))
    } catch {
      key = null
      return alert('Wrong password')
    }
  }

  vault.classList.remove('hidden')
  renderCategories()
}

function addCategory() {
  const n = newCategory.value.trim()
  if (!n || vaultData.categories[n]) return

  vaultData.categories[n] = []
  newCategory.value = ''
  renderCategories()
  saveVault()
}

function renderCategories() {
  categorySelect.innerHTML =
    '<option value="" disabled selected>Select category</option>'

  Object.keys(vaultData.categories).forEach(c => {
    categorySelect.innerHTML += `<option>${c}</option>`
  })
}

function saveAccount() {
  const c = categorySelect.value
  if (!c) return alert('Select category')

  const data = {
    name: accName.value,
    user: accUser.value,
    pass: accPass.value,
    notes: accNotes.value
  }

  if (selectedIndex === null) {
    vaultData.categories[c].push(data)
  } else {
    vaultData.categories[c][selectedIndex] = data
  }

  clearForm()
  renderAccounts()
  saveVault()
}

function clearForm() {
  accName.value = ''
  accUser.value = ''
  accPass.value = ''
  accNotes.value = ''
  selectedIndex = null
  togglePassword(false)
}

function loadAccount(c, i) {
  selectedCategory = c
  selectedIndex = i

  const a = vaultData.categories[c][i]
  accName.value = a.name
  accUser.value = a.user
  accPass.value = a.pass
  accNotes.value = a.notes

  togglePassword(true)
  renderAccounts()
}


function delAccount(c, i) {
  if (!confirm('Delete this account?')) return
  vaultData.categories[c].splice(i, 1)
  clearForm()
  renderAccounts()
  saveVault()
}

function renderAccounts() {
  const c = categorySelect.value

  if (c !== currentCategory) {
    clearForm()
    selectedIndex = null
    currentCategory = c
  }

  catTitle.textContent = c || 'No category selected'
  if (!c) return

  const q = search.value.toLowerCase()
  const list = vaultData.categories[c].filter(a =>
    a.name.toLowerCase().includes(q)
  )

  const start = (page - 1) * PER_PAGE
  const items = list.slice(start, start + PER_PAGE)

  accountList.innerHTML = ''

  items.forEach((a, i) => {
    const idx = start + i
    accountList.innerHTML += `
      <div class="list-item ${selectedCategory === c && selectedIndex === idx ? 'active' : ''}"
           onclick="loadAccount('${c}', ${idx})">
        <div>
          <strong>${a.name}</strong><br>
          <small>${a.user || ''}</small>
        </div>
        <div class="delete"
             onclick="event.stopPropagation();delAccount('${c}', ${idx})">
          x
        </div>
      </div>
    `
  })

  renderPagination(list.length)
}

function renderPagination(total) {
  pagination.innerHTML = ''
  const pages = Math.ceil(total / PER_PAGE)

  for (let i = 1; i <= pages; i++) {
    pagination.innerHTML +=
      `<button onclick="page=${i};renderAccounts()">${i}</button>`
  }
}

async function saveVault() {
  if (!key) return

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = new TextEncoder().encode(JSON.stringify(vaultData))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  localStorage.setItem(
    'vault',
    JSON.stringify({
      iv: [...iv],
      data: [...new Uint8Array(encrypted)]
    })
  )
}

function exportVault() {
  const d = localStorage.getItem('vault')
  if (!d) return alert('Nothing to export')

  const b = new Blob([d], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(b)
  a.download = 'vault.json'
  a.click()
}

function importVault(e) {
  const r = new FileReader()
  r.onload = () => localStorage.setItem('vault', r.result)
  r.readAsText(e.target.files[0])
}

function onCategoryChange() {
  selectedCategory = null
  selectedIndex = null
  page = 1
  clearForm()
  renderAccounts()
}
