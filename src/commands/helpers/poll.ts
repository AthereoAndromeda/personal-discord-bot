import { oneLine } from "common-tags";
import {
  Collection,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";

export interface OptionData {
  id: number;
  element: string;
}

export interface OptionInfo {
  count: number;
  element: string;
  voters?: string[];
}

export function endPoll(
  fetchedInt: Message,
  embed: MessageEmbed,
  infoCollection: Collection<string, OptionInfo>
) {
  const totalVotes = infoCollection.reduce((acc, val) => acc + val.count, 0);

  for (const [id, info] of infoCollection) {
    const percentage = ((info.count / totalVotes) * 100).toFixed(2);
    const text = oneLine`
      **${info.count} ${info.count > 1 ? "votes" : "vote"}**
      | ${percentage}%
    `;

    embed.addField(`Choice ${id} | ${info.element}`, text);
  }

  embed.setFooter({ text: `Total Votes: ${totalVotes}` });
  fetchedInt.channel?.send({ embeds: [embed] });
  fetchedInt.delete();
}

export function getTopButtonArray(optionArr: OptionData[]) {
  const buttonArray: MessageButton[] = [];

  let style = 0;
  for (const el of optionArr) {
    // Alternates style
    if (style === 1) {
      style--;
    } else {
      style++;
    }

    const button = new MessageButton()
      .setCustomId(`top_${el.id}`)
      .setLabel(`Option ${el.id}`)
      .setStyle(style === 1 ? "PRIMARY" : "SECONDARY");

    buttonArray.push(button);
  }

  return buttonArray;
}

export const endRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("end")
    .setStyle("DANGER")
    .setLabel("End Poll")
    .setEmoji("\u2705") // ✅ | :white_check_mark:
);

export const baseEmbedBuilder = (title: string, text: string) =>
  new MessageEmbed().setColor("BLURPLE").setTitle(title).setDescription(text);

export const endEmbedBuilder = (title: string, description: string) =>
  new MessageEmbed()
    .setTitle(`**Poll Results** | ${title}`)
    .setDescription(description)
    .setColor("GREEN");
