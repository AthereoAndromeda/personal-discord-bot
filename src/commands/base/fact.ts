import { Command } from "../../../typings";
import { randomHex, charSlicer } from "../../utils";
import { MessageEmbed } from "discord.js";
import { MyClient } from "src/classes/Client";
import { RequestError } from "got/dist/source";

interface APIResponse {
  id: string;
  text: string;
  source: string;
  source_url: string;
  language: "en" | "de";
  permalink: string;
}

async function main(client: MyClient) {
  const data = await client.$got
    .get("random.json", {
      prefixUrl: "https://uselessfacts.jsph.pl",
      http2: true,
      headers: {
        accept: "application/json",
      },
      searchParams: {
        language: "en",
      },
    })
    .json<APIResponse>();

  const embed = new MessageEmbed()
    .setTitle("Random Fact")
    .setColor(randomHex())
    .setURL(data.permalink)
    .setDescription(charSlicer(data.text, 2048))
    .setFooter(`Source: ${data.source}`);

  return embed;
}

const command: Command = {
  data: {
    name: "fact",
    description: "Fetches a random fact from the internet",
  },
  aliases: ["facts"],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  async executeMessage(message) {
    try {
      const embed = await main(message.client);
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
      const embed = await main(interaction.client);
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
