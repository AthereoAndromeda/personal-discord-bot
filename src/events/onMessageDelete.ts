import { SnipeObject, snipes } from "../classes/Snipes";
import { EventHandler, MyMessage } from "../../typings";
import { StaticQueue } from "../classes/StaticQueue";

export default <EventHandler>{
  name: "messageDelete",
  type: "on",
  async handler(message: MyMessage) {
    // Prevent's caching its own and other bots deleted messages
    if (message.author?.bot) return;

    // Saves Deleted messages in database for `snipe` command.
    try {
      let snipeQueue = snipes.get(message.channelId);

      if (!snipeQueue) {
        snipeQueue = new StaticQueue<SnipeObject>(
          parseInt(process.env.MAX_SNIPES ?? "10")
        );
        snipes.set(message.channelId, snipeQueue);
      }

      snipeQueue.enQueue({
        content: message.content,
        authorId: message.author.id,
        timestamp: Date.now(),
      });

      if (snipeQueue.isFull) {
        snipeQueue.deQueue();
      }
    } catch (error) {
      message.client.log.error(error);
    }
  },
};
