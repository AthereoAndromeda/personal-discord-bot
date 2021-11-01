import { Guild } from "discord.js";
import { EventHandler } from "../../typings";

export default <EventHandler>{
  name: "guildCreate",
  type: "on",
  async handler(guild: Guild) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Commands exists
    const commandData = guild.client.commands.map(cmd => cmd.data);
    await guild.commands.set(commandData);
  },
};
