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
const menuList = document.getElementById('menu-list');
const shoppingList = document.getElementById('shopping-list');

const todayCount = document.getElementById('today-count');
const menuCount = document.getElementById('menu-count');
const shoppingCount = document.getElementById('shopping-count');

const addEventButton = document.getElementById('add-event');
const addMenuButton = document.getElementById('add-menu-item');
const addItemButton = document.getElementById('add-item');

const calendarMonthName = document.getElementById('calendar-month-name');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const monthGrid = document.getElementById('month-grid');
const calendarDate = new Date();

// ───── Storage ─────
const STORAGE = {
  events: JSON.parse(localStorage.getItem('familywall-events') || '[]'),
  menus: JSON.parse(localStorage.getItem('familywall-menus') || '[]'),
  shopping: JSON.parse(localStorage.getItem('familywall-shopping') || '[]'),
};

// Seed inicial si todo vacío
if (!STORAGE.events.length && !STORAGE.menus.length && !STORAGE.shopping.length) {
  const today = new Date().toISOString().slice(0, 10);
  STORAGE.events = [
    { title: 'Reunión colegio Lucía', date: today, time: '17:30', category: 'Escuela' },
    { title: 'Fútbol Mateo', date: today, time: '18:00', category: 'Actividad' },
    { title: 'Dentista', date: today, time: '11:00', category: 'Cita' },
  ];
  STORAGE.menus = [
    { title: 'Pizza casera', day: 'Miércoles', note: 'Toca a papá amasar' },
    { title: 'Boloñesa', day: 'Martes', note: 'Doble ración para el lunes' },
    { title: 'Tacos de pollo', day: 'Viernes', note: 'Con guacamole' },
  ];
  STORAGE.shopping = [
    { name: 'Pan integral', quantity: 'x2', checked: true },
    { name: 'Leche', quantity: 'x3', checked: true },
    { name: 'Manzanas', quantity: '1 kg', checked: false },
    { name: 'Yogur natural', quantity: 'x6', checked: false },
    { name: 'Aguacate', quantity: 'x1 (uno)', checked: false },
  ];
  saveState();
}

const categoryStyles = {
  Cita: 'tag-blue',
  Escuela: 'tag-green',
  Actividad: 'tag-orange',
  Otro: 'tag-purple',
};
const categoryIcons = {
  Cita: '📅',
  Escuela: '🎒',
  Actividad: '⚽',
  Otro: '⭐',
};

// ───── Tabs ─────
function switchTab(tabId) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.id === tabId));
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
  if (history.replaceState) history.replaceState(null, '', `#${tabId}`);
}
tabButtons.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

// Hash inicial
const initialTab = (location.hash || '#calendar').slice(1);
if (['calendar', 'menu', 'shopping'].includes(initialTab)) switchTab(initialTab);

// ───── Calendar nav ─────
prevMonthBtn.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendarMonth(); });
nextMonthBtn.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendarMonth(); });

// ───── Modal ─────
closeModalButton.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

function saveState() {
  localStorage.setItem('familywall-events', JSON.stringify(STORAGE.events));
  localStorage.setItem('familywall-menus', JSON.stringify(STORAGE.menus));
  localStorage.setItem('familywall-shopping', JSON.stringify(STORAGE.shopping));
}

function renderCounts() {
  const today = new Date().toISOString().slice(0, 10);
  todayCount.textContent = STORAGE.events.filter(e => e.date === today).length;
  menuCount.textContent = STORAGE.menus.length;
  shoppingCount.textContent = STORAGE.shopping.filter(i => !i.checked).length;
}

