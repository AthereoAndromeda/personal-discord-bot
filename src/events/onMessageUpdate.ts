import { editSnipes, SnipeObject } from "../classes/Snipes";
import { EventHandler, MyMessage } from "../../typings";
import { StaticQueue } from "../classes/StaticQueue";

export default <EventHandler>{
  name: "messageUpdate",
  type: "on",
  async handler(message: MyMessage) {
    if (message.author?.bot) return;

    try {
      let snipeQueue = editSnipes.get(message.channelId);

      if (!snipeQueue) {
        snipeQueue = new StaticQueue<SnipeObject>(
          parseInt(process.env.MAX_SNIPES ?? "10")
        );
        editSnipes.set(message.channelId, snipeQueue);
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
