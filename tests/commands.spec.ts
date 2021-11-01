import { MessageEmbed, ReactionCollector } from "discord.js";
import { mockDeep, MockProxy, mockReset } from "jest-mock-extended";
import { Command, MyInteraction, MyMessage } from "../typings";
import { Got, CancelableRequest, RequestError } from "got";
import { DeepMockProxy } from "jest-mock-extended/lib/Mock";
import "jest-extended";

const gotMockBuilder = {
  resolve(got: MockProxy<Got>, obj: unknown) {
    got.get.mockReturnValue({
      json: () => Promise.resolve(obj),
    } as CancelableRequest<typeof obj>);
  },
  reject(got: MockProxy<Got>, obj: unknown) {
    got.get.mockReturnValue({
      json: () => Promise.reject(obj),
    } as CancelableRequest<typeof obj>);
  },

  text: {
    resolve(got: MockProxy<Got>, obj: string) {
      got.get.mockReturnValue({
        text: () => Promise.resolve(obj),
      } as CancelableRequest<string>);
    },
    reject(got: MockProxy<Got>, obj: unknown) {
      got.get.mockReturnValue({
        text: () => Promise.reject(obj),
      } as CancelableRequest<unknown>);
    },
  },
};

const httpError = {
  async message(gotMock: MockProxy<Got>, command: Command, msg: MyMessage) {
    const err = { code: "Err" };
    gotMockBuilder.reject(gotMock, err);

    await command.executeMessage(msg, []);

    expect(msg.client.gotErrorHandler).toBeCalled();
  },
  async interaction(
    gotMock: MockProxy<Got>,
    command: Command,
    int: MyInteraction
  ) {
    const err = { code: "Err" };
    gotMockBuilder.reject(gotMock, err);

    await command.executeInteraction(int);
    expect(int.client.gotErrorHandler).toBeCalled();
  },
};

