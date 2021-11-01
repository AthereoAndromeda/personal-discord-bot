import { Command } from "../../../typings";
import { randomHex } from "../../utils";
import { MessageEmbed, TextChannel } from "discord.js";
import { MyClient } from "src/classes/Client";
import { RequestError } from "got/dist/source";

interface APIResponse {
  url: string;
}

async function main(
  client: MyClient,
  category: string | null,
  isNSFW: boolean
) {
  const link = `/${category ? category.toLowerCase() : "waifu"}`;

  const data = await client.$got
    .get((isNSFW ? "nsfw" : "sfw") + link, {
      prefixUrl: `https://api.waifu.pics/`,
      http2: true,
      headers: {
        accept: "application/json",
      },
    })
    .json<APIResponse>();

  const embed = new MessageEmbed().setImage(data.url).setColor(randomHex());

  return embed;
}

export default <Command>{
  data: {
    name: "waifu",
    description:
      "Fetches a random waifu pic via waifu.pics API. Find more categories there.",
    options: [
      {
        name: "category",
        type: "STRING",
        description: "Category of waifu",
        required: false,
      },
      {
        name: "nsfw",
        type: "BOOLEAN",
        description: "Not Safe For Work",
        required: false,
      },
    ],
  },
  aliases: [],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  async executeMessage(message, args) {
    try {
      const embed = await main(message.client, args[0], false);
      message.channel.send({ embeds: [embed] });
    } catch (err) {
      const error = err as RequestError;
      if ("code" in error) {
        if (error?.response?.statusCode === 404) {
          message.channel.send("Invalid Category");
        } else {
          message.client.gotErrorHandler(message, error);
        }
        return;
      }
      message.client.log.error(error);
    }
  },
  async executeInteraction(interaction) {
    try {
      const arg = interaction.options.getString("category");
      const isNSFW = interaction.options.getBoolean("nsfw");
      const channel = interaction.channel as TextChannel;

      if (isNSFW && !channel.nsfw) {
        interaction.reply({
          content: "You can only use this command in NSFW channels!",
          ephemeral: true,
        });
        return;
      }

      const embed = await main(interaction.client, arg, isNSFW || false);
      interaction.reply({ embeds: [embed] });
    } catch (err) {
      const error = err as RequestError;
      if ("code" in error) {
        if (error?.response?.statusCode === 404) {
          await interaction.reply({content: "Invalid Category", ephemeral: true});
        } else {
          interaction.client.gotErrorHandler(interaction, error);
        }
        return;
      }
      interaction.client.log.error(error);
    }
  },
};
