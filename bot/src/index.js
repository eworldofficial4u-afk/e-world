import 'dotenv/config';
import { startStats } from './stats.js';
import {
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
  applicationId: process.env.DISCORD_APPLICATION_ID || '1543275777146097755',
  guildId: process.env.DISCORD_GUILD_ID || '1539496402890133574',
  staffRoleId: process.env.DISCORD_STAFF_ROLE_ID || '1543263077502554123',
  apiUrl: process.env.EWORLD_API_URL || 'https://e-world-community.pages.dev/api/community-content'
};

if (!config.token) throw new Error('DISCORD_BOT_TOKEN is missing. Add a rotated token to bot/.env.');
if (!process.env.BOT_STATS_SECRET) throw new Error('BOT_STATS_SECRET is missing. Configure the shared website secret.');

const command = new SlashCommandBuilder()
  .setName('eworld')
  .setDescription('E-WORLD community operations')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand => subcommand.setName('status').setDescription('Check the bot and website connection'))
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

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates] });
let stopStats = () => {};

const hasStaffAccess = interaction => interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
  || interaction.member?.roles?.cache?.has(config.staffRoleId);

const getActiveOperations = async () => {
  const response = await fetch(config.apiUrl, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Website API returned ${response.status}`);
  const data = await response.json();
  return Array.isArray(data.items) ? data.items.filter(item => item.status === 'active') : [];
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

client.once('ready', async readyClient => {
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) { console.error('Add this bot to the configured E-WORLD server first.'); client.destroy(); process.exitCode = 1; return; }
  try { await guild.members.fetch({ withPresences: true }); }
  catch { console.error('Initial member synchronization failed; restarting to avoid incomplete stats.'); client.destroy(); process.exitCode = 1; return; }
  stopStats = startStats(client, config.guildId);
  const rest = new REST({ version: '10' }).setToken(config.token);
  try { await rest.post(Routes.applicationGuildCommands(config.applicationId, config.guildId), { body: command.toJSON() }); }
  catch { console.error('Could not register /eworld; stats will continue.'); }
  console.log(`E-WORLD bot online as ${readyClient.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'eworld') return;
  if (!hasStaffAccess(interaction)) {
    await interaction.reply({ content: 'This command is restricted to E-WORLD staff.', ephemeral: true });
    return;
  }

  try {
    await interaction.deferReply({ ephemeral: true });
    const operations = await getActiveOperations();
    if (interaction.options.getSubcommand() === 'status') {
      await interaction.editReply({ content: `Online • ${operations.length} active website operation(s) found.` });
      return;
    }

    const type = interaction.options.getString('type', true);
    const item = operations.find(operation => operation.type === type);
    if (!item) {
      await interaction.editReply({ content: `No active ${type} is configured in the staff panel.` });
      return;
    }

    await interaction.channel.send({ embeds: [operationEmbed(item)] });
    await interaction.editReply({ content: `${type} published in this channel.` });
  } catch (error) {
    console.error('Staff command failed', error?.code || 'request-error');
    const message = 'The E-WORLD website data could not be loaded right now.';
    if (interaction.replied || interaction.deferred) await interaction.editReply({ content: message });
    else await interaction.reply({ content: message, ephemeral: true });
  }
});

for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { stopStats(); client.destroy(); process.exit(0); });
client.on('error', () => console.error('Discord connection error'));
client.login(config.token).catch(() => { console.error('Discord login failed. Check bot token and required intents.'); process.exitCode = 1; });
