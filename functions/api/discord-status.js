const GUILD_ID = '1539496402890133574';
const WIDGET_URL = `https://discord.com/api/guilds/${GUILD_ID}/widget.json`;
const PUBLIC_INVITE = 'https://discord.gg/ewld';

const response = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': status === 200 ? 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' : 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'access-control-allow-origin': 'https://e-world-community.pages.dev',
    'vary': 'Origin'
  }
});

const text = (value, max = 80) => String(value || '').replace(/[<>]/g, '').trim().slice(0, max);

export async function onRequestGet({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== 'https://e-world-community.pages.dev') return response({ error: 'Origin not allowed' }, 403);

  if (env.DB) {
    try {
      const snapshot = await env.DB.prepare('SELECT payload_json, updated_at FROM discord_bot_stats WHERE guild_id = ?').bind(GUILD_ID).first();
      if (snapshot && Date.now() / 1000 - snapshot.updated_at < 180) return response(JSON.parse(snapshot.payload_json));
    } catch { /* Keep the public widget available during migration or bot downtime. */ }
  }

  try {
    const discord = await fetch(WIDGET_URL, {
      headers: { accept: 'application/json' },
      redirect: 'follow'
    });
    if (!discord.ok) throw new Error(`Discord returned ${discord.status}`);
    const data = await discord.json();

    const channels = Array.isArray(data.channels) ? data.channels.slice(0, 100).map(channel => ({
      id: text(channel.id, 24),
      name: text(channel.name, 70),
      position: Number(channel.position) || 0
    })) : [];

    const allMembers = Array.isArray(data.members) ? data.members.map(member => ({
      username: text(member.username, 50),
      avatar: /^https:\/\/cdn\.discordapp\.com\/widget-avatars\//.test(member.avatar_url || '') ? member.avatar_url : '',
      status: ['online', 'idle', 'dnd'].includes(member.status) ? member.status : 'online',
      activity: text(member.game?.name, 50),
      channelId: text(member.channel_id, 24)
    })) : [];
    const members = allMembers.slice(0, 12);

    const membersInVoice = allMembers.filter(member => member.channelId);
    const voiceGroups = new Map();
    for (const member of membersInVoice) {
      voiceGroups.set(member.channelId, (voiceGroups.get(member.channelId) || 0) + 1);
    }
    const activeVoice = [...voiceGroups.entries()].map(([channelId, connected]) => {
      const channel = channels.find(item => item.id === channelId);
      return {
        id: channelId,
        name: channel?.name || 'Private voice room',
        position: channel?.position || 0,
        connected
      };
    }).sort((left, right) => right.connected - left.connected);
    const voiceConnected = membersInVoice.length;

    return response({
      guildId: GUILD_ID,
      name: text(data.name, 120),
      invite: PUBLIC_INVITE,
      online: Math.max(0, Number(data.presence_count) || 0),
      publicChannels: channels.length,
      voiceChannels: channels.length,
      activeVoiceChannels: activeVoice.length,
      voiceConnected,
      members,
      activeVoice: activeVoice.slice(0, 6),
      updatedAt: new Date().toISOString()
    });
  } catch {
    return response({ error: 'Live Discord status is temporarily unavailable' }, 502);
  }
}

export function onRequestPost() {
  return response({ error: 'Method not allowed' }, 405);
}
