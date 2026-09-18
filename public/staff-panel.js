const state = { user: null, csrf: '', expiresAt: 0, items: [], audit: [], view: 'all', deleting: null, registrations: [], registrationTotal: 0, registrationPage: 1, registrationPageSize: 20, registrationStats: {}, registrationEvents: [], reviewing: null, pendingRegistrationStatus: '' };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const sessionCheck = $('#session-check');
const loginView = $('#login-view');
const dashboard = $('#dashboard');
const loginForm = $('#login-form');
const operationForm = $('#operation-form');
const editorDialog = $('#editor-dialog');
const deleteDialog = $('#delete-dialog');
const registrationDialog = $('#registration-dialog');
const registrationConfirmDialog = $('#registration-confirm-dialog');
let toastTimer;

const parseMetadata = item => {
  try { return JSON.parse(item?.metadata_json || '{}'); } catch { return {}; }
};
const toLocalInput = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const formatDate = value => {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};
const remaining = value => {
  if (!value) return 'NO LIMIT';
  const difference = new Date(value).getTime() - Date.now();
  if (!Number.isFinite(difference) || difference <= 0) return 'ENDED';
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor(difference / 3600000) % 24;
  const minutes = Math.floor(difference / 60000) % 60;
  return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
};
const isExpired = item => item.status === 'active' && item.ends_at && new Date(item.ends_at).getTime() <= Date.now();
const isScheduled = item => item.status === 'active' && item.starts_at && new Date(item.starts_at).getTime() > Date.now();
const isLive = item => item.status === 'active' && !isExpired(item) && !isScheduled(item);
const effectiveStatus = item => isExpired(item) ? 'expired' : isScheduled(item) ? 'scheduled' : item.status;

