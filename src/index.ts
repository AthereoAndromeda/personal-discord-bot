import { Collection, Intents } from "discord.js";
import { Command, ReadyCommand } from "typings";
import {
  setCommandsInCollection,
  setEventHandlers,
} from "./helpers/commandLoaders";
import { MyClient } from "./classes/Client";
import prisma from "./classes/PrismaClient";
import path from "path";

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

(async () => {
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

  await setEventHandlers(path.resolve(__dirname, "./events/"), client);

  try {
    await client.login();
  } catch (error) {
    throw new Error(error as string);
  }
})();
