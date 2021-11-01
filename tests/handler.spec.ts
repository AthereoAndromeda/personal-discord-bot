import { MyClient } from "../src/classes/Client";
import {
  isArgsRequiredCheck,
  isGuildOnlyCheck,
  isValidMessage,
  parseCommand,
} from "../src/events/onMessageCreate";
import onInteractionCreate from "../src/events/onInteractionCreate";
import { Command, MyInteraction, MyMessage } from "../typings";
import { mockDeep, MockProxy, mockReset } from "jest-mock-extended";
import { DeepMockProxy } from "jest-mock-extended/lib/Mock";
import "jest-extended";
import Collection from "@discordjs/collection";

describe("onMessage Test", () => {
  let client: DeepMockProxy<MyClient>;
  let msg: MockProxy<MyMessage>;
  let interaction: MockProxy<MyInteraction>;
  const prefixes = new Collection<string, string>();
  const prefix = "test!";
  prefixes.set("123", prefix);

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Ignored due to circular reference error
    msg = mockDeep<MyMessage>();
    client = mockDeep<MyClient>({ prefixes });
    msg.client = client;
    interaction = mockDeep<MyInteraction>();
    msg.author.bot = false;
  });

  afterEach(() => {
    mockReset(client);
    mockReset(msg);
    mockReset(interaction);
  });

  describe("Test onInteractionCreate", () => {
    it("Should return", () => {
      interaction.isCommand.mockReturnValue(false);
      const res = onInteractionCreate.handler(interaction);

      expect(res).resolves.toBe(undefined);
    });
  });

  describe("Test `isValidMessage()`", () => {
    it("Return true", async () => {
      msg.content = "test!someCommand";
      const res = isValidMessage(msg, prefix);

      expect(res).toBe(true);
    });

    it("Return false due to author being bot", () => {
      msg.author.bot = true;
      msg.content = "test!invalidCommand";
      const res = isValidMessage(msg, prefix);

      expect(res).toBe(false);
    });

    it("Return false due to incorrect prefix", () => {
      msg.content = "wrongPrefix!invalidCommand";
      const res = isValidMessage(msg, prefix);

      expect(res).toBe(false);
    });
  });

  describe("Test `parseCommand()`", () => {
    it("Return undefined due to prefix only", async () => {
      msg.content = prefix;
      const res = parseCommand(msg, prefix);

      expect(res).toBe(undefined);
    });

    it("Return undefined due to non-existent command", async () => {
      msg.content = "test!nonexistentCommand";
      const res = parseCommand(msg, prefix);

      expect(res).toBe(undefined);
    });

    it("Return command via name", () => {
      const command = { data: { name: "testCommand" } } as Command;
      client.commands.get.calledWith("testcommand").mockReturnValue(command);

      msg.content = "test!testCommand someArg";
      const res = parseCommand(msg, prefix);

      expect(res).toEqual({
        command,
        args: ["someArg"],
      });
    });

    it("Return command via alias", () => {
      const testCommand = {
        data: { name: "testCommandWithAlias" },
        aliases: ["testalias"],
      } as Command;

      client.commands.find.mockReturnValue(testCommand);
      msg.content = "test!testalias someArg";
      const res = parseCommand(msg, prefix);

      expect(res).toEqual({
        command: testCommand,
        args: ["someArg"],
      });
    });
  });

  describe("Test `isGuildOnlyCheck()`", () => {
    let testCommand: Command;

    beforeEach(() => {
      testCommand = {
        data: { name: "testCommand" },
        aliases: ["testalias"],
        guildOnly: true,
      } as Command;
    });

    it("Return true with guildOnly false and channelType is text", () => {
      testCommand.guildOnly = false;
      msg.channel.type = "GUILD_TEXT";
      const res = isGuildOnlyCheck(msg, testCommand, prefix);

      expect(res).toBe(true);
    });

    it("Return true with guildOnly true and channelType is text", () => {
      msg.channel.type = "GUILD_TEXT";
      const res = isGuildOnlyCheck(msg, testCommand, prefix);

      expect(res).toBe(true);
    });

    it("Return false with guildOnly true and channelType is not text", () => {
      msg.channel.type = "DM";
      const res = isGuildOnlyCheck(msg, testCommand, prefix);

      expect(res).toBe(false);
    });
  });

  describe("Test `isArgsRequiredCheck()`", () => {
    let testCommand: Command;

    beforeEach(() => {
      testCommand = {
        data: { name: "testCommand" },
        aliases: ["testalias"],
        guildOnly: true,
        argsRequired: true,
        usage: "<Usage Here>",
      } as Command;
    });

    it("Return true with argsRequired true and args", () => {
      const res = isArgsRequiredCheck(msg, testCommand, ["someArg"], prefix);
      expect(res).toBe(true);
    });

    it("Return true with argsRequired false and args", () => {
      testCommand.argsRequired = false;
      const res = isArgsRequiredCheck(msg, testCommand, ["someArg"], prefix);
      expect(res).toBe(true);
    });

    it("Return true with argsRequired false and no args", () => {
      testCommand.argsRequired = false;
      const res = isArgsRequiredCheck(msg, testCommand, [], prefix);
      expect(res).toBe(true);
    });

    it("Return false with argsRequired true and no args", () => {
      const res = isArgsRequiredCheck(msg, testCommand, [], prefix);
      expect(res).toBe(false);
    });
  });
});
