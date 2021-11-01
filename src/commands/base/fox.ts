import { MessageEmbed } from "discord.js";
import { randomHex } from "../../utils";
import { Command } from "typings";
import { MyClient } from "src/classes/Client";
import { RequestError } from "got/dist/source";

interface APIResponse {
  link: string;
  image: string;
}

async function main(client: MyClient) {
  const data = await client.$got
    .get("floof", {
      prefixUrl: "https://randomfox.ca/",
      http2: true,
      headers: {
        accept: "application/json",
      },
    })
    .json<APIResponse>();

  const embed = new MessageEmbed()
    .setImage(data.image)
    .setColor(randomHex())
    .setDescription("Powered by [Random Fox API](https://randomfox.ca)");

  return embed;
}

export default <Command>{
  data: {
    name: "fox",
    description: "Fetches a random fox via Random Fox API",
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

