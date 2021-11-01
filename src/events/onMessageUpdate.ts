import { editSnipes, SnipeObject } from "../classes/Snipes";
import { EventHandler, MyMessage } from "../../typings";
import { Queue } from "../classes/Queue";

export default <EventHandler>{
  name: "messageUpdate",
  type: "on",
  async handler(message: MyMessage) {
    if (message.author?.bot) return;

    try {
      let snipeQueue = editSnipes.get(message.channelId);

      if (!snipeQueue) {
        editSnipes.set(message.channelId, new Queue<SnipeObject>());
        snipeQueue = editSnipes.get(message.channelId);
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
