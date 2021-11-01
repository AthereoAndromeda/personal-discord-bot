import { MessageEmbed } from "discord.js";
import { MyClient } from "src/classes/Client";
import { Command, MyInteraction, MyMessage } from "../../../typings";

function getHelpEmbed(client: MyClient, message: MyMessage | MyInteraction) {
  const { commands } = client;
  const commandNames = commands.map(cmd => cmd.data.name);
  const prefix = client.prefixes.get(message.guildId || "") ?? "";
  const imgNotFoundLink =
    "https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg";

  const helpEmbed = new MessageEmbed()
    .setColor("#6600ff")
    .setAuthor(
      client.user?.username ?? "Username Not Found",
      client.user?.avatarURL() ?? imgNotFoundLink
    )
    //! Replace this with CalNatSci CDN link
    .setThumbnail(
      message.guild?.iconURL() ?? client.user?.avatarURL() ?? imgNotFoundLink
    )
    .setTitle("Here's a list of all my commands:")
    .setDescription(`\`${commandNames.join("`, `")}\``)
    .addField(
      "Tip:\n",
      `You can send \`${prefix}help <Command Name>\` to get info on a specific command!`
    );

  return helpEmbed;
}

function getCommandInfoEmbed(
  client: MyClient,
  arg: string,
  guildId?: string | null
) {
  const commandName = arg.toLowerCase();
  const prefix = client.prefixes.get(guildId || "") ?? "";
  const command =
    client.commands.get(commandName) ??
    client.commands.find(
      cmd => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) {
    return;
  }

  const checkAlias = (aliases: string[]) =>
    !aliases || !aliases.length ? "No Aliases" : aliases.join("`, `");

  const checkCooldown = (cooldown: number) =>
    !cooldown || cooldown === 0 ? "None" : `${cooldown} seconds`;

  const checkUsage = (usage: string | null) => (usage ? ` ${usage}` : "");

  const cmdInfo = new MessageEmbed()
    .setColor("#3400a6")
    .setThumbnail("https://i.imgur.com/xJf6bqz.png")
    .setTitle(`Command: \`${command.data.name}\``)
    // @ts-expect-error discordjs/discord.js#6247 Broke choice typings, but works anyways
    .setDescription(command.data.description)
    .addFields(
      {
        name: "Aliases:",
        value: `\`${checkAlias(command.aliases)}\``,
      },
      {
        name: "Usage:",
        value: `\`${prefix}${command.data.name}${checkUsage(command.usage)}\``,
      },
      {
        name: "Cooldown:",
        value: `\`${checkCooldown(command.cooldown)}\``,
      }
    );

  return cmdInfo;
}

const command: Command = {
  data: {
    name: "help",
    description: "Shows Commands",
    options: [
      {
        name: "command",
        description: "Name of command",
        type: "STRING",
        required: false,
      },
    ],
  },
  aliases: ["cmd", "cmds", "commands", "command"],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  executeMessage(message, args) {
    const { client } = message;
    const helpEmbed = getHelpEmbed(client, message);

    if (!args[0] || args[0] === "") {
      message.channel.send({ embeds: [helpEmbed] });
      return;
    }

    const cmdInfo = getCommandInfoEmbed(client, args[0], message.guildId);
    if (!cmdInfo) {
      message.channel.send("Invalid command");
      return;
    }

    message.channel.send({ embeds: [cmdInfo] });
  },
  executeInteraction(interaction) {
    const { client } = interaction;
    const helpEmbed = getHelpEmbed(client, interaction);
    const args = interaction.options.getString("command");

    if (args === null) {
      interaction.reply({ embeds: [helpEmbed], ephemeral: true });
      return;
    }

    const cmdEmbed = getCommandInfoEmbed(client, args, interaction.guildId);
    if (!cmdEmbed) {
      interaction.reply({ content: "Invalid command", ephemeral: true });
      return;
    }

    interaction.reply({ embeds: [cmdEmbed], ephemeral: true });
  },
};

export default command;
