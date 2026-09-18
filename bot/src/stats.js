export function collectStats(guild) {
  const presences = [...guild.presences.cache.values()];
  const voice = [...guild.voiceStates.cache.values()].filter(state => state.channelId);
  return {
    guildId: guild.id,
    totalMembers: guild.memberCount,
    online: presences.filter(p => ['online','idle','dnd'].includes(p.status)).length,
    idle: presences.filter(p => p.status === 'idle').length,
    dnd: presences.filter(p => p.status === 'dnd').length,
    voiceConnected: voice.length,
    activeVoiceChannels: new Set(voice.map(s => s.channelId)).size,
    voiceChannels: guild.channels.cache.filter(c => c.isVoiceBased()).size,
    boosts: guild.premiumSubscriptionCount || 0,
    roles: guild.roles.cache.size
  };
}

export function startStats(client, guildId) {
  const endpoint = process.env.BOT_STATS_URL || 'https://e-world-community.pages.dev/api/bot/stats';
  const secret = process.env.BOT_STATS_SECRET;
  if (!secret) throw new Error('BOT_STATS_SECRET is required');
  let sending = false;
  async function sync() {
    const guild = client.guilds.cache.get(guildId);
    if (!guild || !client.isReady() || sending) return;
    sending = true;
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${secret}` }, body: JSON.stringify(collectStats(guild)), signal: AbortSignal.timeout(10000) });
      if (!response.ok) console.error(`Stats sync failed: HTTP ${response.status}`);
      else console.log('Server stats synchronized');
    } catch { console.error('Stats sync failed; retrying next minute'); }
    finally { sending = false; }
  }
  sync();
  const timer = setInterval(sync, 60000);
  return () => clearInterval(timer);
}
