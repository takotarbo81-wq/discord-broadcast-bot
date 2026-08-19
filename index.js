const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const command = new SlashCommandBuilder()
  .setName("broadcast")
  .setDescription("إرسال رسالة لأعضاء السيرفر عبر الخاص")
  .addStringOption(option =>
    option
      .setName("message")
      .setDescription("الرسالة")
      .setRequired(true)
      .setMaxLength(2000)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: [command.toJSON()] }
  );

  console.log("✅ /broadcast جاهز");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "broadcast") return;

  await interaction.deferReply({ ephemeral: true });

  const message = interaction.options.getString("message");
  const members = await interaction.guild.members.fetch();

  let success = 0;
  let failed = 0;

  for (const member of members.values()) {
    if (member.user.bot) continue;

    try {
      await member.send(message);
      success++;

      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch {
      failed++;
    }
  }

  await interaction.editReply(
    `✅ انتهى الإرسال\n📨 نجح: ${success}\n❌ فشل: ${failed}`
  );
});

client.login(process.env.BOT_TOKEN);
