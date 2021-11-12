import { MyClient } from "../classes/Client";
import { EventHandler } from "../../typings";

async function shutdownHandler(client: MyClient) {
  client.log.info("Disconnecting Database...");
  try {
    await client.db.$disconnect();
  } catch (error) {
    client.log.error("Error disconnecting from database!");
    client.log.error(error);
    process.exit(1);
  }

  client.log.info("Shutting Down...");
  try {
    client.destroy();
  } catch (error) {
    client.log.error("Error destroying client!");
    client.log.error(error);
    process.exit(1);
  }

  client.log.info("Succesfully Shutdown");
  process.exit(0);
}

export default <EventHandler>{
  name: "ready",
  type: "once",
  async handler(client: MyClient) {
    // Adds graceful shutdown
    process.on("SIGINT", async () => await shutdownHandler(client));
    process.on("SIGTERM", async () => await shutdownHandler(client));

    await client.db.$connect();
    client.log.info("Connected to Database");

    const commandData = client.commands.map(cmd => cmd.data);

    const guildInfo = await client.db.guild.findMany();
    const guildIds = guildInfo.map(guild => guild.id);

    for (const [guildId, guild] of client.guilds.cache) {
      await guild.commands.set(commandData);

      if (!guildIds.includes(guildId)) {
        await client.db.guild.upsert({
          where: { id: guildId },
          create: { id: guildId },
          update: {},
        });
      }
    }

    for (const guild of guildInfo) {
      client.prefixes.set(guild.id, guild.prefix);
    }

    // Execute Ready Commands
    for (const command of client.readyCommands.values()) {
      command.execute(client);
    }

    client.user?.setActivity({
      name: process.env.ACTIVITY_NAME,
      type: process.env.ACTIVITY_TYPE,
    });

    client.log.info(`${client.user?.username} Ready`);
  },
};
