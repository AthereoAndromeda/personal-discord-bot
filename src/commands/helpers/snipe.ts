import { MessageEmbed } from "discord.js";
import { randomHex } from "../../utils";
import { snipes, editSnipes } from "../../classes/Snipes";
import { MyClient } from "src/classes/Client";

export function main(
  client: MyClient,
  channelId: string,
  index: number | null,
  type: "snipe" | "editsnipe"
): MessageEmbed {
  const collection = type === "snipe" ? snipes : editSnipes;
  index = index ? index : 0;

  const queue = collection.get(channelId);
  const snipedObject = queue?.peek(index);
  const author = client.users.cache.get(snipedObject?.authorId ?? "");
  const channel = client.channels.cache.get(channelId);

  const embed = new MessageEmbed()
    .setAuthor(author?.tag ?? "Author not found", author?.displayAvatarURL())
    .setDescription(snipedObject?.content ?? "Content not found")
    .setColor(randomHex())
    .addFields(
      {
        name: "Channel",
        value: channel?.toString() ?? "Not Found",
        inline: true,
      },
      { name: "Index", value: index.toString(), inline: true }
    )
    .setTimestamp(snipedObject?.timestamp);

  return embed;
}

export function isIndexOverMaxSnipes(index?: number | null): boolean {
  if (!index) {
    return false;
  } else {
    return index >= parseInt(process.env.MAX_SNIPES ?? "10");
  }
}
