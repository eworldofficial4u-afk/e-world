import 'dotenv/config';
import { startStats } from './stats.js';
import {
  ActivityType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder
} from 'discord.js';

const config = {
  token: process.env.DISCORD_BOT_TOKEN,
  applicationId: process.env.DISCORD_APPLICATION_ID || '1555470598690578432',
  guildId: process.env.DISCORD_GUILD_ID || '1555477347950665728',
  staffRoleId: process.env.DISCORD_STAFF_ROLE_ID || '1543263077502554123',
  apiUrl: process.env.EWORLD_API_URL || 'https://e-world-community.pages.dev/api/community-content',
  mcServerIp: process.env.MC_SERVER_IP || '151.243.226.61:25565',
};

if (!config.token) throw new Error('DISCORD_BOT_TOKEN is missing. Add a rotated token to bot/.env.');
if (!process.env.BOT_STATS_SECRET) throw new Error('BOT_STATS_SECRET is missing. Configure the shared website secret.');

const command = new SlashCommandBuilder()
  .setName('eworld')
  .setDescription('E-WORLD community & server operations')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand => subcommand.setName('status').setDescription('Check bot, Discord, and Minecraft status'))
  .addSubcommand(subcommand => subcommand
    .setName('publish')
    .setDescription('Publish an active website operation in this channel')
    .addStringOption(option => option
      .setName('type')
      .setDescription('Operation to publish')
      .setRequired(true)
      .addChoices(
        { name: 'Giveaway', value: 'giveaway' },
        { name: 'Community', value: 'community' },
        { name: 'Event', value: 'event' }
      )));

let stopStats = () => {};

const hasStaffAccess = interaction => interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
  || interaction.member?.roles?.cache?.has(config.staffRoleId);

const getActiveOperations = async () => {
  try {
    const response = await fetch(config.apiUrl, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.items) ? data.items.filter(item => item.status === 'active') : [];
  } catch {
    return [];
  }
};

const metadataOf = item => {
  try { return JSON.parse(item.metadata_json || '{}'); } catch { return {}; }
};

const operationEmbed = item => {
  const metadata = metadataOf(item);
  const color = item.type === 'giveaway' ? 0xc7f23a : item.type === 'event' ? 0xf2bc57 : 0x86a8ff;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(item.title)
    .setDescription(item.description || 'E-WORLD community update')
    .setFooter({ text: `E-WORLD • ${item.type.toUpperCase()}` })
    .setTimestamp();

  if (item.type === 'giveaway') {
    if (metadata.grandPrize) embed.addFields({ name: 'Grand prize', value: metadata.grandPrize, inline: true });
    if (metadata.bonusPrizes) embed.addFields({ name: 'Bonus prizes', value: metadata.bonusPrizes, inline: true });
    embed.addFields({ name: 'Participants', value: Number(item.participant_count || 0).toLocaleString(), inline: true });
  }
  if (item.type === 'community') {
    embed.addFields(
      { name: 'Channels', value: Number(metadata.channels || 0).toLocaleString(), inline: true },
      { name: 'Roles', value: Number(metadata.roles || 0).toLocaleString(), inline: true },
      { name: 'Boosts', value: Number(metadata.boosts || 0).toLocaleString(), inline: true }
    );
  }
  if (item.starts_at) embed.addFields({ name: 'Starts', value: `<t:${Math.floor(new Date(item.starts_at).getTime() / 1000)}:F>` });
  if (item.ends_at) embed.addFields({ name: 'Ends', value: `<t:${Math.floor(new Date(item.ends_at).getTime() / 1000)}:R>` });
  return embed;
};

// Periodic Minecraft Activity updater
async function updateBotActivity(client) {
  try {
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${config.mcServerIp}`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return;
    const data = await res.json();
    if (data.online) {
      client.user.setPresence({
        activities: [{
          name: `SMP: ${data.players.online}/${data.players.max} Online | 151.243.226.61`,
          type: ActivityType.Watching
        }],
        status: 'online'
      });
    } else {
      client.user.setPresence({
        activities: [{ name: 'E-World Universe // Syncing...', type: ActivityType.Playing }],
        status: 'idle'
      });
    }
  } catch {
    // Keep existing presence
  }
}

function setupClient(client) {
  client.once('clientReady', async readyClient => {
    const guild = client.guilds.cache.get(config.guildId) || client.guilds.cache.first();
    if (!guild) {
      console.warn('Bot is not currently in any Discord server. Invite the bot to start telemetry.');
      return;
    }

    try {
      await guild.members.fetch({ withPresences: true });
    } catch {
      console.log('Notice: Privileged presence intent not enabled in Discord Developer Portal. Using aggregate guild stats.');
    }

    stopStats = startStats(client, guild.id);

    // Register /eworld command
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
      await rest.post(Routes.applicationGuildCommands(config.applicationId, guild.id), { body: command.toJSON() });
      console.log(`Registered slash commands on guild ${guild.name} (${guild.id})`);
    } catch (err) {
      console.warn('Could not register slash command on guild:', err.message);
    }

    // Set dynamic activity
    updateBotActivity(client);
    setInterval(() => updateBotActivity(client), 60000);

    console.log(`E-WORLD bot online as ${readyClient.user.tag} (tracking guild: ${guild.name})`);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'eworld') return;
    if (!hasStaffAccess(interaction)) {
      await interaction.reply({ content: 'This command is restricted to E-WORLD staff.', ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      if (interaction.options.getSubcommand() === 'status') {
        let mcInfo = 'Offline';
        try {
          const res = await fetch(`https://api.mcstatus.io/v2/status/java/${config.mcServerIp}`, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            const mcData = await res.json();
            mcInfo = mcData.online ? `Online (${mcData.players.online}/${mcData.players.max} players, ${mcData.version.name_clean})` : 'Offline';
          }
        } catch {}

        const operations = await getActiveOperations();
        await interaction.editReply({
          content: `🟢 **Bot Online**\n• **Guild:** ${interaction.guild?.name || 'Unknown'}\n• **Minecraft Server (${config.mcServerIp}):** ${mcInfo}\n• **Active Website Operations:** ${operations.length}`
        });
        return;
      }

      const type = interaction.options.getString('type', true);
      const operations = await getActiveOperations();
      const item = operations.find(operation => operation.type === type);
      if (!item) {
        await interaction.editReply({ content: `No active ${type} is configured in the staff panel.` });
        return;
      }

      await interaction.channel.send({ embeds: [operationEmbed(item)] });
      await interaction.editReply({ content: `${type} published in this channel.` });
    } catch (error) {
      console.error('Staff command failed', error?.message || 'request-error');
      const message = 'The E-WORLD website data could not be loaded right now.';
      if (interaction.replied || interaction.deferred) await interaction.editReply({ content: message });
      else await interaction.reply({ content: message, ephemeral: true });
    }
  });

  client.on('error', (err) => console.error('Discord connection error:', err.message));
}

// Resilient login with automatic intent fallback
async function startBot() {
  const fullIntents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
  ];

  let client = new Client({ intents: fullIntents });
  setupClient(client);

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      stopStats();
      client.destroy();
      process.exit(0);
    });
  }

  try {
    await client.login(config.token);
  } catch (err) {
    if (err.message?.includes('disallowed intents')) {
      console.log('Notice: Privileged Gateway Intents not enabled in Discord Developer Portal. Falling back to standard Guild & Voice intents...');
      client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
      setupClient(client);
      await client.login(config.token);
    } else {
      console.error('Discord login failed:', err.message);
      process.exitCode = 1;
    }
  }
}

startBot();
