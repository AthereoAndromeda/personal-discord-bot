import fsp from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { Collection, Intents } from "discord.js";
import { Command, EventHandler, ReadyCommand } from "typings";
import { MyClient } from "./classes/Client";
import { checkNodeEnv } from "./utils";

async function setCommands(client: MyClient) {
  const baseFiles = fsp.readdir(path.resolve(__dirname, "./commands/base/"));
  const readyFiles = fsp.readdir(path.resolve(__dirname, "./commands/ready/"));

  const baseCommands = new Collection<string, Command>();
  const readyCommands = new Collection<string, ReadyCommand>();

  for (const commandFile of await readyFiles) {
    const commandImport = await import(`./commands/ready/${commandFile}`);
    const command: ReadyCommand = commandImport.default;

    if (command.isDisabled) {
      continue;
    }

    readyCommands.set(command.name, command);
  }

  for (const commandFile of await baseFiles) {
    const commandImport = await import(`./commands/base/${commandFile}`);
    const command: Command = commandImport.default;

    if (command.isDisabled) {
      continue;
    }

    baseCommands.set(command.data.name, command);
  }

  client.setCommands(baseCommands);
  client.setReadyCommands(readyCommands);
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

  await setCommands(client);
  await setEventHandlers(client);

  try {
    await client.login();
  } catch (error) {
    throw new Error(error as string);
  }
})();
