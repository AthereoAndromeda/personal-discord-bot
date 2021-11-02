import { stripIndents } from "common-tags";
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { RequestError } from "got/dist/source";
import { DateTime } from "luxon";
import { MyClient } from "src/classes/Client";
import { Command } from "../../../typings";
import { charSlicer, randomHex } from "../../utils";
const { TIMEZONE = "UTC" } = process.env;
const timeout = 120 * 1000;
// Matches for words within brackets. ex: [Hello World]
const ud_links = /\[(\w| )+\]/gi;

interface ListData {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: string;
  example: string;
  thumbs_down: number;
}

interface APIResponse {
  list: ListData[];
}

/**
 * Converts Urban Dictionary Links into Discord-compatible ones
 * @param matches   Array of Urban Dictionary links
 * @param str       String to convert
 *
 * @returns String with Discord-compatible links
 */
function swapLinks(matches: RegExpMatchArray | null, str: string): string {
  matches = matches ? matches : [];

  if (matches.length) {
    for (const link of matches) {
      // Removes brackets surrounding word
      const linkWord = link.slice(1, -1);
      const regex = new RegExp(`\\[${linkWord}\\]`);

      // Replace spaces with '%20' for links
      const term = linkWord.replace(/ +/g, "%20");
      const embedLink = `[${linkWord}](https://www.urbandictionary.com/define.php?term=${term})`;
      str = str.replace(regex, embedLink);
    }
  }

  return str;
}

/**
 * Builds the Embed with the given Data
 * @param data  Response of Urban Dictionary
 *
 * @returns MessageEmbed of an Urban Dictionary Definition
 */
function buildEmbed(data: ListData) {
  const date = DateTime.fromISO(data.written_on)
    .setZone(TIMEZONE)
    .toFormat("yyyy LLL dd, t ZZZZ");

  const linkMatches = data.definition.match(ud_links);
  const exLinkMatches = data.example.match(ud_links);

  const definition = swapLinks(linkMatches, data.definition);
  const example = swapLinks(exLinkMatches, data.example);

  return new MessageEmbed()
    .setTitle(data.word)
    .setURL(data.permalink)
    .setAuthor("Author: " + data.author)
    .setColor(randomHex())
    .setDescription(charSlicer(definition))
    .addField("Example", charSlicer(example, 1024) || "No Example")
    .setFooter(
      // \u{1F44D} - 👍 | :thumbsup:
      // \u{1F44E} - 👎 | :thumbsdown:
      stripIndents`
        ${data.thumbs_up} \u{1F44D} | ${data.thumbs_down} \u{1F44E}
        Written on: ${date}
      `
    );
}

/**
 * Set up the listeners for message components (buttons)
 * @param int            Interaction to listen
 * @param definitions    Definitions of Urban Dictionary
 */
function setMessageComponentListeners(int: Message, definitions: ListData[]) {
  let position = 0;

  const prevCollector = int.createMessageComponentCollector({
    filter: i => i.customId === "prev",
    time: timeout,
  });

  const nextCollector = int.createMessageComponentCollector({
    filter: i => i.customId === "next",
    time: timeout,
  });

  prevCollector.on("collect", async i => {
    if (position > 0) {
      position--;

      const embed = buildEmbed(definitions[position]);
      await i.update({ embeds: [embed] });
    } else {
      await i.reply({ content: "Reached First Page", ephemeral: true });
    }
  });

  nextCollector.on("collect", async i => {
    if (position < definitions.length - 1) {
      position++;

      const embed = buildEmbed(definitions[position]);
      await i.update({ embeds: [embed] });
    } else {
      await i.reply({ content: "Reached Last Page", ephemeral: true });
    }
  });

  // Either collector works
  nextCollector.on("end", () => {
    int.edit({ components: [getRow(true)] });
  });
}

async function fetchData(client: MyClient, arg: string) {
  const data = await client.$got
    .get("v0/define", {
      prefixUrl: "https://api.urbandictionary.com/",
      http2: true,
      headers: {
        accept: "application/json",
      },
      searchParams: {
        term: arg,
      },
    })
    .json<APIResponse>();

  return data;
}

function getRow(isDisabled = false) {
  const previousButton = new MessageButton()
    .setCustomId("prev")
    .setLabel("Previous")
    .setStyle("SECONDARY")
    .setDisabled(isDisabled)
    .setEmoji("\u25C0"); // ◀️ | ◀ | :arrow_backward:

  const forwardButton = new MessageButton()
    .setCustomId("next")
    .setLabel("Next")
    .setStyle("PRIMARY")
    .setDisabled(isDisabled)
    .setEmoji("\u25B6"); // ▶️ | ▶ | :arrow_forward:

  return new MessageActionRow().addComponents(previousButton, forwardButton);
}

const row = getRow();

export default <Command>{
  data: {
    name: "ud",
    description: "Fetches a definition of the given term from Urban Dictionary",
    options: [
      {
        name: "term",
        description: "Term to search for",
        type: "STRING",
        required: true,
      },
    ],
  },
  aliases: ["urbandict", "udict"],
  usage: "<Search Term>",
  cooldown: 3,
  guildOnly: false,
  argsRequired: true,
  rolesRequired: [],
  async executeMessage(message, args) {
    try {
      const data = await fetchData(message.client, args.join(" "));

      if (!data.list.length) {
        message.channel.send("No Results Found!");
        return;
      }

      const embed = buildEmbed(data.list[0]);
      const msg = await message.channel.send({
        embeds: [embed],
        components: [row],
      });

      setMessageComponentListeners(msg, data.list);
    } catch (err) {
      const error = err as RequestError;
      if ("code" in error) {
        message.client.gotErrorHandler(message, error);
        return;
      }
      message.client.log.error(error);
    }
  },
  async executeInteraction(interaction) {
    try {
      const args = interaction.options.getString("term", true);
      const data = await fetchData(interaction.client, args);

      if (!data.list.length) {
        interaction.reply("No Results Found!");
        return;
      }

      const embed = buildEmbed(data.list[0]);
      const int = (await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      })) as Message;

      setMessageComponentListeners(int, data.list);
    } catch (err) {
      const error = err as RequestError;
      if ("code" in error) {
        interaction.client.gotErrorHandler(interaction, error);
        return;
      }
      interaction.client.log.error(error);
    }
  },
};
