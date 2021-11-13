import type { MyMessage } from "../../typings";
import type { Collection } from "discord.js";
import type { SnipeCollection } from "../classes/Snipes";
import { StaticQueue } from "../classes/StaticQueue";

const maxSnipes = parseInt(process.env.MAX_SNIPES ?? "10");

export function storeSnipe(
  message: MyMessage,
  snipeCollection: SnipeCollection,
) {
  let snipeQueue = snipeCollection.get(message.channelId);

  if (!snipeQueue) {
    snipeQueue = new StaticQueue(maxSnipes);
    snipeCollection.set(message.channelId, snipeQueue);
  }

  if (snipeQueue.isFull) {
    snipeQueue.deQueue();
  }

  snipeQueue.enQueue({
    content: message.content,
    authorId: message.author.id,
    timestamp: message.createdTimestamp
  });
}
