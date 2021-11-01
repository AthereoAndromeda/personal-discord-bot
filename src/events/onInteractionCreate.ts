import { EventHandler, MyInteraction } from "../../typings";

const eventHandler: EventHandler = {
  name: "interactionCreate",
  type: "on",
  async handler(interaction: MyInteraction) {
    if (!interaction.isCommand()) {
      return;
    }

    const { client, commandName } = interaction;
    if (!client.commands.has(commandName)) {
      throw new Error("Command not Registered!");
    }

    try {
      const command = client.commands.get(commandName);

      if (!command) {
        return; //error
      }

      await command.executeInteraction(interaction);
    } catch (error) {
      await interaction.reply({
        content: "**There was an error executing the command!**\n" + error,
      });
    }
  },
};

export default eventHandler;
