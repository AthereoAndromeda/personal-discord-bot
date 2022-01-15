import fsp from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { Collection, Intents } from "discord.js";
import { Command, EventHandler, ReadyCommand } from "typings";
import { MyClient } from "./classes/Client";
import { checkNodeEnv } from "./utils";

async function setCommandsInCollection<K, V>(
  dirPath: string,
  collection: Collection<K, V>
) {
  const files = await fsp.readdir(dirPath);

  for (const file of files) {
    const commandPath = path.resolve(dirPath, file);
    const command = (await import(commandPath)).default;

    if (command.isDisabled) {
      continue;
    }

    collection.set(command.data.name, command);
  }

  // Return for convenience
  return collection;
}

async function setEventHandlers(client: MyClient) {
  const eventHandlers = fsp.readdir(path.resolve(__dirname, "./events/"));

  for (const eventHandler of await eventHandlers) {
    const event: EventHandler = (await import(`./events/${eventHandler}`))
      .default;

    // Either client.on() or client.once()
    client[event.type](event.name, (...args) => event.handler(...args));
  }
}

(async () => {
  const prisma = new PrismaClient({
    log: checkNodeEnv("production")
      ? ["warn", "error"]
      : ["info", "query", "warn", "error"],
  });

  const client = new MyClient({
    intents: [
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
      Intents.FLAGS.GUILD_INTEGRATIONS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_WEBHOOKS,
    ],
    db: prisma,
  });

  const baseCommands = new Collection<string, Command>();
  const readyCommands = new Collection<string, ReadyCommand>();

  await setCommandsInCollection(
    path.resolve(__dirname, "./commands/base/"),
    baseCommands
  );
  await setCommandsInCollection(
    path.resolve(__dirname, "./commands/ready/"),
    readyCommands
  );

  client.setCommands(baseCommands);
  client.setReadyCommands(readyCommands);

  await setEventHandlers(client);

  try {
    await client.login();
  } catch (error) {
    throw new Error(error as string);
  }
})();
