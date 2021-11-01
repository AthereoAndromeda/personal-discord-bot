import { DateTime } from "luxon";
import { ReadyCommand } from "../../../typings";
import { randomHex } from "../../utils";

const { VERSES_WEBHOOK_ID, VERSES_WEBHOOK_TOKEN, IANA_TIMEZONE } = process.env;

if (!VERSES_WEBHOOK_ID || !VERSES_WEBHOOK_TOKEN || !IANA_TIMEZONE) {
  throw new Error("Webhook Token or ID not found!");
}

let isSent = false;
const command: ReadyCommand = {
  name: "sendverses",
  execute(client) {
    setInterval(async () => {
      const date = DateTime.now().setZone(IANA_TIMEZONE);

      if (date.hour === 8 && !isSent) {
        const verses = await client.db.verse.findUnique({
          where: {
            id: date.day,
          },
        });

        try {
          await client.verseWebhook.send({
            embeds: [
              {
                title: verses?.title,
                description: verses?.content,
                color: randomHex(),
              },
            ],
          });
        } catch (error) {
          client.log.error("Unable to execute verse webhook!");
          client.log.error(error);
        }

        isSent = true;
        setTimeout(() => (isSent = false), 3630 * 1000);
      }
    }, 60 * 1000);
  },
};

export default command;
