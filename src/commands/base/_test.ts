import { Command } from "../../../typings";

/**
 * Just a Command for Testing stuff
 */
const command: Command = {
  data: {
    name: "test",
    description: "Generic test stuff",
    options: [
      {
        name: "text",
        type: "STRING",
        description: "stuff",
        required: false,
      },
    ],
  },
  aliases: ["t"],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  executeInteraction(interaction) {
    const text = interaction.options.getString("text");
    interaction.reply(text || "Echo Text");
  },
  executeMessage(message, args) {
    message.channel.send(args.join(" ") || "Echo Text");
  },
};

export default command;