function renderEvents() {
  const today = new Date().toISOString().slice(0, 10);
  if (!STORAGE.events.length) {
    eventList.innerHTML = '<p class="empty-msg">Aún no hay eventos. Añade el primero.</p>';
    return;
  }
  // Ordena por fecha
  const sorted = [...STORAGE.events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  eventList.innerHTML = sorted.map((event, idx) => {
    const colorClass = categoryStyles[event.category] || 'tag-blue';
    const icon = categoryIcons[event.category] || '⭐';
    const isToday = event.date === today;
    const realIndex = STORAGE.events.indexOf(event);
    return `
      <div class="event-card${isToday ? ' today-event' : ''}">
        <div class="event-meta">
          <span class="event-icon">${icon}</span>
          <div>
            <strong>${escapeHtml(event.title)}</strong>
            <p>${event.date} · ${event.time}</p>
          </div>
        </div>
        <div class="event-right">
          <span class="event-badge ${colorClass}">${event.category}</span>
          ${isToday ? '<span class="today-chip">Hoy</span>' : ''}
          <button class="icon-btn icon-btn--danger" data-del-event="${realIndex}" aria-label="Eliminar">🗑</button>
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

function renderMenus() {
  if (!STORAGE.menus.length) {
    menuList.innerHTML = '<p class="empty-msg">No hay platos. Planifica la semana.</p>';
    return;
  }
  menuList.innerHTML = STORAGE.menus.map((menu, idx) => `
    <div class="menu-card">
      <div class="event-meta">
        <span class="event-icon" style="background: var(--orange-soft)">🍽️</span>
        <div>
          <strong>${escapeHtml(menu.title)}</strong>
          <p>${escapeHtml(menu.note || '')}</p>
        </div>
      </div>
      <div class="event-right">
        <span class="day-chip">${escapeHtml(menu.day)}</span>
        <button class="icon-btn icon-btn--danger" data-del-menu="${idx}" aria-label="Eliminar">🗑</button>
      </div>
    </div>`).join('');

  menuList.querySelectorAll('[data-del-menu]').forEach(b => {
    b.addEventListener('click', () => {
      STORAGE.menus.splice(Number(b.dataset.delMenu), 1);
      saveState(); renderAll();
    });
  });
}

function renderShopping() {
  if (!STORAGE.shopping.length) {
    shoppingList.innerHTML = '<p class="empty-msg">La lista está vacía. Empieza añadiendo productos.</p>';
    return;
  }
  shoppingList.innerHTML = STORAGE.shopping.map((item, idx) => `
    <div class="shopping-item">
      <label>
        <input type="checkbox" data-index="${idx}" ${item.checked ? 'checked' : ''}>
        <div style="flex:1">
          <strong>${escapeHtml(item.name)}</strong>
          <p>${escapeHtml(item.quantity)}</p>
        </div>
        <button class="icon-btn icon-btn--danger" data-del-shop="${idx}" aria-label="Eliminar">🗑</button>
      </label>
    </div>`).join('');

  shoppingList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      STORAGE.shopping[Number(cb.dataset.index)].checked = cb.checked;
      saveState(); renderCounts();
    });
  });
  shoppingList.querySelectorAll('[data-del-shop]').forEach(b => {
    b.addEventListener('click', e => {
      e.preventDefault();
      STORAGE.shopping.splice(Number(b.dataset.delShop), 1);
      saveState(); renderAll();
    });
  });
}

function renderCalendarMonth() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  calendarMonthName.textContent = calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  monthGrid.innerHTML = '';

  ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(d => {
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

// ───── Modal forms ─────
function openForm(type) {
  let html = '';
  if (type === 'event') {
    html = `
      <h3>Nuevo evento</h3>
      <form id="form-event">
        <label><span>Título</span><input type="text" name="title" placeholder="Reunión, partido, cumple…" required></label>
        <div class="form-row">
          <label><span>Fecha</span><input type="date" name="date" required></label>
          <label><span>Hora</span><input type="time" name="time" required></label>
        </div>
        <label><span>Categoría</span>
          <select name="category" required>
            <option>Cita</option><option>Escuela</option><option>Actividad</option><option>Otro</option>
          </select>
        </label>
        <div class="form-actions">
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
            <option>Lunes</option><option>Martes</option><option>Miércoles</option><option>Jueves</option><option>Viernes</option><option>Sábado</option><option>Domingo</option>
          </select>
        </label>
        <label><span>Notas</span><textarea name="note" rows="2" placeholder="Truco de la abuela, ingredientes especiales…"></textarea></label>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar plato</button>
        </div>
      </form>`;
  } else {
    html = `
      <h3>Nuevo artículo</h3>
      <form id="form-shopping">
        <label><span>Artículo</span><input type="text" name="name" placeholder="Aguacate (uno solo)" required></label>
        <label><span>Cantidad / nota</span><input type="text" name="quantity" placeholder="x1, 1 kg, sin lactosa…" required></label>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Guardar artículo</button>
        </div>
      </form>`;
  }
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');

  const form = modalContent.querySelector('form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (type === 'event') STORAGE.events.push(data);
    if (type === 'menu')  STORAGE.menus.push({ ...data, note: data.note || 'Planificación familiar' });
    if (type === 'shopping') STORAGE.shopping.push({ ...data, checked: false });
    saveState();
    renderAll();
    modal.classList.add('hidden');
  });
}

addEventButton.addEventListener('click', () => openForm('event'));
addMenuButton.addEventListener('click', () => openForm('menu'));
addItemButton.addEventListener('click', () => openForm('shopping'));

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderAll() {
  renderCounts();
  renderCalendarMonth();
  renderEvents();
  renderMenus();
  renderShopping();
}

renderAll();
