import { oneLine, stripIndents } from "common-tags";
import {
  Collection,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { Command } from "../../../typings";

type OptionData = {
  id: number;
  element: string;
};

interface OptionInfo {
  count: number;
  element: string;
}

function endPoll(
  fetchedInt: Message,
  embed: MessageEmbed,
  info: Collection<string, OptionInfo>
) {
  const totalVotes = info.reduce((acc, val) => acc + val.count, 0);

  for (const [id, inf] of info) {
    const percentage = ((inf.count / totalVotes) * 100).toFixed(2);
    const text = oneLine`
            **${inf.count} ${inf.count > 1 ? "votes" : "vote"}**
            | ${percentage}%
        `;

    embed.addField(`Choice ${id} | ${inf.element}`, text);
  }

  embed.setFooter(`Total Votes: ${totalVotes}`);
  fetchedInt.channel?.send({ embeds: [embed] });
  fetchedInt.delete();
}

function getTopButtonArray(optionArr: OptionData[]) {
  const arr: MessageButton[] = [];

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

    arr.push(button);
  }

  return arr;
}

const endRow = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("end")
    .setStyle("DANGER")
    .setLabel("End Poll")
    .setEmoji("\u2705") // ✅ | :white_check_mark:
);

const command: Command = {
  data: {
    name: "poll",
    description: "Creates a poll",
    options: [
      {
        name: "title",
        description: "Title of the poll",
        type: "STRING",
        required: true,
      },
      {
        name: "description",
        description: "Description of the poll",
        type: "STRING",
        required: true,
      },
      {
        name: "option_1",
        description: "Option 1",
        type: "STRING",
        required: true,
      },
      {
        name: "option_2",
        description: "Option 2",
        type: "STRING",
        required: true,
      },
      {
        name: "option_3",
        description: "Option 3",
        type: "STRING",
        required: false,
      },
      {
        name: "option_4",
        description: "Option 4",
        type: "STRING",
        required: false,
      },
      {
        name: "option_5",
        description: "Option 5",
        type: "STRING",
        required: false,
      },
      {
        name: "single_vote",
        description: "Makes it so users to only have a single vote",
        type: "BOOLEAN",
        required: false,
      },
      {
        name: "timeout",
        description: "Timeout in seconds. (Default: 180s)",
        type: "INTEGER",
        required: false,
      },
    ],
  },
  aliases: [],
  usage: null,
  cooldown: 5,
  guildOnly: false,
  argsRequired: true,
  rolesRequired: [],
  async executeMessage(message) {
    message.reply({ content: "Use slash command version of poll" });
    return;
  },
  async executeInteraction(interaction) {
    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description", true);
    // const isSingleVote = interaction.options.getBoolean("single_vote");
    const timeout = interaction.options.getInteger("timeout") || 180;

    const info = new Collection<string, OptionInfo>();

    const text = stripIndents`
            ${description}
            The voting will end in **${timeout} seconds**
        `;

    const baseEmbed = new MessageEmbed()
      .setColor("BLURPLE")
      .setTitle(title)
      .setDescription(text);

    const endEmbed = new MessageEmbed()
      .setTitle(`**Poll Results** | ${title}`)
      .setDescription(description)
      .setColor("GREEN");

    const optionArray: OptionData[] = [];

    // Iterate over options 1 through 5
    for (let i = 1; i <= 5; i++) {
      const element = interaction.options.getString(`option_${i}`);
      // Null check since options might be out of order
      if (element !== null) {
        optionArray.push({ id: i, element });
      }
    }

    for (const { id, element } of optionArray) {
      baseEmbed.addField(`Option ${id}`, element);
    }

    console.log(optionArray);

    const topButtonArray = getTopButtonArray(optionArray);
    const topRow = new MessageActionRow().addComponents(...topButtonArray);
    const fetchedInt = (await interaction.reply({
      embeds: [baseEmbed],
      components: [topRow, endRow],
      fetchReply: true,
    })) as Message;

    const endPollCollector = fetchedInt.createMessageComponentCollector({
      filter: i => i.customId === "end",
      time: timeout * 1000,
    });

    endPollCollector.on("collect", i => {
      if (i.user.id !== interaction.user.id) {
        return;
      }

      endPollCollector.stop();
    });

    endPollCollector.on("end", () => {
      endPoll(fetchedInt, endEmbed, info);
    });

    // TODO Allow vote removal and prevent multiple votes
    for (const el of optionArray) {
      let count = 0;
      info.set(`${el.id}`, { count, element: el.element });

      const collector = fetchedInt.createMessageComponentCollector({
        filter: int => int.customId === `top_${el.id}`,
        time: timeout * 1000,
      });

      collector.on("collect", int => {
        console.log(int.user.tag);

        count++;
        info.set(`${el.id}`, { count, element: el.element });
        console.log(info);

        int.update(`Collected ${int.customId} from ${int.user.tag}`);
      });
    }
  },
};

export default command;
