import { stripIndents } from "common-tags";
import { Command } from "../../../typings";

const command: Command = {
  data: {
    name: "reload",
    description: "Reloads a command",
    options: [
      {
        name: "command",
        description: "Command to Reload",
        required: true,
        type: "STRING",
      },
    ],
  },
  aliases: ["r"],
  usage: "<Command>",
  cooldown: 5,
  guildOnly: false,
  argsRequired: true,
  rolesRequired: [],
  async executeMessage(message, args) {
    const commandName = args[0].toLowerCase();
    const { client } = message;
    const command =
      client.commands.get(commandName) ??
      client.commands.find(cmd => cmd.aliases.includes(commandName));

    if (!command) {
      message.channel.send(`\`${commandName}\` not Found!`);
      return;
    }

    try {
      delete require.cache[require.resolve(`./${command.data.name}.js`)];
      const newCommand = await import(`./${command.data.name}.js`);
      client.commands.set(newCommand.name, newCommand);

      message.channel.send(`Command \`${command.data.name}\` was reloaded!`);
    } catch (error) {
      console.error(error);
      message.channel.send(
        stripIndents`
                    There was an error while reloading the command\`${command.data.name}\`:
                    \`${error}\`
                `
      );
    }
  },
  async executeInteraction(interaction) {
    const args = interaction.options.getString("command", true);
    const commandName = args.toLowerCase();
    const { client } = interaction;
    const command =
      client.commands.get(commandName) ??
      client.commands.find(cmd => cmd.aliases.includes(commandName));

    if (!command) {
      interaction.reply(`\`${commandName}\` not Found!`);
      return;
    }

    try {
      delete require.cache[require.resolve(`./${command.data.name}.js`)];
      const newCommand = await import(`./${command.data.name}.js`);
      client.commands.set(newCommand.name, newCommand);

      interaction.reply(`Command \`${command.data.name}\` was reloaded!`);
    } catch (error) {
      console.error(error);
      interaction.reply(
        stripIndents`
                    There was an error while reloading the command\`${command.data.name}\`:
                    \`${error}\`
                `
      );
    }
  },
};

export default command;