async function api(url, options = {}) {
  const headers = { accept: 'application/json', ...(options.headers || {}) };
  if (options.body) headers['content-type'] = 'application/json';
  if (options.method && !['GET', 'HEAD'].includes(options.method)) headers['x-csrf-token'] = state.csrf;
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data.error === 'string' ? data.error : `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

function toast(message, type = 'success') {
  const node = $('#toast');
  clearTimeout(toastTimer);
  node.textContent = message;
  node.className = `toast ${type === 'error' ? 'error' : ''}`;
  node.hidden = false;
  toastTimer = setTimeout(() => { node.hidden = true; }, 3600);
}

function showLogin(message = '') {
  state.user = null;
  state.csrf = '';
  sessionCheck.hidden = true;
  dashboard.hidden = true;
  loginView.hidden = false;
  $('#login-message').textContent = message;
  $('#login-message').className = 'inline-message';
  if (editorDialog.open) editorDialog.close();
  if (deleteDialog.open) deleteDialog.close();
  if (registrationDialog.open) registrationDialog.close();
  if (registrationConfirmDialog.open) registrationConfirmDialog.close();
  requestAnimationFrame(() => $('#staff-password').focus());
}

function showDashboard(session) {
  if (!session?.user || !session?.csrfToken) throw new Error('Invalid session response');
  state.user = session.user;
  state.csrf = session.csrfToken;
  state.expiresAt = Number(session.expiresAt || 0);
  sessionCheck.hidden = true;
  loginView.hidden = true;
  dashboard.hidden = false;
  $('#staff-name').textContent = session.user.username || 'E-WORLD Administrator';
  $('#staff-avatar').src = session.user.avatar || 'assets/eworld-logo.webp';
}

async function bootstrap() {
  sessionCheck.hidden = false;
  loginView.hidden = true;
  dashboard.hidden = true;
  try {
    const session = await api('/api/auth/me');
    showDashboard(session);
    try {
      await loadContent();
    } catch (error) {
      $('#dashboard-notice').textContent = `The secure session is active, but records could not be loaded: ${error.message}`;
      $('#dashboard-notice').hidden = false;
    }
  } catch (error) {
    showLogin(error.status && ![401, 404].includes(error.status) ? error.message : '');
  }
}

async function loadContent() {
  $('#operation-grid').setAttribute('aria-busy', 'true');
  const data = await api('/api/admin/content');
  state.items = Array.isArray(data.items) ? data.items : [];
  state.audit = Array.isArray(data.audit) ? data.audit : [];
  $('#dashboard-notice').hidden = true;
  render();
  $('#operation-grid').removeAttribute('aria-busy');
}

function updateMetrics() {
  const live = state.items.filter(isLive);
  const upcoming = state.items.filter(item => item.status === 'active' && isScheduled(item));
  $('#metric-active').textContent = live.length.toLocaleString();
  $('#metric-participants').textContent = live
    .filter(item => ['giveaway', 'event'].includes(item.type))
    .reduce((total, item) => total + Number(item.participant_count || 0), 0)
    .toLocaleString();
  $('#metric-upcoming').textContent = upcoming.length.toLocaleString();
}

function detailPair(label, value, className = '') {
  const block = document.createElement('div');
  const small = document.createElement('small');
  const strong = document.createElement('strong');
  small.textContent = label;
  strong.textContent = value;
  if (className) strong.className = className;
  block.append(small, strong);
  return block;
}

function operationCard(item) {
  const card = document.createElement('article');
  card.className = 'operation-card';
  card.dataset.id = item.id;

  const head = document.createElement('div'); head.className = 'operation-head';
  const type = document.createElement('span'); type.className = 'operation-type'; type.textContent = item.type;
  const statusValue = effectiveStatus(item);
  const status = document.createElement('span'); status.className = `operation-state ${statusValue}`; status.textContent = statusValue;
  head.append(type, status);

  const title = document.createElement('h3'); title.textContent = item.title;
  const description = document.createElement('p'); description.textContent = item.description || 'No description supplied.';
  const details = document.createElement('div'); details.className = 'operation-data';
  const metadata = parseMetadata(item);
  const first = item.type === 'event'
    ? detailPair('STARTS', formatDate(item.starts_at))
    : detailPair('TIME REMAINING', remaining(item.ends_at), 'countdown-value');
  first.querySelector('strong').dataset.end = item.ends_at || '';
  const second = item.type === 'community'
    ? detailPair('CHANNELS / ROLES', `${Number(metadata.channels || 0).toLocaleString()} / ${Number(metadata.roles || 0).toLocaleString()}`)
    : detailPair('PARTICIPANTS', Number(item.participant_count || 0).toLocaleString());
  details.append(first, second);

  const visibility = document.createElement('div');
  visibility.className = 'visibility-badge';
  visibility.textContent = item.notification_enabled ? '◈ PUBLIC WEBSITE ENABLED' : '◈ STAFF ONLY';

  const actions = document.createElement('div'); actions.className = 'card-actions';
  const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit'; edit.addEventListener('click', () => openEditor(item));
  const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete'; remove.className = 'delete'; remove.addEventListener('click', () => openDelete(item));
  actions.append(edit, remove);
  card.append(head, title, description, details, visibility, actions);
  return card;
}

function renderAudit() {
  const root = $('#audit-list');
  root.replaceChildren();
  $('#audit-empty').hidden = state.audit.length > 0;
  for (const entry of state.audit) {
    const row = document.createElement('div'); row.className = 'audit-row';
    const action = document.createElement('b'); action.textContent = String(entry.action || '').toUpperCase();
    const actor = document.createElement('span'); actor.textContent = entry.actor_name || 'Administrator';
    const detail = document.createElement('span'); detail.textContent = `${entry.entity_type} · ${entry.detail}`;
    const time = document.createElement('time'); time.dateTime = new Date(entry.created_at * 1000).toISOString(); time.textContent = new Date(entry.created_at * 1000).toLocaleString();
    row.append(action, actor, detail, time);
    root.append(row);
  }
}

function render() {
  updateMetrics();
  renderAudit();
  const filtered = state.view === 'all' ? state.items : state.items.filter(item => item.type === state.view);
  const label = state.view === 'all' ? 'All operations' : `${state.view[0].toUpperCase()}${state.view.slice(1)} operations`;
  $('#view-code').textContent = `VIEW / ${state.view.toUpperCase()}`;
  $('#operations-title').textContent = label;
  $('#record-count').textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;
  $('#operation-grid').replaceChildren(...filtered.map(operationCard));
  $('#empty-panel').hidden = filtered.length > 0;
}

function registrationQuery(page = state.registrationPage) {
  const values = new FormData($('#registration-filters'));
  const params = new URLSearchParams({ page: String(page), status: String(values.get('status') || 'all'), event: String(values.get('event') || 'all'), search: String(values.get('search') || '').trim() });
  return params;
}

async function loadRegistrations(page = 1) {
  $('#registration-table').setAttribute('aria-busy', 'true');
  const data = await api(`/api/admin/tournament/registrations?${registrationQuery(page)}`);
  state.registrations = Array.isArray(data.registrations) ? data.registrations : [];
  state.registrationTotal = Number(data.total || 0);
  state.registrationPage = Number(data.page || 1);
  state.registrationPageSize = Number(data.pageSize || 20);
  state.registrationStats = data.stats || {};
  state.registrationEvents = Array.isArray(data.events) ? data.events : [];
  renderRegistrations();
  $('#registration-table').removeAttribute('aria-busy');
}

const registrationCell = (tag, value, className = '') => { const node = document.createElement(tag); node.textContent = value; if (className) node.className = className; return node; };

function renderRegistrations() {
  const stats = state.registrationStats;
  $('#reg-total').textContent = Number(stats.total || 0).toLocaleString();
  $('#reg-pending').textContent = Number(stats.pending || 0).toLocaleString();
  $('#reg-review').textContent = Number(stats.under_review || 0).toLocaleString();
  $('#reg-approved').textContent = Number(stats.approved || 0).toLocaleString();
  $('#reg-rejected').textContent = Number(stats.rejected || 0).toLocaleString();
  $('#reg-players').textContent = Number(stats.total_players || 0).toLocaleString();
  $('#registration-count').textContent = `${state.registrationTotal.toLocaleString()} record${state.registrationTotal === 1 ? '' : 's'}`;
  const eventSelect = $('#registration-filters').elements.event;
  const selected = eventSelect.value;
  eventSelect.replaceChildren(new Option('All events', 'all'), ...state.registrationEvents.map(item => new Option(item.title, item.id)));
  eventSelect.value = state.registrationEvents.some(item => item.id === selected) ? selected : 'all';
  const availabilityEvent = $('#registration-availability-event');
  const availabilitySelected = availabilityEvent.value;
  availabilityEvent.replaceChildren(...state.registrationEvents.map(item => new Option(item.title, item.id)));
  availabilityEvent.value = state.registrationEvents.some(item => item.id === availabilitySelected) ? availabilitySelected : state.registrationEvents[0]?.id || '';
  syncRegistrationAvailability();
  const exportParams = registrationQuery(1); exportParams.delete('page'); exportParams.delete('search');
  $('#registration-export').href = `/api/admin/tournament/registrations/export?${exportParams}`;
  const root = $('#registration-table'); root.replaceChildren();
  const header = document.createElement('div'); header.className = 'registration-row header';
  for (const label of ['Registration', 'Team', 'Captain', 'Roster', 'Subs', 'Status', 'Action']) header.append(registrationCell('span', label));
  root.append(header);
  if (!state.registrations.length) { const empty = registrationCell('div', 'No tournament registrations match these filters.'); empty.className = 'registration-row'; root.append(empty); }
  for (const item of state.registrations) {
    const row = document.createElement('article'); row.className = 'registration-row';
    row.append(registrationCell('strong', item.public_registration_id), registrationCell('span', item.team_name), registrationCell('span', item.captain_name), registrationCell('span', Number(item.player_count || 0).toLocaleString()), registrationCell('span', Number(item.substitute_count || 0).toLocaleString()), registrationCell('span', String(item.status || '').replace('_', ' '), `registration-status ${item.status}`));
    const button = registrationCell('button', 'VIEW / REVIEW'); button.type = 'button'; button.addEventListener('click', () => openRegistration(item.id)); row.append(button); root.append(row);
  }
  const totalPages = Math.max(1, Math.ceil(state.registrationTotal / state.registrationPageSize));
  $('#registration-page').textContent = `PAGE ${state.registrationPage} / ${totalPages}`;
  $('#registration-prev').disabled = state.registrationPage <= 1;
  $('#registration-next').disabled = state.registrationPage >= totalPages;
}

function summaryPair(label, value) { const block = document.createElement('div'); block.append(registrationCell('small', label), registrationCell('strong', value)); return block; }

async function openRegistration(id) {
  try {
    const data = await api(`/api/admin/tournament/registrations/${encodeURIComponent(id)}`);
    state.reviewing = data.registration;
    $('#registration-review-title').textContent = data.registration.team_name;
    $('#registration-notes').value = data.registration.staff_notes || '';
    const root = $('#registration-detail'); root.replaceChildren();
    const summary = document.createElement('div'); summary.className = 'registration-summary';
    summary.append(summaryPair('REGISTRATION', data.registration.public_registration_id), summaryPair('CAPTAIN', `${data.registration.captain_name} · ${data.registration.captain_discord_username}`), summaryPair('SUBMITTED', new Date(data.registration.submitted_at * 1000).toLocaleString()), summaryPair('STATUS', String(data.registration.status).replace('_', ' ').toUpperCase()));
    root.append(summary);
    for (const group of ['starter', 'substitute']) {
      const players = data.players.filter(player => player.player_type === group);
      if (!players.length) continue;
      const section = document.createElement('section'); section.className = 'review-roster'; section.append(registrationCell('h3', group === 'starter' ? 'STARTING ROSTER' : 'SUBSTITUTES'));
      for (const player of players) {
        const row = document.createElement('div'); row.className = 'review-player';
        row.append(registrationCell('span', `${group === 'starter' ? 'P' : 'S'}${player.roster_position}`), registrationCell('b', player.discord_username), registrationCell('span', player.in_game_name), registrationCell('span', player.uid), registrationCell('span', player.streamer_mode ? 'Streamer: ON' : 'Streamer: OFF'));
        if (player.screenshot_size) {
          const link = registrationCell('a', 'VIEW SCREENSHOT ↗'); link.href = `/api/admin/tournament/registrations/${encodeURIComponent(id)}/screenshots/${encodeURIComponent(player.id)}`; link.target = '_blank'; link.rel = 'noopener'; row.append(link);
        } else row.append(registrationCell('small', 'Roster registration · no screenshot required'));
        section.append(row);
      }
      root.append(section);
    }
    registrationDialog.showModal();
  } catch (error) { toast(error.message, 'error'); }
}

async function updateRegistration(status, notes = $('#registration-notes').value, notesOnly = false) {
  if (!state.reviewing) return;
  const result = await api(`/api/admin/tournament/registrations/${encodeURIComponent(state.reviewing.id)}`, { method: 'PATCH', body: JSON.stringify({ status, staffNotes: notes }) });
  state.reviewing.status = result.status;
  toast(notesOnly ? 'Staff notes saved.' : `Registration marked ${status.replace('_', ' ')}.`);
  registrationDialog.close();
  await Promise.all([loadRegistrations(state.registrationPage), loadContent()]);
}

async function showView(view) {
  state.view = view;
  const registrations = view === 'registrations';
  $('#registrations-section').hidden = !registrations;
  $('#operation-metrics').hidden = registrations;
  $('#operations-section').hidden = registrations;
  $('#audit-section').hidden = registrations;
  if (registrations) {
    try { await loadRegistrations(1); } catch (error) { toast(error.message, 'error'); }
  } else render();
}

function syncRegistrationAvailability() {
  const event = state.registrationEvents.find(item => item.id === $('#registration-availability-event').value);
  if (event) $('#registration-availability-status').value = event.registration_status;
}

function syncTypePanel() {
  const type = operationForm.elements.type.value;
  $$('[data-type-panel]').forEach(panel => { panel.hidden = panel.dataset.typePanel !== type; });
  $('[data-participant-field]').hidden = type === 'community';
  $('#type-hint').textContent = type === 'giveaway'
    ? 'Active giveaways require an end time so the website and Discord countdown stay accurate.'
    : type === 'event'
      ? 'Active events require a start time. The public page displays the next scheduled event.'
      : 'Only one community pulse can be active at a time. It controls the public community statistics.';
}

function openEditor(item = null) {
  operationForm.reset();
  $('#form-message').textContent = '';
  $('#form-message').className = 'form-message';
  $('#editor-title').textContent = item ? 'Edit operation' : 'New operation';
  operationForm.elements.id.value = item?.id || '';
  if (!item && state.view !== 'all') operationForm.elements.type.value = state.view;
  if (item) {
    const metadata = parseMetadata(item);
    operationForm.elements.type.value = item.type;
    operationForm.elements.status.value = item.status;
    operationForm.elements.title.value = item.title;
    operationForm.elements.description.value = item.description || '';
    operationForm.elements.startsAt.value = toLocalInput(item.starts_at);
    operationForm.elements.endsAt.value = toLocalInput(item.ends_at);
    operationForm.elements.participantCount.value = item.participant_count || 0;
    operationForm.elements.notificationEnabled.checked = Boolean(item.notification_enabled);
    for (const name of ['grandPrize', 'bonusPrizes', 'communityRewards', 'participantGoal', 'channels', 'roles', 'boosts', 'onlineLabel']) {
      operationForm.elements[name].value = metadata[name] ?? '';
    }
  }
  syncTypePanel();
  editorDialog.showModal();
  requestAnimationFrame(() => operationForm.elements.title.focus());
}

function formPayload() {
  const values = Object.fromEntries(new FormData(operationForm).entries());
  const payload = {
    type: values.type,
    status: values.status,
    title: values.title.trim(),
    description: values.description.trim(),
    startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
    endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
    participantCount: values.type === 'community' ? 0 : values.participantCount,
    notificationEnabled: operationForm.elements.notificationEnabled.checked,
    metadata: {}
  };
  if (values.type === 'giveaway') payload.metadata = {
    grandPrize: values.grandPrize.trim(), bonusPrizes: values.bonusPrizes.trim(),
    communityRewards: values.communityRewards.trim(), participantGoal: values.participantGoal
  };
  if (values.type === 'community') payload.metadata = {
    channels: values.channels, roles: values.roles, boosts: values.boosts, onlineLabel: values.onlineLabel.trim()
  };
  return { id: values.id, payload };
}

function validatePayload(payload) {
  if (payload.startsAt && payload.endsAt && new Date(payload.endsAt) <= new Date(payload.startsAt)) return 'End time must be after start time.';
  if (payload.status === 'active' && payload.type === 'giveaway' && !payload.endsAt) return 'Active giveaways require an end time.';
  if (payload.status === 'active' && payload.type === 'event' && !payload.startsAt) return 'Active events require a start time.';
  return '';
}

async function saveOperation(event) {
  event.preventDefault();
  if (!operationForm.reportValidity()) return;
  const { id, payload } = formPayload();
  const validation = validatePayload(payload);
  if (validation) { $('#form-message').textContent = validation; return; }
  const saveButton = $('#save-operation');
  saveButton.disabled = true;
  $('#form-message').textContent = 'Saving securely…';
  $('#form-message').className = 'form-message';
  try {
    await api(id ? `/api/admin/content/${encodeURIComponent(id)}` : '/api/admin/content', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
    editorDialog.close();
    await loadContent();
    toast(id ? 'Operation updated.' : 'Operation created.');
  } catch (error) {
    if (error.status === 401) { showLogin('Your session expired. Sign in again.'); return; }
    $('#form-message').textContent = error.message;
  } finally { saveButton.disabled = false; }
}

function openDelete(item) {
  state.deleting = item;
  $('#delete-copy').textContent = `“${item.title}” will be removed from the staff panel and public website.`;
  deleteDialog.showModal();
}

async function confirmDelete() {
  if (!state.deleting) return;
  const item = state.deleting;
  const button = $('#confirm-delete');
  button.disabled = true;
  button.textContent = 'Deleting…';
  try {
    await api(`/api/admin/content/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
    state.deleting = null;
    deleteDialog.close();
    await loadContent();
    toast('Operation deleted.');
  } catch (error) {
    if (error.status === 401) { showLogin('Your session expired. Sign in again.'); return; }
    toast(error.message, 'error');
  } finally { button.disabled = false; button.textContent = 'Delete permanently'; }
}

