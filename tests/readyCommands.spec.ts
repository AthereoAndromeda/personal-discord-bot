/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReadyCommand } from "../typings";
import { mockClear, mockDeep } from "jest-mock-extended";
import { DeepMockProxy } from "jest-mock-extended/lib/Mock";
import { MyClient } from "../src/classes/Client";
import "jest-extended";

describe.skip("Test ready Commands", () => {
  let mockClient: DeepMockProxy<MyClient>;

  beforeAll(() => {
    // @ts-ignore possibly deep instantiation
    mockClient = mockDeep<MyClient>();
  });

  afterEach(() => {
    mockClear(mockClient);
  });

  describe("Test sendVerses", () => {
    let command: ReadyCommand;

    beforeAll(async () => {
      command = (await import("../src/commands/ready/sendVerses")).default;
    });

    beforeEach(() => {
      // @ts-ignore AND recursive
      mockClient.db.verse.findUnique.mockResolvedValue({
        content: "Verse",
        title: "woah",
        id: 1,
      });
    });

    // TODO Attach Luxon to client
    it("Sends verse", async () => {
      command.execute(mockClient);
      jest.runOnlyPendingTimers();

      expect(mockClient.verseWebhook.send).toBeCalled();
    });
  });
});
