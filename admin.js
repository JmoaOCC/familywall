// ───── Menu toggle (móvil) ─────
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));
}

// ───── Storage ─────
const STORAGE_KEY = 'familywall-users';
let users = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

if (!users) {
  users = [
    { id: id(), name: 'Marta Pérez',    email: 'marta@familia.es',  family: 'Familia Pérez',     role: 'Madre',  plan: 'Premium', status: 'active',   color: 'pink',   lastSeen: minutesAgo(3) },
    { id: id(), name: 'Pablo Pérez',    email: 'pablo@familia.es',  family: 'Familia Pérez',     role: 'Padre',  plan: 'Premium', status: 'active',   color: 'blue',   lastSeen: minutesAgo(28) },
    { id: id(), name: 'Lucía Pérez',    email: 'lucia@familia.es',  family: 'Familia Pérez',     role: 'Hijo/a', plan: 'Free',    status: 'active',   color: 'green',  lastSeen: minutesAgo(120) },
    { id: id(), name: 'Mateo Pérez',    email: 'mateo@familia.es',  family: 'Familia Pérez',     role: 'Hijo/a', plan: 'Free',    status: 'active',   color: 'orange', lastSeen: minutesAgo(8) },
    { id: id(), name: 'Ana García',     email: 'ana@garcia.es',     family: 'Familia García',    role: 'Madre',  plan: 'Premium', status: 'active',   color: 'purple', lastSeen: minutesAgo(45) },
    { id: id(), name: 'Carlos García',  email: 'carlos@garcia.es',  family: 'Familia García',    role: 'Padre',  plan: 'Free',    status: 'inactive', color: 'teal',   lastSeen: daysAgo(12) },
    { id: id(), name: 'Sofía López',    email: 'sofia@lopez.es',    family: 'Familia López',     role: 'Madre',  plan: 'Premium', status: 'active',   color: 'pink',   lastSeen: minutesAgo(67) },
    { id: id(), name: 'Admin Sistema',  email: 'admin@familywall.es', family: 'FamilyWall',      role: 'Admin',  plan: 'Premium', status: 'active',   color: 'blue',   lastSeen: minutesAgo(1) },
  ];
  save();
}

// ───── Refs ─────
const tbody = document.getElementById('users-tbody');
const emptyState = document.getElementById('empty-state');
const search = document.getElementById('search-input');
const filterRole = document.getElementById('filter-role');
const filterStatus = document.getElementById('filter-status');
const resetBtn = document.getElementById('reset-filters');

const statTotal = document.getElementById('stat-total');
const statActive = document.getElementById('stat-active');
const statPremium = document.getElementById('stat-premium');
const statFamilies = document.getElementById('stat-families');

const userModal = document.getElementById('user-modal');
const closeUserModal = document.getElementById('close-user-modal');
const cancelUser = document.getElementById('cancel-user');
const openNewUser = document.getElementById('open-new-user');
const userForm = document.getElementById('user-form');
const modalTitle = document.getElementById('user-modal-title');

const confirmModal = document.getElementById('confirm-modal');
const confirmText = document.getElementById('confirm-text');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');
let pendingDeleteId = null;

// ───── Render ─────
function render() {
  const q = search.value.trim().toLowerCase();
  const roleF = filterRole.value;
  const statusF = filterStatus.value;

  const filtered = users.filter(u => {
    if (roleF && u.role !== roleF) return false;
    if (statusF && u.status !== statusF) return false;
    if (!q) return true;
    return [u.name, u.email, u.family].some(v => (v || '').toLowerCase().includes(q));
  });

  if (!filtered.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    tbody.innerHTML = filtered.map(rowHTML).join('');
    tbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openEdit(b.dataset.edit)));
    tbody.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => askDelete(b.dataset.delete)));
  }

  renderStats();
}

