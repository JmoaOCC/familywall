// ───── Menu toggle (móvil) ─────
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));
}

// ───── Refs ─────
const tabs = document.querySelectorAll('.tab-panel');
const tabButtons = document.querySelectorAll('.app-tab');

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModalButton = document.getElementById('close-modal');

const eventList = document.getElementById('event-list');
const weekGrid = document.getElementById('week-grid');
const shoppingPending = document.getElementById('shopping-pending');
const shoppingDone = document.getElementById('shopping-done');
const shoppingSummary = document.getElementById('shopping-summary');
const pendingCount = document.getElementById('pending-count');
const doneCount = document.getElementById('done-count');

const todayCount = document.getElementById('today-count');
const menuCount = document.getElementById('menu-count');
const shoppingCountEl = document.getElementById('shopping-count');

const greeting = document.getElementById('greeting');
const todayLine = document.getElementById('today-line');

const addEventButton = document.getElementById('add-event');
const addMenuButton = document.getElementById('add-menu-item');

const calendarMonthName = document.getElementById('calendar-month-name');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const monthGrid = document.getElementById('month-grid');
const calendarDate = new Date();

const quickAddForm = document.getElementById('quick-add-form');
const quickAddInput = document.getElementById('quick-add-input');
const quickAddQty = document.getElementById('quick-add-qty');

// ───── Storage ─────
const STORAGE = {
  events: JSON.parse(localStorage.getItem('familyflower-events') || localStorage.getItem('familywall-events') || '[]'),
  menus: JSON.parse(localStorage.getItem('familyflower-menus') || localStorage.getItem('familywall-menus') || '[]'),
  shopping: JSON.parse(localStorage.getItem('familyflower-shopping') || localStorage.getItem('familywall-shopping') || '[]'),
};

if (!STORAGE.events.length && !STORAGE.menus.length && !STORAGE.shopping.length) {
  const today = new Date().toISOString().slice(0, 10);
  STORAGE.events = [
    { title: 'Reunión colegio Lucía', date: today, time: '17:30', category: 'Escuela' },
    { title: 'Fútbol Mateo',          date: today, time: '18:00', category: 'Actividad' },
    { title: 'Dentista',              date: today, time: '11:00', category: 'Cita' },
  ];
  STORAGE.menus = [
    { title: 'Pizza casera',     day: 'Miércoles', note: 'Toca a papá amasar' },
    { title: 'Boloñesa',         day: 'Martes',    note: 'Doble ración para el lunes' },
    { title: 'Tacos de pollo',   day: 'Viernes',   note: 'Con guacamole' },
    { title: 'Crema de verduras',day: 'Lunes',     note: 'Si sobra, congelar' },
  ];
  STORAGE.shopping = [
    { name: 'Pan integral',  quantity: 'x2',         checked: true },
    { name: 'Leche',         quantity: 'x3',         checked: true },
    { name: 'Manzanas',      quantity: '1 kg',       checked: false },
    { name: 'Yogur natural', quantity: 'x6',         checked: false },
    { name: 'Aguacate',      quantity: 'x1 (uno)',   checked: false },
  ];
  saveState();
}

const categoryStyles = { Cita: 'tag-blue', Escuela: 'tag-green', Actividad: 'tag-orange', Otro: 'tag-purple' };
const categoryIcons  = { Cita: '📅', Escuela: '🎒', Actividad: '⚽', Otro: '⭐' };
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// ───── Tabs ─────
function switchTab(tabId) {
  tabs.forEach(t => t.classList.toggle('active', t.id === tabId));
  tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  if (history.replaceState) history.replaceState(null, '', `#${tabId}`);
}
tabButtons.forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
const initialTab = (location.hash || '#calendar').slice(1);
if (['calendar', 'menu', 'shopping'].includes(initialTab)) switchTab(initialTab);

// ───── Calendar nav ─────
prevMonthBtn.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendarMonth(); });
nextMonthBtn.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendarMonth(); });

// ───── Modal ─────
closeModalButton.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) modal.classList.add('hidden');
});

function saveState() {
  localStorage.setItem('familyflower-events',   JSON.stringify(STORAGE.events));
  localStorage.setItem('familyflower-menus',    JSON.stringify(STORAGE.menus));
  localStorage.setItem('familyflower-shopping', JSON.stringify(STORAGE.shopping));
}