describe("Run Commands", () => {
  let msg: DeepMockProxy<MyMessage>;
  let interaction: DeepMockProxy<MyInteraction>;
  let gotMock: MockProxy<Got>;
  let gotMockInt: MockProxy<Got>;

  beforeEach(() => {
    msg = mockDeep<MyMessage>();
    interaction = mockDeep<MyInteraction>();
    gotMock = msg.client.$got as unknown as MockProxy<Got>;
    gotMockInt = interaction.client.$got as unknown as MockProxy<Got>;
  });

  afterEach(() => {
    mockReset(msg);
    mockReset(interaction);
  });

  it("Test _Test", async () => {
    const command = (await import("../src/commands/base/_test")).default;
    command.executeMessage(msg, ["hello", "world"]);
    command.executeInteraction(interaction);
    command.executeMessage(msg, []);

    expect(msg.channel.send).toBeCalledWith("hello world");
    expect(msg.channel.send).toHaveBeenLastCalledWith("Echo Text");
    expect(interaction.reply).toBeCalledWith(expect.any(String));
  });

  describe("Test cat", () => {
    let command: Command;
    beforeAll(async () => {
      command = (await import("../src/commands/base/cat")).default;
    });

    it("Success", async () => {
      const expectedValue = { file: "https://example.com" };
      gotMockBuilder.resolve(gotMock, expectedValue);
      gotMockBuilder.resolve(gotMockInt, expectedValue);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      const expected = expect.objectContaining({
        color: expect.any(Number),
        image: {
          url: expectedValue.file,
        },
      } as MessageEmbed);

      expect(msg.channel.send).toBeCalledWith({ embeds: [expected] });
      expect(interaction.reply).toBeCalledWith({ embeds: [expected] });
    });

    it("Fail HTTP", async () => {
      const err = { code: "Err" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).toBeCalled();
      expect(interaction.client.gotErrorHandler).toBeCalled();
    });

    it("Fail command", async () => {
      const err = { err: "ouch" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).not.toBeCalled();
      expect(interaction.client.gotErrorHandler).not.toBeCalled();
    });
  });

  describe("Test dadjoke", () => {
    let command: Command;
    beforeAll(async () => {
      command = (await import("../src/commands/base/dadjoke")).default;
    });

    it("Success", async () => {
      const expectedValue = "Test Value";
      gotMockBuilder.text.resolve(gotMock, expectedValue);
      gotMockBuilder.text.resolve(gotMockInt, expectedValue);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.channel.send).toBeCalledWith(expectedValue);
      expect(interaction.reply).toBeCalledWith(expectedValue);
    });

    it("Fail HTTP", async () => {
      const err = { code: "Err" };
      gotMockBuilder.text.reject(gotMock, err);
      gotMockBuilder.text.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).toBeCalled();
      expect(interaction.client.gotErrorHandler).toBeCalled();
    });

    it("Fail command", async () => {
      const err = { err: "ouch" };
      gotMockBuilder.text.reject(gotMock, err);
      gotMockBuilder.text.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).not.toBeCalled();
      expect(interaction.client.gotErrorHandler).not.toBeCalled();
    });
  });

  describe("Test dog", () => {
    let command: Command;
    beforeAll(async () => {
      command = (await import("../src/commands/base/dog")).default;
    });

    it("Success", async () => {
      const expectedValue = {
        message: "https://example.com",
        status: "200",
      };
      gotMockBuilder.resolve(gotMock, expectedValue);
      gotMockBuilder.resolve(gotMockInt, expectedValue);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      const expected = expect.objectContaining({
        color: expect.any(Number),
        image: {
          url: expectedValue.message,
        },
      });

      expect(msg.channel.send).toBeCalledWith({ embeds: [expected] });
      expect(interaction.reply).toBeCalledWith({ embeds: [expected] });
    });

    it("Fail HTTP", async () => {
      const err = { code: "Err" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).toBeCalled();
      expect(interaction.client.gotErrorHandler).toBeCalled();
    });

    it("Fail command", async () => {
      const err = { err: "ouch" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).not.toBeCalled();
      expect(interaction.client.gotErrorHandler).not.toBeCalled();
    });
  });

  describe("Test fact", () => {
    let command: Command;
    beforeAll(async () => {
      command = (await import("../src/commands/base/fact")).default;
    });

    it("Runs fact", async () => {
      const expectedValue = {
        id: "1",
        text: "Test Text",
        source: "Example Site",
        source_url: "https://example.com",
        language: "en",
        permalink: "https://example.com",
      };
      gotMockBuilder.resolve(gotMock, expectedValue);
      gotMockBuilder.resolve(gotMockInt, expectedValue);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      const expected = {
        embeds: [
          expect.objectContaining({
            title: "Random Fact",
            url: expectedValue.permalink,
            description: expectedValue.text,
            footer: {
              text: `Source: ${expectedValue.source}`,
            },
          }),
        ],
      };

      expect(msg.channel.send).toBeCalledWith(expected);
      expect(interaction.reply).toBeCalledWith(expected);
    });

    it("Fail HTTP", async () => {
      const err = { code: "Err" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).toBeCalled();
      expect(interaction.client.gotErrorHandler).toBeCalled();
    });

    it("Fail command", async () => {
      const err = { err: "ouch" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).not.toBeCalled();
      expect(interaction.client.gotErrorHandler).not.toBeCalled();
    });
  });

  describe("Test fox", () => {
    let command: Command;
    beforeAll(async () => {
      command = (await import("../src/commands/base/fox")).default;
    });

    it("Success", async () => {
      const expectedValue = {
        image: "https://example.com/image",
        link: "https://example.com/",
      };
      gotMockBuilder.resolve(gotMock, expectedValue);
      gotMockBuilder.resolve(gotMockInt, expectedValue);

      await command.executeMessage(msg, ["hello", "world"]);
      await command.executeInteraction(interaction);

      const expected = {
        embeds: [
          expect.objectContaining({
            image: expect.objectContaining({
              url: expectedValue.image,
            }),
            description: "Powered by [Random Fox API](https://randomfox.ca)",
            color: expect.any(Number),
          } as MessageEmbed),
        ],
      };

      expect(msg.channel.send).toBeCalledWith(expected);
      expect(interaction.reply).toBeCalledWith(expected);
    });

    it("Fail HTTP", async () => {
      await httpError.message(gotMock, command, msg);
      await httpError.interaction(gotMockInt, command, interaction);
    });

    it("Fail command", async () => {
      const err = { err: "ouch" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).not.toBeCalled();
      expect(interaction.client.gotErrorHandler).not.toBeCalled();
    });
  });

  it.skip("Runs Urban Dictionary", async () => {
    const expectedValue = {
      definition: "Test def",
      permalink: "https://example.com",
      thumbs_up: 1,
      thumbs_down: 1,
      sound_urls: [""],
      author: "Test Author",
      word: "Test Word",
      defid: 123,
      current_vote: "1500",
      written_on: "2021-01-01T00:00:00Z",
      example: "Test Example",
    };

    gotMock.get.mockReturnValue({
      json: () => Promise.resolve({ list: [expectedValue] }),
    } as unknown as CancelableRequest<typeof expectedValue>);

    msg.channel.send.mockResolvedValue(msg);
    msg.createReactionCollector.mockReturnValue(mockDeep<ReactionCollector>());

    const command = (await import("../src/commands/base/ud")).default;
    await command.executeMessage(msg, ["hello", "world"]);

    expect(msg.channel.send).toBeCalledWith(
      expect.objectContaining({
        title: expectedValue.word,
        description: expectedValue.definition,
        url: expectedValue.permalink,
        color: expect.any(Number),
        fields: [
          {
            inline: false,
            name: "Example",
            value: expectedValue.example,
          },
        ],
        author: {
          name: `Author: ${expectedValue.author}`,
        },
      } as MessageEmbed)
    );
  });

  describe("Test waifu", () => {
    let command: Command;
    const expectedValue = { url: "https://example.com" };
    beforeAll(async () => {
      command = (await import("../src/commands/base/waifu")).default;
    });

    it("Run correctly (200)", async () => {
      gotMockBuilder.resolve(gotMock, expectedValue);
      gotMockBuilder.resolve(gotMockInt, expectedValue);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      const expected = expect.objectContaining({
        image: { url: expectedValue.url },
        color: expect.any(Number),
      });

      expect(msg.channel.send).toBeCalledWith({ embeds: [expected] });
      expect(interaction.reply).toBeCalledWith({ embeds: [expected] });
    });

    it.skip("Return Invalid Category (404)", async () => {
      gotMock.get.mockRejectedValue({
        response: { statusCode: 404 },
        code: "",
      } as RequestError);
      gotMockInt.get.mockRejectedValue({
        response: { statusCode: 404 },
        code: "",
      } as RequestError);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);
      expect(msg.channel.send).toBeCalledWith("Invalid Category");
      expect(interaction.reply).toBeCalledWith("Invalid Category");
    });

    it.skip("Return error (4xx, 5xx)", async () => {
      gotMock.get.mockRejectedValue({
        response: { statusCode: 400 },
        code: "",
      } as RequestError);
      gotMockInt.get.mockRejectedValue({
        response: { statusCode: 400 },
        code: "",
      } as RequestError);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);
      const expected = expect.objectContaining({
        color: expect.any(Number),
      } as MessageEmbed);
      expect(msg.channel.send).not.toBeCalledWith(expected);
      expect(interaction.reply).not.toBeCalledWith(expected);
    });
  });

  describe("Test wiki", () => {
    let command: Command;
    beforeAll(async () => {
      command = (await import("../src/commands/base/wiki")).default;
    });

    it("Success", async () => {
      const expectedValue = {
        batchcomplete: "string",
        query: {
          pages: {
            "12342069": {
              pageid: 321694201,
              ns: 123,
              title: "Test Title",
              extract: "Test Extract",
            },
          },
        },
      };
      gotMockBuilder.resolve(gotMock, expectedValue);
      gotMockBuilder.resolve(gotMockInt, expectedValue);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      const expected = expect.objectContaining({
        title: expectedValue.query.pages[12342069].title,
        description: expectedValue.query.pages[12342069].extract,
        color: expect.any(Number),
        footer: expect.objectContaining({
          text: "Wikipedia",
        }),
      } as MessageEmbed);

      expect(msg.channel.send).toBeCalledWith({
        embeds: [expected],
      });
      expect(interaction.reply).toBeCalledWith({
        embeds: [expected],
      });
    });

    it("Fail HTTP", async () => {
      await httpError.message(gotMock, command, msg);
      await httpError.interaction(gotMockInt, command, interaction);
    });

    it("Fail command", async () => {
      const err = { err: "ouch" };
      gotMockBuilder.reject(gotMock, err);
      gotMockBuilder.reject(gotMockInt, err);

      await command.executeMessage(msg, []);
      await command.executeInteraction(interaction);

      expect(msg.client.gotErrorHandler).not.toBeCalled();
      expect(interaction.client.gotErrorHandler).not.toBeCalled();
    });
  });

  describe("Run Verse Command", () => {
    const expectedValue = {
      id: 1,
      title: "Test Title",
      content: "Test Content",
    };

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Due to circular reference errors
      msg.client.db.verse.findUnique.mockResolvedValue(expectedValue);
      interaction.client.db.verse.findUnique.mockResolvedValue(expectedValue);
    });

    it("Runs verses", async () => {
      const command = (await import("../src/commands/base/verse")).default;

      interaction.options.getString.mockReturnValue("1");
      await command.executeMessage(msg, ["1"]);
      await command.executeInteraction(interaction);

      const expected = expect.objectContaining({
        title: expectedValue.title,
        description: expectedValue.content,
        color: expect.any(Number),
      } as MessageEmbed);
      expect(msg.channel.send).toBeCalledWith({ embeds: [expected] });
      expect(interaction.reply).toBeCalledWith({ embeds: [expected] });
    });

    it("Return invalid message", async () => {
      const command = (await import("../src/commands/base/verse")).default;

      await command.executeMessage(msg, ["abc"]);

      const expected = "Argument must be a number!";
      expect(msg.channel.send).toBeCalledWith(expected);
    });
  });
});
