import { stripIndents } from "common-tags";
import { Message, MessageEmbed } from "discord.js";
import { Command } from "typings";
import { randomHex } from "../../utils";
import { MyClient } from "../../classes/Client"

const buildError = (err: unknown) => stripIndents`
  **There was an error calculating the ping!**
  ${err}
`;

const initEmbed = new MessageEmbed()
  .setColor(randomHex())
  .setTitle("Calculating Ping...");

const buildEmbed = (client: MyClient, pingTime: number) => {
  const desc = stripIndents`
    Roundtrip Latency: **\`${pingTime}ms\`**
    Websocket Heartbeat: **\`${client.ws.ping}ms\`**
  `;

  const finalEmbed = new MessageEmbed()
    .setColor(randomHex())
    .setTitle(":ping_pong: **Pong!**")
    .setDescription(desc);

  return finalEmbed;
};

export default <Command>{
  data: {
    name: "ping",
    description: "Calculates bot ping time",
  },
  aliases: [],
  usage: null,
  cooldown: 3,
  guildOnly: false,
  argsRequired: false,
  rolesRequired: [],
  async executeMessage(message) {
    try {
      const sentMsg = await message.channel.send({ embeds: [initEmbed] });
      const pingTime = sentMsg.createdTimestamp - message.createdTimestamp;
      const finalEmbed = buildEmbed(message.client, pingTime);

      sentMsg.edit({ embeds: [finalEmbed] });
    } catch (err) {
      message.channel.send(buildError(err));
    }
  },
  async executeInteraction(interaction) {
    try {
      const sentMsg = (await interaction.reply({
        embeds: [initEmbed],
        fetchReply: true,
      })) as Message;
      const pingTime = sentMsg.createdTimestamp - interaction.createdTimestamp;
      const finalEmbed = buildEmbed(interaction.client, pingTime);

      sentMsg.edit({ embeds: [finalEmbed] });
    } catch (err) {
      interaction.reply(buildError(err));
    }
  },
};
