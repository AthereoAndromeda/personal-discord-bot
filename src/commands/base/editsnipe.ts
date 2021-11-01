import { Command } from "../../../typings";
import { main, isIndexOverMaxSnipes } from "../helpers/snipe";

export default <Command>{
  data: {
    name: "editsnipe",
    description: "Snipes Edited Messages",
    options: [
      {
        name: "ephemeral",
        description: "Make result only visible to you",
        type: "BOOLEAN",
        required: false,
      },
      {
        name: "channel",
        description: "Channel to snipe. Defaults to current",
        type: "CHANNEL",
        required: false,
      },
      {
        name: "index",
        description: "Indexes nth deleted message",
        type: "INTEGER",
        required: false,
      },
    ],
  },
  aliases: [],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  async executeMessage(message, args) {
    try {
      const index = parseInt(args[0]);

      if (isNaN(index)) {
        await message.reply("Must be a number!");
        return;
      }

      if (isIndexOverMaxSnipes(index)) {
        await message.reply("Index more than maximum stored snipes!");
        return;
      }

      const embed = main(message.client, message.channelId, index, "editsnipe");
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      message.client.log.error(error);
      message.channel.send("Error sending! " + error);
    }
  },
  async executeInteraction(interaction) {
    try {
      const isEphemeral = interaction.options.getBoolean("ephemeral");
      const index = interaction.options.getInteger("index");
      const channelId =
        interaction.options.getChannel("channel")?.id || interaction.channelId;

      if (isIndexOverMaxSnipes(index)) {
        await interaction.reply({
          content: "Index more than maximum stored snipes!",
          ephemeral: true,
        });
        return;
      }

      const embed = main(interaction.client, channelId, index, "editsnipe");
      interaction.reply({
        embeds: [embed],
        ephemeral: isEphemeral ?? false,
      });
    } catch (error) {
      interaction.client.log.error(error);
      interaction.reply({ content: `Error Sending! ${error}` });
    }
  },
};
