const navButtons = document.querySelectorAll('.nav-button');
const tabs = document.querySelectorAll('.tab-panel');
const targetButtons = document.querySelectorAll('[data-target]');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModalButton = document.getElementById('close-modal');
const eventList = document.getElementById('event-list');
const menuList = document.getElementById('menu-list');
const shoppingList = document.getElementById('shopping-list');
const todayCount = document.getElementById('today-count');
const menuCount = document.getElementById('menu-count');
const shoppingCount = document.getElementById('shopping-count');
const openDashboardButton = document.getElementById('open-dashboard');
const addEventButton = document.getElementById('add-event');
const addMenuButton = document.getElementById('add-menu-item');
const addItemButton = document.getElementById('add-item');
const calendarMonthName = document.getElementById('calendar-month-name');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const monthGrid = document.getElementById('month-grid');
const calendarDate = new Date();

const STORAGE = {
  events: JSON.parse(localStorage.getItem('familyflow-events') || '[]'),
  menus: JSON.parse(localStorage.getItem('familyflow-menus') || '[]'),
  shopping: JSON.parse(localStorage.getItem('familyflow-shopping') || '[]'),
};

const colors = ['tag-blue', 'tag-green', 'tag-orange', 'tag-purple'];
const categoryStyles = {
  Cita: 'tag-blue',
  Escuela: 'tag-green',
  Actividad: 'tag-orange',
  Otro: 'tag-purple',
};
const categoryIcons = {
  Cita: '📅',
  Escuela: '🎒',
  Actividad: '🏃‍♀️',
  Otro: '⭐',
};

function switchTab(tabId) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.id === tabId));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
}

navButtons.forEach(button => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

targetButtons.forEach(button => {
  button.addEventListener('click', () => switchTab(button.dataset.target));
});

openDashboardButton.addEventListener('click', () => switchTab('dashboard'));

prevMonthBtn.addEventListener('click', () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendarMonth();
});

nextMonthBtn.addEventListener('click', () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendarMonth();
});

closeModalButton.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', event => {
  if (event.target === modal) modal.classList.add('hidden');
});

function saveState() {
  localStorage.setItem('familyflow-events', JSON.stringify(STORAGE.events));
  localStorage.setItem('familyflow-menus', JSON.stringify(STORAGE.menus));
  localStorage.setItem('familyflow-shopping', JSON.stringify(STORAGE.shopping));
}

function renderCounts() {
  const today = new Date().toISOString().slice(0, 10);
  todayCount.textContent = STORAGE.events.filter(event => event.date === today).length;
  menuCount.textContent = STORAGE.menus.length;
  shoppingCount.textContent = STORAGE.shopping.filter(item => !item.checked).length;
}

function renderEvents() {
  const today = new Date().toISOString().slice(0, 10);
  eventList.innerHTML = STORAGE.events.length
    ? STORAGE.events.map((event, index) => {
        const colorClass = categoryStyles[event.category] || colors[index % colors.length];
        const icon = categoryIcons[event.category] || '⭐';
        const isToday = event.date === today;
        return `
          <div class="event-card${isToday ? ' today-event' : ''}">
            <div class="event-meta">
              <span class="event-icon">${icon}</span>
              <div>
                <strong>${event.title}</strong>
                <p>${event.date} · ${event.time}</p>
              </div>
            </div>
            <div class="event-right">
              <span class="event-badge ${colorClass}">${event.category}</span>
              ${isToday ? '<span class="today-chip">Hoy</span>' : ''}
            </div>
          </div>`;
      }).join('')
    : '<p>Aún no hay eventos. Añade el primer evento familiar.</p>';
}

function renderMenus() {
  menuList.innerHTML = STORAGE.menus.length
    ? STORAGE.menus.map((menu, index) => `
          <div class="menu-card">
            <div>
              <strong>${menu.title}</strong>
              <p>${menu.note}</p>
            </div>
            <span>${menu.day}</span>
          </div>`
      ).join('')
    : '<p>No hay platos programados. Agrega un menú semanal.</p>';
}

