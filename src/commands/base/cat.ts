import { MessageEmbed } from "discord.js";
import { RequestError } from "got/dist/source";
import { MyClient } from "src/classes/Client";
import { Command } from "../../../typings";
import { randomHex } from "../../utils";

interface APIResponse {
  file: string;
}

async function main(client: MyClient) {
  const data = await client.$got
    .get("meow", {
      prefixUrl: "https://aws.random.cat/",
      http2: true,
      headers: {
        accept: "application/json",
      },
    })
    .json<APIResponse>();

  const embed = new MessageEmbed()
    .setImage(data.file)
    .setDescription("Powered by [Random Cat API](https://aws.random.cat)")
    .setColor(randomHex());

  return embed;
}

const command: Command = {
  data: {
    name: "cat",
    description: "Sends a cat picture",
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

export default command;