// ───── Saludo dinámico ─────
function renderGreeting() {
  const h = new Date().getHours();
  const hi = h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  const emoji = h < 6 ? '🌙' : h < 13 ? '☀️' : h < 21 ? '👋' : '🌙';
  greeting.textContent = `${hi}, familia ${emoji}`;

  const today = new Date().toISOString().slice(0, 10);
  const todays = STORAGE.events.filter(e => e.date === today).length;
  const pend = STORAGE.shopping.filter(i => !i.checked).length;
  if (todays === 0 && pend === 0) {
    todayLine.textContent = 'Día tranquilo: nada en la agenda y la lista al día. Disfrutadlo.';
  } else if (todays === 0) {
    todayLine.textContent = `Hoy sin eventos. Faltan ${pend} cosas en la lista de la compra.`;
  } else {
    todayLine.textContent = `Tenéis ${todays} ${todays === 1 ? 'evento' : 'eventos'} hoy y ${pend} ${pend === 1 ? 'cosa' : 'cosas'} pendientes en la compra.`;
  }
}

function renderCounts() {
  const today = new Date().toISOString().slice(0, 10);
  todayCount.textContent = STORAGE.events.filter(e => e.date === today).length;
  menuCount.textContent = STORAGE.menus.length;
  shoppingCountEl.textContent = STORAGE.shopping.filter(i => !i.checked).length;
}

// ───── Eventos (panel lateral) ─────
function renderEvents() {
  if (!STORAGE.events.length) {
    eventList.innerHTML = '<p class="empty-msg">Aún no hay eventos. Pulsa "+ Añadir" para crear el primero.</p>';
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...STORAGE.events]
    .map((e, i) => ({ ...e, _i: i }))
    .filter(e => e.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8);

  // si no hay próximos, fallback a los más recientes
  const list = sorted.length ? sorted : [...STORAGE.events]
    .map((e, i) => ({ ...e, _i: i }))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 6);

  eventList.innerHTML = list.map(event => {
    const colorClass = categoryStyles[event.category] || 'tag-blue';
    const icon = categoryIcons[event.category] || '⭐';
    const isToday = event.date === today;
    return `
      <div class="event-card${isToday ? ' today-event' : ''}">
        <div class="event-meta">
          <span class="event-icon">${icon}</span>
          <div>
            <strong>${escapeHtml(event.title)}</strong>
            <p>${formatDate(event.date)} · ${event.time}</p>
          </div>
        </div>
        <div class="event-right">
          <span class="event-badge ${colorClass}">${event.category}</span>
          ${isToday ? '<span class="today-chip">Hoy</span>' : ''}
          <button class="icon-btn icon-btn--danger" data-del-event="${event._i}" aria-label="Eliminar">🗑</button>
        </div>
      </div>`;
  }).join('');

  eventList.querySelectorAll('[data-del-event]').forEach(b => {
    b.addEventListener('click', () => {
      STORAGE.events.splice(Number(b.dataset.delEvent), 1);
      saveState(); renderAll();
    });
  });
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.getTime() === today.getTime()) return 'Hoy';
  if (d.getTime() === tomorrow.getTime()) return 'Mañana';
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ───── Menú: grid semanal ─────
function renderMenus() {
  const todayIdx = (new Date().getDay() + 6) % 7;
  weekGrid.innerHTML = DAYS.map((day, idx) => {
    const dishes = STORAGE.menus
      .map((m, i) => ({ ...m, _i: i }))
      .filter(m => m.day === day);
    const dishesHTML = dishes.length
      ? dishes.map(d => `
          <div class="dish-card">
            <strong>${escapeHtml(d.title)}</strong>
            ${d.note ? `<small>${escapeHtml(d.note)}</small>` : ''}
            <button class="dish-del" data-del-menu="${d._i}" aria-label="Eliminar">×</button>
          </div>`).join('')
      : '<p class="day-col-empty">— sin plato —</p>';
    return `
      <div class="day-col${idx === todayIdx ? ' is-today' : ''}">
        <div class="day-col-head">
          <span class="dow">${DAYS_SHORT[idx]}</span>
          <span class="dom">${day}</span>
        </div>
        ${dishesHTML}
      </div>`;
  }).join('');

  weekGrid.querySelectorAll('[data-del-menu]').forEach(b => {
    b.addEventListener('click', () => {
      STORAGE.menus.splice(Number(b.dataset.delMenu), 1);
      saveState(); renderAll();
    });
  });
}

// ───── Compra: pendientes / comprados ─────
function renderShopping() {
  const pending = STORAGE.shopping.map((it, i) => ({ ...it, _i: i })).filter(it => !it.checked);
  const done    = STORAGE.shopping.map((it, i) => ({ ...it, _i: i })).filter(it =>  it.checked);

  pendingCount.textContent = pending.length;
  doneCount.textContent = done.length;
  shoppingSummary.textContent = `${pending.length} ${pending.length === 1 ? 'pendiente' : 'pendientes'} · ${done.length} ${done.length === 1 ? 'comprado' : 'comprados'}`;

  shoppingPending.innerHTML = pending.length
    ? pending.map(rowHTML).join('')
    : '<p class="empty-msg">¡Bien hecho! No queda nada por comprar.</p>';
  shoppingDone.innerHTML = done.length
    ? done.map(rowHTML).join('')
    : '<p class="empty-msg">Aquí aparecerá lo que vayáis marcando.</p>';

  document.querySelectorAll('.shop-row input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      STORAGE.shopping[Number(cb.dataset.index)].checked = cb.checked;
      saveState(); renderAll();
    });
  });
  document.querySelectorAll('[data-del-shop]').forEach(b => {
    b.addEventListener('click', e => {
      e.preventDefault();
      STORAGE.shopping.splice(Number(b.dataset.delShop), 1);
      saveState(); renderAll();
    });
  });
}

