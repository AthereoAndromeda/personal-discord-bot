import { SnipeObject, snipes } from "../classes/Snipes";
import { EventHandler, MyMessage } from "../../typings";
import { Queue } from "../classes/Queue";

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
        snipes.set(message.channelId, new Queue<SnipeObject>());
        snipeQueue = snipes.get(message.channelId);
      }

      snipeQueue?.enqueue({
        content: message.content,
        authorId: message.author.id,
        timestamp: Date.now(),
      });

      if (snipeQueue?.length === parseInt(process.env.MAX_SNIPES ?? "10")) {
        snipeQueue.dequeue();
      }
    } catch (error) {
      message.client.log.error(error);
    }
  },
};
