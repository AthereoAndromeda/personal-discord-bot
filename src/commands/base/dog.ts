import { MessageEmbed } from "discord.js";
import { RequestError } from "got/dist/source";
import { MyClient } from "src/classes/Client";
import { Command } from "../../../typings";
import { randomHex } from "../../utils";

interface APIResponse {
  message: string;
  status: string;
}

async function main(client: MyClient): Promise<MessageEmbed> {
  const data = await client.$got
    .get("api/breeds/image/random/", {
      prefixUrl: "https://dog.ceo/",
      http2: true,
      headers: {
        accept: "application/json",
      },
    })
    .json<APIResponse>();

  const embed = new MessageEmbed()
    .setDescription("Powered by [Dog API](https://dog.ceo/dog-api)")
    .setImage(data.message)
    .setColor(randomHex());

  return embed;
}

export default <Command>{
  data: {
    name: "dog",
    description: "Fetches and returns a dog picture.",
  },
  aliases: [],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  async executeMessage(message) {
    try {
      const embed = await main(message.client);
      message.channel.send({ embeds: [embed] });
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      const error = err as RequestError;
      if ("code" in error) {
        interaction.client.gotErrorHandler(interaction, error);
        return;
      }
      interaction.client.log.error(error);
    }
  },
};

