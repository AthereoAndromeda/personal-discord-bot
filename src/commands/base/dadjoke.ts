import { RequestError } from "got/dist/source";
import { MyClient } from "src/classes/Client";
import { Command } from "../../../typings";
import { charSlicer } from "../../utils";

async function main(client: MyClient): Promise<string> {
  const data = await client.$got
    .get("https://icanhazdadjoke.com/", {
      http2: true,
      headers: {
        accept: "text/plain",
      },
    })
    .text();

  const res = charSlicer(data, 2000);
  return res;
}

const command: Command = {
  data: {
    name: "dadjoke",
    description: "Fetches a dad joke from the internet",
  },
  aliases: ["djk", "dadjk"],
  usage: null,
  cooldown: 0,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  async executeMessage(message) {
    try {
      const data = await main(message.client);
      message.channel.send(data);
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
      const data = await main(interaction.client);
      interaction.reply(data);
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
