import { stripIndents } from "common-tags";
import {
  Collection,
  Message,
  MessageActionRow,
  MessageEmbed,
} from "discord.js";
import { Command } from "../../../typings";
import {
  endPoll,
  endRow,
  getTopButtonArray,
  OptionData,
  OptionInfo,
} from "../helpers/poll";

export default <Command>{
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
  executeMessage(message) {
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
      baseEmbed.addField(`__Option ${id}__`, element);
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
        i.reply({
          content: `<@!${i.user.id}>, Only the poll owner can end the poll early!`,
          ephemeral: true,
        });

        return;
      }

      endPollCollector.stop();
    });

    endPollCollector.on("end", () => {
      endPoll(fetchedInt, endEmbed, info);
    });

    // TODO Allow vote removal and prevent multiple votes
    for (const option of optionArray) {
      let count = 0;
      const voters: string[] = [];
      info.set(`${option.id}`, { count, element: option.element, voters });

      const collector = fetchedInt.createMessageComponentCollector({
        filter: int => int.customId === `top_${option.id}`,
        time: timeout * 1000,
      });

      collector.on("collect", int => {
        console.log(int.user.tag);

        count++;
        voters.push(int.user.id);
        info.set(`${option.id}`, { count, element: option.element, voters });

        console.log(info);

        int.update(`Collected ${int.customId} from ${int.user.tag}`);
      });
    }
  },
};
