const eventSlug = document.body.dataset.eventSlug;
const form = document.querySelector('#registration-form');
const starterRoot = document.querySelector('#starter-roster');
const substituteRoot = document.querySelector('#substitute-roster');
const template = document.querySelector('#player-template');
const message = document.querySelector('#registration-message');
const submitButton = document.querySelector('#submit-registration');
let substitutes = 0;

function playerCard(type, position) {
  const card = template.content.firstElementChild.cloneNode(true);
  card.dataset.type = type;
  card.dataset.position = position;
  card.querySelector('.player-label').textContent = type === 'starter' ? `PLAYER ${position}` : `SUBSTITUTE ${position}`;
  const remove = card.querySelector('.remove-player');
  remove.hidden = type === 'starter';
  remove.addEventListener('click', () => {
    card.remove();
    renumberSubstitutes();
  });
  for (const input of card.querySelectorAll('[data-field]')) {
    input.id = `${type}-${position}-${input.dataset.field.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
  }
  card.querySelector('.upload-zone')?.remove();
  return card;
}

function renumberSubstitutes() {
  [...substituteRoot.children].forEach((card, index) => {
    card.dataset.position = index + 1;
    card.querySelector('.player-label').textContent = `SUBSTITUTE ${index + 1}`;
  });
  substitutes = substituteRoot.children.length;
  document.querySelector('#add-substitute').disabled = substitutes >= 2;
}

for (let index = 1; index <= 5; index += 1) starterRoot.append(playerCard('starter', index));
document.querySelector('#add-substitute').addEventListener('click', () => {
  if (substitutes >= 2) return;
  substituteRoot.append(playerCard('substitute', substitutes + 1));
  renumberSubstitutes();
});

async function syncAvailability() {
  try {
    const response = await fetch(`/api/tournament/events/${encodeURIComponent(eventSlug)}`, { headers: { accept: 'application/json' }, cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Tournament unavailable');
    const open = data.event.registration_status === 'open';
    const status = document.querySelector('#event-status');
    status.classList.toggle('closed', !open);
    status.lastChild.textContent = open ? ' REGISTRATION OPEN' : data.event.registration_status === 'not_open' ? ' REGISTRATION NOT OPEN' : ' REGISTRATION CLOSED';
    document.querySelector('#registration-closed').hidden = open;
    form.hidden = !open;
    document.querySelector('#hero-register').textContent = open ? 'REGISTER YOUR TEAM →' : 'REGISTRATION CLOSED';
  } catch {
    document.querySelector('#event-status').lastChild.textContent = ' STATUS UNAVAILABLE';
    document.querySelector('#registration-closed').hidden = false;
    form.hidden = true;
  }
}

function rosterData(root) {
  return [...root.children].map(card => ({
    discordUsername: card.querySelector('[data-field=discordUsername]').value.trim(),
    inGameName: card.querySelector('[data-field=inGameName]').value.trim(),
    uid: card.querySelector('[data-field=uid]').value.trim(),
    streamerMode: card.querySelector('[data-field=streamerMode]').value
  }));
}

function focusField(field) {
  if (!field) return;
  const node = document.querySelector(`#${CSS.escape(field)}`);
  if (node) { node.setAttribute('aria-invalid', 'true'); node.focus(); node.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

function sendRegistration(data) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/tournament/registrations');
    request.setRequestHeader('accept', 'application/json');
    request.setRequestHeader('content-type', 'application/json');
    request.timeout = 20000;
    request.addEventListener('timeout', () => reject(new Error('The request timed out. Check with staff before resubmitting if you are unsure whether it arrived.')));
    request.addEventListener('load', () => {
      let response = {};
      try { response = JSON.parse(request.responseText || '{}'); } catch { /* handled below */ }
      if (request.status >= 200 && request.status < 300) resolve(response);
      else reject(Object.assign(new Error(response.error || `Registration failed (${request.status})`), { field: response.field }));
    });
    request.addEventListener('error', () => reject(new Error('Network error. Please try again.')));
    request.send(JSON.stringify(data));
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  form.querySelectorAll('[aria-invalid=true]').forEach(node => node.removeAttribute('aria-invalid'));
  message.textContent = '';
  if (!form.reportValidity()) return;
  if (starterRoot.children.length !== 5 || substituteRoot.children.length > 2) return;
  const values = new FormData(form);
  const payload = {
    eventSlug,
    website: values.get('website'),
    teamName: values.get('teamName'),
    captainName: values.get('captainName'),
    captainDiscordUsername: values.get('captainDiscordUsername'),
    captainDiscordId: values.get('captainDiscordId'),
    captainContact: values.get('captainContact'),
    notes: values.get('notes'),
    starters: rosterData(starterRoot),
    substitutes: rosterData(substituteRoot),
    confirmAccurate: values.get('confirmAccurate') === 'on',
    confirmAuthorized: values.get('confirmAuthorized') === 'on',
    confirmRules: values.get('confirmRules') === 'on',
    confirmPenalties: values.get('confirmPenalties') === 'on'
  };
  submitButton.disabled = true;
  submitButton.textContent = 'SUBMITTING YOUR TEAM…';
  try {
    const result = await sendRegistration(payload);
    form.hidden = true;
    document.querySelector('#success-team').textContent = result.teamName;
    document.querySelector('#success-players').textContent = result.players;
    document.querySelector('#success-subs').textContent = result.substitutes;
    document.querySelector('#success-reference').textContent = result.publicRegistrationId;
    document.querySelector('#registration-success').hidden = false;
    document.querySelector('#registration-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    message.textContent = error.message;
    focusField(error.field);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'SUBMIT TEAM REGISTRATION <span>→</span>';
  }
});

syncAvailability();