function rowHTML(it) {
  return `
    <div class="shop-row${it.checked ? ' is-done' : ''}">
      <input type="checkbox" data-index="${it._i}" ${it.checked ? 'checked' : ''}>
      <span class="shop-name">${escapeHtml(it.name)}</span>
      <span class="shop-qty">${escapeHtml(it.quantity || '')}</span>
      <button class="icon-btn icon-btn--danger" data-del-shop="${it._i}" aria-label="Eliminar">🗑</button>
    </div>`;
}

// Quick add
quickAddForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = quickAddInput.value.trim();
  if (!name) return;
  STORAGE.shopping.push({ name, quantity: quickAddQty.value.trim() || 'x1', checked: false });
  quickAddInput.value = '';
  quickAddQty.value = '';
  saveState();
  renderAll();
  quickAddInput.focus();
});

// ───── Calendario: grid mensual ─────
function renderCalendarMonth() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  calendarMonthName.textContent = calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  monthGrid.innerHTML = '';

  DAYS_SHORT.forEach(d => {
    const h = document.createElement('div');
    h.className = 'day-header';
    h.textContent = d;
    monthGrid.appendChild(h);
  });

  const firstIndex = (firstDay + 6) % 7;
  for (let i = 0; i < firstIndex; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell inactive';
    monthGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = new Date(year, month, day).toISOString().slice(0, 10);
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (dateKey === today) cell.classList.add('today');

    const num = document.createElement('div');
    num.className = 'day-number';
    num.textContent = day;
    cell.appendChild(num);

    const dotsEl = document.createElement('div');
    dotsEl.className = 'day-events';
    const dayEvents = STORAGE.events.filter(e => e.date === dateKey);
    dayEvents.slice(0, 3).forEach(e => {
      const dot = document.createElement('span');
      dot.className = `event-dot ${categoryStyles[e.category] || 'tag-blue'}`;
      dotsEl.appendChild(dot);
    });
    if (dayEvents.length > 3) {
      const more = document.createElement('span');
      more.className = 'event-dot more-dot';
      dotsEl.appendChild(more);
    }
    cell.appendChild(dotsEl);
    monthGrid.appendChild(cell);
  }
}

// ───── Modales (alta) ─────
function openForm(type) {
  let html = '';
  if (type === 'event') {
    const today = new Date().toISOString().slice(0, 10);
    html = `
      <h3>Nuevo evento</h3>
      <form id="form-event">
        <label><span>Título</span><input type="text" name="title" placeholder="Reunión, partido, cumple…" required></label>
        <div class="form-row">
          <label><span>Fecha</span><input type="date" name="date" value="${today}" required></label>
          <label><span>Hora</span><input type="time" name="time" value="17:30" required></label>
        </div>
        <label><span>Categoría</span>
          <select name="category" required>
            <option>Cita</option><option>Escuela</option><option>Actividad</option><option>Otro</option>
          </select>
        </label>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" data-cancel>Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar evento</button>
        </div>
      </form>`;
  } else if (type === 'menu') {
    html = `
      <h3>Nuevo plato</h3>
      <form id="form-menu">
        <label><span>Plato</span><input type="text" name="title" placeholder="Pizza casera" required></label>
        <label><span>Día de la semana</span>
          <select name="day" required>
            ${DAYS.map(d => `<option>${d}</option>`).join('')}
          </select>
        </label>
        <label><span>Notas</span><textarea name="note" rows="2" placeholder="Truco de la abuela, ingredientes especiales…"></textarea></label>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" data-cancel>Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar plato</button>
        </div>
      </form>`;
  }
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');

  modalContent.querySelector('[data-cancel]').addEventListener('click', () => modal.classList.add('hidden'));

  const form = modalContent.querySelector('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (type === 'event') STORAGE.events.push(data);
    if (type === 'menu')  STORAGE.menus.push({ ...data, note: data.note || '' });
    saveState();
    renderAll();
    modal.classList.add('hidden');
  });
}

addEventButton.addEventListener('click', () => openForm('event'));
addMenuButton.addEventListener('click', () => openForm('menu'));

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderAll() {
  renderGreeting();
  renderCounts();
  renderCalendarMonth();
  renderEvents();
  renderMenus();
  renderShopping();
}

renderAll();
