let selectedMood = null;
let selectedColor = null;

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const STORAGE_KEY = 'rasa_entries';

/* ===== STORAGE ===== */
function getEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

/* ===== INTERACTIONS ===== */
function selectMood(btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMood = btn.dataset.mood;
  selectedColor = btn.dataset.color;
}

function toggleTag(chip) {
  chip.classList.toggle('selected');
}

function updateSlider(input) {
  const val = input.value;
  document.getElementById('slider-val').textContent = val;
  const pct = ((val - 1) / 9 * 100).toFixed(0) + '%';
  input.style.setProperty('--val', pct);
}

/* ===== SAVE ===== */
function saveEntry() {
  if (!selectedMood) {
    showToast('Pilih mood dulu ya!');
    return;
  }

  const note = document.getElementById('note-area').value.trim();
  const energy = document.getElementById('energy-slider').value;
  const tags = [...document.querySelectorAll('.tag-chip.selected')].map(t => t.textContent);

  const entries = getEntries();
  const today = getToday();
  const existing = entries.findIndex(e => e.date === today);

  const entry = {
    date: today,
    mood: selectedMood,
    color: selectedColor,
    note: note || null,
    energy: parseInt(energy),
    tags,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  if (existing >= 0) entries[existing] = entry;
  else entries.unshift(entry);

  saveEntries(entries);
  showToast('Mood tersimpan ✦');
  renderAll();
  resetForm();
}

function resetForm() {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tag-chip').forEach(t => t.classList.remove('selected'));
  document.getElementById('note-area').value = '';
  document.getElementById('energy-slider').value = 6;
  document.getElementById('slider-val').textContent = '6';
  document.getElementById('energy-slider').style.setProperty('--val', '56%');
  selectedMood = null;
  selectedColor = null;
}

/* ===== TOAST ===== */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ===== RENDER WEEK GRID ===== */
function renderWeekGrid() {
  const grid = document.getElementById('week-grid');
  const entries = getEntries();
  const today = new Date();
  grid.innerHTML = '';

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    const isToday = i === 0;

    const cell = document.createElement('div');
    cell.className = 'day-cell' + (entry ? ' has-mood' : '');
    if (entry) cell.style.setProperty('--mood-color', entry.color);

    cell.innerHTML = `
      <div class="day-name">${DAYS[d.getDay()]}</div>
      <div class="day-num" style="${isToday ? 'color:var(--accent)' : ''}">${d.getDate()}</div>
      <div class="day-dot"></div>
    `;
    grid.appendChild(cell);
  }
}

/* ===== RENDER ENTRIES ===== */
function renderEntries() {
  const list = document.getElementById('entries-list');
  const entries = getEntries().slice(0, 5);

  if (!entries.length) {
    list.innerHTML = `<div class="empty-state"><p>"Belum ada catatan. Mulai hari ini."</p></div>`;
    return;
  }

  list.innerHTML = entries.map((e, i) => `
    <div class="entry-card" style="animation-delay:${i * 0.06}s">
      <div class="entry-dot" style="--mood-color:${e.color}; background:${e.color}"></div>
      <div>
        <div class="entry-text">${e.note || e.mood}</div>
        <div class="entry-meta">
          <span class="entry-tag">${e.mood}</span>
          ${e.tags.map(t => `<span class="entry-tag">${t}</span>`).join('')}
          <span class="entry-tag">⚡ ${e.energy}/10</span>
        </div>
      </div>
      <div class="entry-energy">${formatDate(e.date)}</div>
    </div>
  `).join('');
}

/* ===== HELPERS ===== */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function renderAll() {
  renderWeekGrid();
  renderEntries();
}

/* ===== INIT ===== */
document.getElementById('nav-date').textContent = new Date().toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

document.getElementById('energy-slider').style.setProperty('--val', '56%');

renderAll();
