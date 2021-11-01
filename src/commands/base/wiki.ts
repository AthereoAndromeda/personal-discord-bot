import { MessageEmbed } from "discord.js";
import { RequestError } from "got/dist/source";
import { MyClient } from "src/classes/Client";
import { Command } from "../../../typings";
import { randomHex, charSlicer } from "../../utils";

interface APIResponse {
  batchcomplete: string;
  query: {
    pages: {
      [id: string]: {
        pageid: number;
        ns: number;
        title: string;
        extract: string;
      };
    };
  };
}

async function main(client: MyClient, arg: string) {
  const data = await client.$got
    .get("w/api.php", {
      prefixUrl: "https://en.wikipedia.org/",
      http2: true,
      headers: {
        accept: "application/json",
      },
      searchParams: {
        action: "query",
        titles: arg,
        prop: "extracts",
        exintro: true,
        explaintext: true,
        format: "json",
      },
    })
    .json<APIResponse>();

  const [id] = Object.keys(data.query.pages);
  const wikiPage = data.query.pages[id];

  if (!wikiPage.extract) {
    const embed = new MessageEmbed()
      .setTitle("Not Found!")
      .setDescription("Try being more specific")
      .setColor(randomHex());

    return embed;
  }

  // Spaces are represented by underscore in Wikipedia pages
  const convertedTitle = wikiPage.title.replaceAll(/ +/g, "_");
  const wikiURL = `https://en.wikipedia.org/wiki/${convertedTitle}`;

  const embed = new MessageEmbed()
    .setTitle(wikiPage.title)
    .setColor(randomHex())
    .setURL(wikiURL)
    .setDescription(charSlicer(wikiPage.extract))
    .setFooter(
      "Wikipedia",
      "https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png"
    );

  return embed;
}

const command: Command = {
  data: {
    name: "wiki",
    description: "Fetches a Wikipedia page",
    options: [
      {
        name: "term",
        description: "Term to search for",
        type: "STRING",
        required: true,
      },
    ],
  },
  aliases: ["wikipedia"],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: true,
  rolesRequired: [],
  async executeMessage(message, args) {
    try {
      const embed = await main(message.client, args.join(" "));
      message.channel.send({ embeds: [embed] });
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
      const embed = await main(interaction.client, args);

      interaction.reply({ embeds: [embed] });
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

export default command;