function rowHTML(u) {
  const initials = u.name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const roleClass = ({
    'Admin': 'role-admin', 'Padre': 'role-padre', 'Madre': 'role-madre',
    'Hijo/a': 'role-hijo', 'Otro': 'role-otro'
  })[u.role] || 'role-otro';

  return `
    <tr>
      <td>
        <div class="user-cell">
          <span class="av av-${u.color}">${escapeHtml(initials)}</span>
          <div>
            <strong>${escapeHtml(u.name)}</strong>
            <small>ID #${u.id.slice(-4)}</small>
          </div>
        </div>
      </td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.family)}</td>
      <td><span class="role-chip ${roleClass}">${escapeHtml(u.role)}</span></td>
      <td><span class="plan-chip ${u.plan === 'Premium' ? 'plan-premium' : ''}">${escapeHtml(u.plan)}</span></td>
      <td><span class="status-chip status-${u.status}">${u.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
      <td><small>${formatLastSeen(u.lastSeen)}</small></td>
      <td class="td-actions">
        <button class="icon-btn" data-edit="${u.id}" aria-label="Editar">✏️</button>
        <button class="icon-btn icon-btn--danger" data-delete="${u.id}" aria-label="Eliminar">🗑</button>
      </td>
    </tr>`;
}

function renderStats() {
  statTotal.textContent = users.length;
  statActive.textContent = users.filter(u => u.status === 'active').length;
  statPremium.textContent = users.filter(u => u.plan === 'Premium').length;
  statFamilies.textContent = new Set(users.map(u => u.family)).size;
}

// ───── Modal user (create/edit) ─────
function openCreate() {
  modalTitle.textContent = 'Nuevo usuario';
  userForm.reset();
  userForm.id.value = '';
  userModal.classList.remove('hidden');
  userForm.name.focus();
}

function openEdit(uid) {
  const u = users.find(x => x.id === uid);
  if (!u) return;
  modalTitle.textContent = `Editar · ${u.name}`;
  userForm.reset();
  userForm.id.value = u.id;
  userForm.name.value = u.name;
  userForm.email.value = u.email;
  userForm.family.value = u.family;
  userForm.role.value = u.role;
  userForm.plan.value = u.plan;
  userForm.status.value = u.status;
  const colorRadio = userForm.querySelector(`input[name="color"][value="${u.color}"]`);
  if (colorRadio) colorRadio.checked = true;
  userModal.classList.remove('hidden');
}

function closeUser() { userModal.classList.add('hidden'); }

userForm.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(userForm).entries());
  if (data.id) {
    const u = users.find(x => x.id === data.id);
    if (u) Object.assign(u, data, { lastSeen: u.lastSeen });
  } else {
    users.unshift({ ...data, id: id(), lastSeen: new Date().toISOString() });
  }
  save();
  render();
  closeUser();
});

openNewUser.addEventListener('click', openCreate);
closeUserModal.addEventListener('click', closeUser);
cancelUser.addEventListener('click', closeUser);
userModal.addEventListener('click', e => { if (e.target === userModal) closeUser(); });

// ───── Modal confirmación ─────
function askDelete(uid) {
  const u = users.find(x => x.id === uid);
  if (!u) return;
  pendingDeleteId = uid;
  confirmText.textContent = `Vas a eliminar a ${u.name}. Esta acción no se puede deshacer.`;
  confirmModal.classList.remove('hidden');
}

function closeConfirm() { confirmModal.classList.add('hidden'); pendingDeleteId = null; }

confirmDelete.addEventListener('click', () => {
  if (!pendingDeleteId) return;
  users = users.filter(u => u.id !== pendingDeleteId);
  save(); render(); closeConfirm();
});
cancelDelete.addEventListener('click', closeConfirm);
confirmModal.addEventListener('click', e => { if (e.target === confirmModal) closeConfirm(); });

// ───── Filters ─────
[search, filterRole, filterStatus].forEach(el => el.addEventListener('input', render));
resetBtn.addEventListener('click', () => {
  search.value = ''; filterRole.value = ''; filterStatus.value = '';
  render();
});

// Cerrar con Esc
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!userModal.classList.contains('hidden')) closeUser();
  if (!confirmModal.classList.contains('hidden')) closeConfirm();
});

// ───── Helpers ─────
function id() { return Math.random().toString(36).slice(2, 10); }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }
function minutesAgo(m) { return new Date(Date.now() - m * 60000).toISOString(); }
function daysAgo(d) { return new Date(Date.now() - d * 86400000).toISOString(); }

function formatLastSeen(iso) {
  if (!iso) return '—';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

render();
