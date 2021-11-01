import { MessageEmbed } from "discord.js";
import { randomHex } from "../../utils";
import { Command } from "../../../typings";
import { MyClient } from "src/classes/Client";

async function main(client: MyClient, arg: number) {
  const res = await client.db.verse.findUnique({
    where: {
      id: arg,
    },
  });

  const embed = new MessageEmbed()
    .setTitle(res?.title || "Not Found")
    .setDescription(res?.content || "Not Found")
    .setColor(randomHex());

  return embed;
}

const command: Command = {
  data: {
    name: "verse",
    description: "Fetches Verse of Given Day",
    options: [
      {
        name: "day",
        description: "Day of verse",
        type: "INTEGER",
        required: true,
      },
    ],
  },
  aliases: ["verses"],
  usage: "<day number>",
  cooldown: 3,
  guildOnly: false,
  argsRequired: true,
  rolesRequired: [],
  async executeMessage(message, args) {
    const parsedArg = parseInt(args[0]);

    if (isNaN(parsedArg)) {
      message.channel.send("Argument must be a number!");
      return;
    }

    if (parsedArg > 31 || parsedArg < 0) {
      message.channel.send("Invalid day");
      return;
    }

    const embed = await main(message.client, parsedArg);
    message.channel.send({ embeds: [embed] });
  },
  async executeInteraction(interaction) {
    const parsedArg = interaction.options.getInteger("day", true);

    if (parsedArg > 31 || parsedArg < 0) {
      interaction.reply("Invalid day");
      return;
    }

    const embed = await main(interaction.client, parsedArg);
    interaction.reply({ embeds: [embed] });
  },
};

export default command;
