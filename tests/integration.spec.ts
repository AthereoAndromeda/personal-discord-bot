/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MyClient } from "../src/classes/Client";
import { mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { Collection, Intents } from "discord.js";
import { Command, MyMessage } from "../typings";
import test from "../src/commands/base/_test";
import onMessageCreate from "../src/events/onMessageCreate";

describe("Integration Testing", () => {
  it.todo("Emit a message Event");
  it.todo("Use interaction and call a command");
  it("Message and call a command", async () => {
    const msg = mockDeep<MyMessage>();
    const prismaMock = mockDeep<PrismaClient>();

    // @ts-ignore Circular errors
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
      db: prismaMock,
    });

    client.prefixes.set("1", "t!");

    client.on("messageCreate", async (...args) => {
      try {
        await onMessageCreate.handler(...args);
      } catch (error) {
        console.error(error);
      }
    });

    const cmd = new Collection<string, Command>();
    cmd.set("test", test);
    client.setCommands(cmd);

    msg.content = "t!test";
    msg.author.bot = false;
    msg.guildId = "1";
    // @ts-ignore
    msg.client = client;

    client.emit("messageCreate", msg);
    expect(msg.channel.send).toBeCalledWith("Echo Text");
  });
});
