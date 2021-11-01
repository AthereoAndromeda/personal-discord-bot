import { MyClient } from "src/classes/Client";
import { Command } from "typings";

async function main(client: MyClient, guildId: string, prefix: string) {
  const res = await client.db.guild.update({
    where: { id: guildId },
    data: { prefix },
  });

  client.prefixes.set(guildId, prefix);
  return res;
}

export default <Command>{
  data: {
    name: "setprefix",
    description: "Sets the prefix for the guild.",
    options: [
      {
        name: "prefix",
        description: "The prefix to be set",
        type: "STRING",
        required: true,
      },
    ],
  },
  aliases: [],
  usage: "<prefix>",
  cooldown: 10,
  guildOnly: true,
  argsRequired: true,
  rolesRequired: [],
  async executeInteraction(interaction) {
    const prefix = interaction.options.getString("prefix", true);
    const guildId = interaction.guildId;

    if (!guildId) {
      throw new Error("Somehow bypassed `guildOnly` check");
    }

    try {
      const res = await main(interaction.client, guildId, prefix);
      await interaction.reply(`Prefix changed to \`${res.prefix}\``);
    } catch (error) {
      await interaction.reply("Error!\n" + error);
    }
  },
  async executeMessage(message, args) {
    const prefix = args[0];
    const guildId = message.guildId;

    if (!guildId) {
      throw new Error("Somehow bypassed `guildOnly` check");
    }

    try {
      const res = await main(message.client, guildId, prefix);
      await message.reply(`Prefix changed to \`${res.prefix}\``);
    } catch (error) {
      await message.reply("Error!\n" + error);
    }
  },
};
