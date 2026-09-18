const nav = document.querySelector('.nav-wrap');
const menu = document.querySelector('.menu-button');
const links = document.querySelector('.nav-links');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const editableTarget = target => target instanceof Element && Boolean(target.closest('input, textarea, [contenteditable="true"]'));
document.addEventListener('contextmenu', event => {
  if (!editableTarget(event.target)) event.preventDefault();
});
document.addEventListener('copy', event => {
  if (!editableTarget(event.target)) event.preventDefault();
});
document.addEventListener('cut', event => {
  if (!editableTarget(event.target)) event.preventDefault();
});
document.addEventListener('dragstart', event => event.preventDefault());
const loader = document.querySelector('#site-loader');
const loaderCount = loader?.querySelector('.loader-core > b');
let loadValue = 0;
const loadTimer = setInterval(() => {
  loadValue = Math.min(loadValue + Math.ceil(Math.random() * 14), 94);
  if (loaderCount) loaderCount.textContent = String(loadValue).padStart(2, '0');
}, 90);
addEventListener('load', () => {
  clearInterval(loadTimer);
  if (loaderCount) loaderCount.textContent = '100';
  setTimeout(() => loader?.classList.add('loaded'), reduced ? 0 : 320);
}, { once: true });

addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), { passive: true });
menu.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
const closeMenu = () => { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && links.classList.contains('open')) { closeMenu(); menu.focus(); } });

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.style.transitionDelay = `${entry.target.dataset.delay || 0}ms`;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting || entry.target.dataset.done) return;
  entry.target.dataset.done = '1';
  const total = +entry.target.dataset.count;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / 1000, 1);
    entry.target.textContent = Math.round(total * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), { threshold: .7 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

if (!reduced && matchMedia('(pointer:fine)').matches) {
  const glow = document.querySelector('.cursor-glow');
  addEventListener('pointermove', e => {
    glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`;
  });
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), x = (e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--x', `${x*100}%`); card.style.setProperty('--y', `${y*100}%`);
      card.style.transform = `perspective(800px) rotateX(${(0.5-y)*5}deg) rotateY(${(x-0.5)*5}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
  const planet = document.querySelector('.planet');
  document.querySelector('.planet-stage').addEventListener('pointermove', e => {
    const r=e.currentTarget.getBoundingClientRect();
    planet.style.translate=`${((e.clientX-r.left)/r.width-.5)*14}px ${((e.clientY-r.top)/r.height-.5)*10}px`;
  });
}

function updateCountdown(){
  document.querySelectorAll('.countdown').forEach(el => {
    const diff=Math.max(0,new Date(el.dataset.end)-new Date());
    const vals=[Math.floor(diff/864e5),Math.floor(diff/36e5)%24,Math.floor(diff/6e4)%60];
    el.querySelectorAll('b').forEach((b,i)=>b.textContent=String(vals[i]).padStart(2,'0'));
  });
}
updateCountdown(); setInterval(updateCountdown,60000);

async function syncDiscordPresence() {
  const online = document.querySelector('#discord-online');
  const voiceMembers = document.querySelector('#discord-voice-members');
  const activeVoice = document.querySelector('#discord-active-voice');
  const totalMembers = document.querySelector('#discord-total-members');
  const sync = document.querySelector('#discord-sync');
  const apiStatus = document.querySelector('#discord-api-status');
  const lastSync = document.querySelector('#discord-last-sync');
  const label = document.querySelector('#presence-label');
  const avatars = document.querySelector('#avatar-stack');
  const voice = document.querySelector('#voice-live');
  try {
    const response = await fetch('/api/discord-status', { headers: { accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Live data unavailable');
    online.textContent = Number(data.online).toLocaleString();
    voiceMembers.textContent = Number(data.voiceConnected || 0).toLocaleString();
    activeVoice.textContent = Number(data.activeVoiceChannels || 0).toLocaleString();
    totalMembers.textContent = Number.isInteger(data.totalMembers) && data.totalMembers >= 0 ? data.totalMembers.toLocaleString() : '—';
    totalMembers.title = Number.isInteger(data.totalMembers) ? 'Total server membership reported by the bot' : 'Member count is available when the stats bot is connected';
    sync.textContent = data.source === 'bot' ? 'Live bot statistics' : 'Public Discord widget';
    apiStatus.textContent = 'Discord network online';
    const updated = new Date(data.updatedAt || Date.now());
    lastSync.textContent = `Last synced ${updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • refreshes every minute`;
    label.textContent = `${Number(data.online).toLocaleString()} members online now`;
    avatars.replaceChildren(...data.members.slice(0, 9).map(member => {
      if (!member.avatar) {
        const fallback = document.createElement('span');
        fallback.className = 'avatar-placeholder';
        fallback.textContent = String(member.username || '?').trim().charAt(0).toUpperCase();
        fallback.title = member.username || 'Online member';
        return fallback;
      }
      const image = document.createElement('img');
      image.src = member.avatar;
      image.alt = member.username;
      image.title = `${member.username}${member.activity ? ` • ${member.activity}` : ''}`;
      image.loading = 'lazy';
      image.dataset.status = member.status;
      return image;
    }));
    const busiest = data.activeVoice?.[0];
    const voiceTitle = document.createElement('span');
    voiceTitle.textContent = 'VOICE NODES';
    const voiceStatus = document.createElement('small');
    voiceStatus.textContent = busiest?.name && busiest.name !== 'Private voice room'
      ? `${Number(data.voiceConnected || 0).toLocaleString()} connected • busiest: ${busiest.name}`
      : Number(data.voiceConnected || 0) > 0
        ? `${Number(data.voiceConnected).toLocaleString()} connected • ${Number(data.activeVoiceChannels || 0).toLocaleString()} rooms active`
        : `${Number(data.voiceChannels || 0).toLocaleString()} voice rooms ready`;
    voice.replaceChildren(voiceTitle, voiceStatus);
  } catch {
    for (const node of [online, voiceMembers, activeVoice, totalMembers]) node.textContent = '—';
    sync.textContent = 'Retrying connection…';
    apiStatus.textContent = 'Discord link reconnecting';
    lastSync.textContent = 'Live data is temporarily unavailable. Automatic retry is active.';
    label.textContent = 'Live presence temporarily unavailable';
  }
}
syncDiscordPresence();
setInterval(syncDiscordPresence, 60000);

async function syncManagedContent() {
  try {
    const response = await fetch('/api/community-content', { headers: { accept: 'application/json' } });
    if (!response.ok) return;
    const { items = [] } = await response.json();
    const giveaway = items.find(item => item.type === 'giveaway' && item.status === 'active');
    const community = items.find(item => item.type === 'community' && item.status === 'active');
    const event = items.find(item => item.type === 'event' && item.status === 'active');
    if (giveaway) {
      let meta = {};
      try { meta = JSON.parse(giveaway.metadata_json || '{}'); } catch { /* Ignore malformed legacy metadata. */ }
      const title = document.querySelector('#public-giveaway-title');
      title.replaceChildren(document.createTextNode(giveaway.title));
      document.querySelector('#public-giveaway-participants').textContent = Number(giveaway.participant_count || 0).toLocaleString();
      const rewards = document.querySelector('#public-giveaway-rewards');
      const rewardValues = [meta.grandPrize, meta.bonusPrizes, meta.communityRewards].filter(Boolean);
      rewards.hidden = rewardValues.length === 0;
      rewards.replaceChildren(...rewardValues.map(value => { const span = document.createElement('span'); span.textContent = value; return span; }));
      const countdown = document.querySelector('.countdown');
      if (giveaway.ends_at) countdown.dataset.end = giveaway.ends_at;
      updateCountdown();
    }
    if (community) {
      document.querySelector('#public-community-title').textContent = community.title;
      document.querySelector('#public-community-description').textContent = community.description || 'There is always a place for you here.';
    }
    if (event) {
      document.querySelector('#public-event-title').textContent = event.title;
      document.querySelector('#public-event-description').textContent = event.description || 'E-WORLD community event';
      if (event.starts_at) {
        const date = new Date(event.starts_at);
        document.querySelector('#public-event-time').textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        document.querySelector('#public-event-zone').textContent = `${date.toLocaleDateString([], { day: '2-digit', month: 'short' }).toUpperCase()} / LOCAL`;
        document.querySelector('#public-event-month').textContent = date.toLocaleDateString([], { month: 'short' }).toUpperCase();
        document.querySelector('#public-event-day').textContent = String(date.getDate()).padStart(2, '0');
        document.querySelector('#public-event-year').textContent = date.getFullYear();
      }
    }
  } catch { /* Static cards remain available as resilient fallbacks. */ }
}
syncManagedContent();
setInterval(syncManagedContent, 30000);

const signalForm = document.querySelector('#signal-form');
signalForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const status = signalForm.querySelector('.form-status');
  const submit = signalForm.querySelector('button[type="submit"]');
  const form = new FormData(signalForm);
  const payload = Object.fromEntries(form.entries());
  status.className = 'form-status';
  status.textContent = 'Transmitting securely…';
  submit.disabled = true;
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Unable to send right now');
    signalForm.reset();
    status.className = 'form-status success';
    status.textContent = `${result.message || 'Signal received.'}${result.reference ? ` Reference: ${result.reference}` : ''}`;
  } catch (error) {
    status.className = 'form-status error';
    status.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});