function renderShopping() {
  shoppingList.innerHTML = STORAGE.shopping.length
    ? STORAGE.shopping.map((item, index) => `
          <div class="shopping-item">
            <label>
              <input type="checkbox" data-index="${index}" ${item.checked ? 'checked' : ''}>
              <div>
                <strong>${item.name}</strong>
                <p>${item.quantity}</p>
              </div>
            </label>
          </div>`
      ).join('')
    : '<p>La lista está vacía. Empieza añadiendo productos clave.</p>';

  shoppingList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const index = Number(checkbox.dataset.index);
      STORAGE.shopping[index].checked = checkbox.checked;
      saveState();
      renderCounts();
    });
  });
}

function getMonthName(date) {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

function renderCalendarMonth() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  calendarMonthName.textContent = getMonthName(calendarDate).replace(/\b\w/g, l => l.toUpperCase());
  monthGrid.innerHTML = '';

  const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  weekdays.forEach(day => {
    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = day;
    monthGrid.appendChild(header);
  });

  const firstIndex = (firstDay + 6) % 7;
  for (let i = 0; i < firstIndex; i += 1) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'day-cell inactive';
    monthGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = new Date(year, month, day).toISOString().slice(0, 10);
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';

    if (dateKey === today) {
      dayCell.classList.add('today');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    const eventDots = document.createElement('div');
    eventDots.className = 'day-events';
    const eventCount = STORAGE.events.filter(event => event.date === dateKey).length;

    const dayEvents = STORAGE.events.filter(event => event.date === dateKey);
    dayEvents.slice(0, 3).forEach(event => {
      const dotEl = document.createElement('span');
      dotEl.className = `event-dot ${categoryStyles[event.category] || 'tag-blue'}`;
      eventDots.appendChild(dotEl);
    });

    if (eventCount > 3) {
      const more = document.createElement('span');
      more.className = 'event-dot more-dot';
      eventDots.appendChild(more);
    }

    dayCell.appendChild(eventDots);
    monthGrid.appendChild(dayCell);
  }
}

function openForm(type) {
  let html = '';
  switch (type) {
    case 'event':
      html = `
        <h3>Nuevo evento</h3>
        <form id="event-form">
          <input type="text" name="title" placeholder="Título del evento" required>
          <div style="display:grid; gap:14px; grid-template-columns:1fr 1fr;">
            <input type="date" name="date" required>
            <input type="time" name="time" required>
          </div>
          <select name="category" required>
            <option value="Cita">Cita</option>
            <option value="Escuela">Escuela</option>
            <option value="Actividad">Actividad</option>
            <option value="Otro">Otro</option>
          </select>
          <button type="submit" class="primary-button">Guardar evento</button>
        </form>`;
      break;
    case 'menu':
      html = `
        <h3>Nuevo plato</h3>
        <form id="menu-form">
          <input type="text" name="title" placeholder="Plato" required>
          <input type="text" name="day" placeholder="Día de la semana" required>
          <textarea name="note" rows="3" placeholder="Descripción breve"></textarea>
          <button type="submit" class="primary-button">Guardar menú</button>
        </form>`;
      break;
    case 'shopping':
      html = `
        <h3>Nuevo artículo</h3>
        <form id="shopping-form">
          <input type="text" name="name" placeholder="Artículo" required>
          <input type="text" name="quantity" placeholder="Cantidad / nota" required>
          <button type="submit" class="primary-button">Guardar artículo</button>
        </form>`;
      break;
  }
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');
  attachFormEvents(type);
}

function attachFormEvents(type) {
  const form = modalContent.querySelector('form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (type === 'event') {
      STORAGE.events.push({
        title: data.title,
        date: data.date,
        time: data.time,
        category: data.category,
      });
    }

    if (type === 'menu') {
      STORAGE.menus.push({
        title: data.title,
        day: data.day,
        note: data.note || 'Planificación familiar',
      });
    }

    if (type === 'shopping') {
      STORAGE.shopping.push({
        name: data.name,
        quantity: data.quantity,
        checked: false,
      });
    }

    saveState();
    renderAll();
    modal.classList.add('hidden');
  });
}

addEventButton.addEventListener('click', () => openForm('event'));
addMenuButton.addEventListener('click', () => openForm('menu'));
addItemButton.addEventListener('click', () => openForm('shopping'));

function renderAll() {
  renderCounts();
  renderCalendarMonth();
  renderEvents();
  renderMenus();
  renderShopping();
}

renderAll();
