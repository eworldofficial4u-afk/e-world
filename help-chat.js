(() => {
  const discord = 'https://discord.gg/ewld';
  const eventPath = '/events/codm-search-destroy';
  const cache = new Map();
  async function get(path) {
    const previous = cache.get(path);
    if (previous && Date.now() - previous.time < 60000) return previous.data;
    const response = await fetch(path, { signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error('Unavailable');
    const data = await response.json();
    cache.set(path, { data, time: Date.now() });
    return data;
  }
  const root = document.createElement('aside');
  root.className = 'ew-help';
  root.innerHTML = `<button class="ew-help-launch" aria-expanded="false" aria-controls="ew-help-panel">✦ <span>Need a hand?</span></button>
    <section id="ew-help-panel" hidden aria-label="E-WORLD help chat"><header><div><strong>E-WORLD GUIDE</strong><small>Quick answers. Find your next step.</small></div><button type="button" class="ew-help-close" aria-label="Close help">×</button></header>
    <div class="ew-help-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="Conversation"></div>
    <div class="ew-help-topics" aria-label="Suggested questions"><button>Join Discord</button><button>Registration status</button><button>Server online count</button><button>Contact staff</button><button>Tournament rules</button></div>
    <form><label for="ew-help-question">Ask about E-WORLD</label><div><input id="ew-help-question" maxlength="300" autocomplete="off" placeholder="How do I join?" required><button type="submit">Send</button></div></form><footer>Site guide, not generative AI. Messages stay in this page. <button type="button" class="ew-help-clear">Clear chat</button></footer></section>`;
  document.body.append(root);
  const panel = root.querySelector('section');
  const launch = root.querySelector('.ew-help-launch');
  const log = root.querySelector('.ew-help-log');
  const form = root.querySelector('form');
  const input = root.querySelector('input');
  let busy = false;
  function message(text, user = false, links = []) {
    const bubble = document.createElement('div');
    bubble.className = user ? 'ew-help-message ew-help-user' : 'ew-help-message';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    bubble.append(paragraph);
    for (const [label, href] of links) {
      const a = document.createElement('a'); a.textContent = label + ' →'; a.href = href; bubble.append(a);
    }
    log.append(bubble);
    while (log.children.length > 24) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  const welcome = () => message('Welcome! I can help you join E-WORLD, find tournament rules, check registration and reach staff. Choose a topic or ask a short question.');
  function toggle(open) { panel.hidden = !open; launch.setAttribute('aria-expanded', String(open)); if (open) input.focus(); else launch.focus(); }
  launch.addEventListener('click', () => toggle(panel.hidden));
  root.querySelector('.ew-help-close').addEventListener('click', () => toggle(false));
  root.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  root.querySelector('.ew-help-clear').addEventListener('click', () => { log.replaceChildren(); welcome(); });
  async function answer(raw) {
    if (busy || !raw.trim()) return;
    busy = true;
    const q = raw.toLowerCase().trim().slice(0, 300);
    message(raw.slice(0, 300), true); input.value = ''; form.querySelector('button').disabled = true;
    try {
      if (/password|secret|token|admin|staff panel/.test(q)) message('The staff panel is for authorized staff. Ask the owner for access; this guide cannot provide passwords or change accounts.', false, [['Staff panel', '/staff-panel']]);
      else if (/online|stats|server count|voice|members/.test(q)) {
        const data = await get('/api/discord-status');
        message(`Discord reports ${data.online} members online. The public widget shows ${data.voiceConnected} people in voice. Widget visibility can limit voice counts. Checked just now.`, false, [['Join the conversation', discord]]);
      } else if (/register|registration|sign up|roster|substitute/.test(q)) {
        const { event } = await get('/api/tournament/events/codm-search-destroy');
        message(event.registration_status === 'open' ? 'Registration is open. Your captain needs five starting players and may add up to two substitutes. Read the rules, then prepare each player’s Discord name, in-game name, UID and Streamer Mode status. No screenshot uploads are required.' : 'Tournament registration is currently closed or not yet open. You can still read the schedule and rules. Check official Discord announcements for updates.', false, [['Tournament details', eventPath], ['Official Discord', discord]]);
      } else if (/rule|ban|weapon|map|schedule|tournament|codm/.test(q)) message('Search & Destroy is 5v5, single elimination. Round 1: September 12, Firing Range. Round 2: September 13, Crash. Round 3: September 14, Terminal. Final: Tunisia, date to be announced. Read the full equipment restrictions before playing.', false, [['Read tournament rules', eventPath + '#rules']]);
      else if (/giveaway|prize|reward|win|event/.test(q)) {
        const { items = [] } = await get('/api/community-content');
        const type = /giveaway|prize|reward|win/.test(q) ? 'giveaway' : 'event';
        const active = items.filter(item => item.type === type && item.status === 'active');
        message(active.length ? 'Current announcements: ' + active.map(item => item.title).slice(0, 3).join(' · ') + '. Check the official announcement for eligibility and timing.' : 'There are no active ' + type + ' announcements available right now. Check Discord for the latest news.', false, [['View announcements', '/#' + (type === 'event' ? 'events' : 'giveaways')], ['Official Discord', discord]]);
      } else if (/contact|staff|report|help|support|problem|khan/.test(q)) message('Join the official E-WORLD Discord and contact the staff there. For a player complaint, ask your team captain to submit evidence. This chat does not send messages to moderators.', false, [['Contact staff on Discord', discord], ['Meet the owner', '/#staff']]);
      else if (/join|invite|discord|start|hello|hi\b/.test(q)) message('Open the official Discord invite, accept it and follow the server’s welcome instructions. You can then explore voice channels, community events and announcements.', false, [['Join E-WORLD', discord]]);
      else message('I can answer questions about joining Discord, server stats, events, registration, rules and staff access. Try one of the topics above, or ask staff for anything else.', false, [['Ask staff on Discord', discord]]);
    } catch { message('I couldn’t check the latest information. Please try again or check official Discord announcements; I don’t want to give you an outdated status.', false, [['Open Discord', discord]]); }
    finally { busy = false; form.querySelector('button').disabled = false; }
  }
  form.addEventListener('submit', e => { e.preventDefault(); answer(input.value); });
  root.querySelectorAll('.ew-help-topics button').forEach(b => b.addEventListener('click', () => answer(b.textContent)));
  welcome();
  const card = document.querySelector('[data-event-slug="codm-search-destroy"]');
  if (card) {
    const action = card.querySelector('.button');
    action.textContent = 'CHECK REGISTRATION →';
    get('/api/tournament/events/codm-search-destroy').then(({ event }) => {
      action.textContent = event.registration_status === 'open' ? 'REGISTER NOW →' : 'REGISTRATION CLOSED';
      action.href = eventPath + (event.registration_status === 'open' ? '#registration' : '');
    }).catch(() => { action.textContent = 'VIEW TOURNAMENT →'; action.href = eventPath; });
  }
})();
