/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  charSlicer,
  charCounter,
  randomHex,
  randomRGBTuple,
  checkNodeEnv,
  getUserFromMention,
  gotErrorHandler,
} from "../src/utils";
import { mockClear, mockDeep, MockProxy } from "jest-mock-extended";
import { MyInteraction, MyMessage } from "../typings";
import { MyClient } from "../src/classes/Client";
import { RequestError } from "got/dist/source";
import { stripIndents } from "common-tags";

describe("Test utilities", () => {
  let msg: MockProxy<MyMessage>;
  let interaction: MockProxy<MyInteraction>;
  let client: MockProxy<MyClient>;

  beforeAll(() => {
    // @ts-ignore Possibly infinte
    msg = mockDeep<MyMessage>();
    // @ts-ignore Possibly infinte
    client = msg.client;
    interaction = mockDeep<MyInteraction>();
  });

  afterEach(() => {
    mockClear(msg);
    mockClear(interaction);
  });

  describe("Tests charSlicer", () => {
    it("Slices with specified amount", () => {
      const text = "Text";
      const newText = charSlicer(text, 3);
      expect(newText).toBe("...");
    });

    it("Should not slice", () => {
      const text = "Text";
      const newText = charSlicer(text);
      expect(newText).toBe(text);
    });
  });

  describe("Test charCounter", () => {
    it("Return true", () => {
      const res = charCounter("Text", 10);
      expect(res).toBe(true);
    });

    it("Return true: default", () => {
      const res = charCounter("Text");
      expect(res).toBe(true);
    });

    it("Returns false", () => {
      const res = charCounter("TextASAFAFSAFasfa", 1);
      expect(res).toBe(false);
    });

    it("Slices", () => {
      const res = charCounter("TextASAFAFSAFasfa", 3, true);
      expect(res).toBe("...");
    });

    it("Should not slice", () => {
      const text = "TextASAFAFSAFasfa";
      const res = charCounter(text, 50, true);
      expect(res).toBe(text);
    });
  });

  describe("Test getUserFromMention", () => {
    it("Returns User", () => {
      const expectedValue = "User Object";
      // @ts-expect-error
      client.users.cache.get.mockReturnValue(expectedValue);

      const res = getUserFromMention(msg, "<@!123>");
      expect(msg.client.users.cache.get).toBeCalledWith("123");
      expect(res).toBe(expectedValue);

      const res2 = getUserFromMention(msg, "<@123>");
      expect(msg.client.users.cache.get).toBeCalledWith("123");
      expect(res2).toBe(expectedValue);
    });

    it("Returns undefined", () => {
      const res = getUserFromMention(msg, "123");
      expect(res).toBe(undefined);
    });
  });

  describe("Test gotErrorHandler", () => {
    describe("Message", () => {
      it("Reply with response", async () => {
        const err = mockDeep<RequestError>({
          response: {
            statusCode: 404,
            body: "hello",
          } as unknown as Response,
          message: "Message",
        } as unknown as RequestError);

        const text = stripIndents`
                **There was an error!**
                \`HTTP StatusCode: ${err?.response?.statusCode}\n${
          err?.message
        }\`
                **Response Data:**\n\`${JSON.stringify(err?.response?.body)}\`
            `;

        await gotErrorHandler(msg, err);
        expect(msg.reply).toBeCalledWith(text);
      });

      it("Reply with request", async () => {
        const err = mockDeep<RequestError>({
          response: null,
          request: {},
          message: "Message",
        } as unknown as RequestError);

        const text = stripIndents`
                    There was an error!
                    \`Request made but no Response received
                    ${err.message}\`
                `;

        await gotErrorHandler(msg, err);
        expect(msg.reply).toBeCalledWith(text);
      });

      it("Reply with no req/res", async () => {
        const err = mockDeep<RequestError>({
          response: null,
          request: null,
          message: "Message",
          code: "code",
        } as unknown as RequestError);
        const text = `There was an error!\n\`${err.code} | ${err.message}\``;

        await gotErrorHandler(msg, err);
        expect(msg.reply).toBeCalledWith(text);
      });
    });

    describe("Interaction", () => {
      it("Reply with response", async () => {
        const err = mockDeep<RequestError>({
          response: {
            statusCode: 404,
            body: "hello",
          } as unknown as Response,
          message: "Message",
        } as unknown as RequestError);

        const text = stripIndents`
                **There was an error!**
                \`HTTP StatusCode: ${err?.response?.statusCode}\n${
          err?.message
        }\`
                **Response Data:**\n\`${JSON.stringify(err?.response?.body)}\`
            `;

        await gotErrorHandler(interaction, err);
        expect(interaction.reply).toBeCalledWith(text);
      });

      it("Reply with request", async () => {
        const err = mockDeep<RequestError>({
          response: null,
          request: {},
          message: "Message",
        } as unknown as RequestError);

        const text = stripIndents`
                    There was an error!
                    \`Request made but no Response received
                    ${err.message}\`
                `;

        await gotErrorHandler(interaction, err);
        expect(interaction.reply).toBeCalledWith(text);
      });

      it("Reply with no req/res", async () => {
        const err = mockDeep<RequestError>({
          response: null,
          request: null,
          message: "Message",
          code: "code",
        } as unknown as RequestError);
        const text = `There was an error!\n\`${err.code} | ${err.message}\``;

        await gotErrorHandler(interaction, err);
        expect(interaction.reply).toBeCalledWith(text);
      });
    });
  });

  it("Get random Hex", () => {
    const res = randomHex();
    expect(res.startsWith("#")).toBe(true);
  });

  it("Get random RGB Tuple", () => {
    const res = randomRGBTuple();
    expect(res).toStrictEqual([
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    ]);
  });

  it("Test checkNodeEnv", () => {
    expect(checkNodeEnv("test")).toBe(true);
    expect(checkNodeEnv("production")).toBe(false);
  });
});