$$('.nav-button').forEach(button => button.addEventListener('click', async () => {
  $$('.nav-button').forEach(node => { node.classList.toggle('active', node === button); node.setAttribute('aria-pressed', String(node === button)); });
  await showView(button.dataset.view);
}));
$('#registration-filters').addEventListener('submit', event => { event.preventDefault(); loadRegistrations(1).catch(error => toast(error.message, 'error')); });
$('#registration-availability-event').addEventListener('change', syncRegistrationAvailability);
$('#save-registration-availability').addEventListener('click', async () => { const id = $('#registration-availability-event').value; if (!id) return; const button = $('#save-registration-availability'); button.disabled = true; try { await api(`/api/admin/tournament/events/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ registrationStatus: $('#registration-availability-status').value }) }); await Promise.all([loadRegistrations(state.registrationPage), loadContent()]); toast('Tournament registration availability updated.'); } catch (error) { toast(error.message, 'error'); } finally { button.disabled = false; } });
$('#registration-prev').addEventListener('click', () => loadRegistrations(state.registrationPage - 1).catch(error => toast(error.message, 'error')));
$('#registration-next').addEventListener('click', () => loadRegistrations(state.registrationPage + 1).catch(error => toast(error.message, 'error')));
$('#close-registration').addEventListener('click', () => registrationDialog.close());
$('#save-registration-notes').addEventListener('click', () => updateRegistration(state.reviewing?.status, $('#registration-notes').value, true).catch(error => toast(error.message, 'error')));
$$('[data-registration-status]').forEach(button => button.addEventListener('click', () => {
  if (!state.reviewing) return;
  state.pendingRegistrationStatus = button.dataset.registrationStatus;
  $('#registration-confirm-copy').textContent = `${state.reviewing.public_registration_id} · ${state.reviewing.team_name} will be marked ${state.pendingRegistrationStatus.replace('_', ' ')}.`;
  registrationConfirmDialog.showModal();
}));
$('#cancel-registration-status').addEventListener('click', () => { state.pendingRegistrationStatus = ''; registrationConfirmDialog.close(); });
$('#confirm-registration-status').addEventListener('click', async () => { const status = state.pendingRegistrationStatus; if (!status) return; const button = $('#confirm-registration-status'); button.disabled = true; try { await updateRegistration(status); state.pendingRegistrationStatus = ''; registrationConfirmDialog.close(); } catch (error) { toast(error.message, 'error'); } finally { button.disabled = false; } });
$('#new-operation').addEventListener('click', () => openEditor());
$('#empty-create').addEventListener('click', () => openEditor());
$('#close-editor').addEventListener('click', () => editorDialog.close());
$('#cancel-editor').addEventListener('click', () => editorDialog.close());
operationForm.addEventListener('submit', saveOperation);
operationForm.elements.type.addEventListener('change', syncTypePanel);
$('#cancel-delete').addEventListener('click', () => { state.deleting = null; deleteDialog.close(); });
$('#confirm-delete').addEventListener('click', confirmDelete);
$('#toggle-password').addEventListener('click', event => {
  const input = $('#staff-password');
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  event.currentTarget.textContent = visible ? 'SHOW' : 'HIDE';
  event.currentTarget.setAttribute('aria-pressed', String(!visible));
  event.currentTarget.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = loginForm.querySelector('button[type="submit"]');
  const message = $('#login-message');
  button.disabled = true;
  message.textContent = 'VERIFYING SECURELY…';
  message.className = 'inline-message';
  try {
    await api('/api/auth/password-login', { method: 'POST', body: JSON.stringify({ password: $('#staff-password').value }) });
    $('#staff-password').value = '';
    const session = await api('/api/auth/me');
    showDashboard(session);
    await loadContent();
    toast('Secure session established.');
  } catch (error) {
    message.textContent = error.message.toUpperCase();
    $('#staff-password').select();
  } finally { button.disabled = false; }
});

$('#logout-button').addEventListener('click', async () => {
  try { await api('/api/auth/logout', { method: 'POST' }); }
  catch { /* Always clear the local view even if the session already expired. */ }
  showLogin('You have been logged out.');
});

function updateClocks() {
  $('#network-clock').textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  $$('.countdown-value').forEach(node => { node.textContent = remaining(node.dataset.end); });
  if (state.expiresAt) {
    const minutes = Math.max(0, Math.ceil((state.expiresAt * 1000 - Date.now()) / 60000));
    $('#session-expiry').textContent = minutes ? `SESSION EXPIRES IN ${minutes}M` : 'SESSION EXPIRED';
  }
}

setInterval(updateClocks, 1000);
updateClocks();
bootstrap();
