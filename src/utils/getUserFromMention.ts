import { User } from "discord.js";
import { MyMessage } from "typings";

/**
 * Gets a discord mention id and returns a Discord User
 * @param message Discord Message
 * @param mention Mention from message
 */
export function getUserFromMention(
  message: MyMessage,
  mention: string
): User | undefined {
  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return message.client.users.cache.get(mention);
  }
}

export default getUserFromMention;
