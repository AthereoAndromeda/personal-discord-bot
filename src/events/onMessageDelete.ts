import { snipes } from "../classes/Snipes";
import { EventHandler, MyMessage } from "../../typings";
import { storeSnipe } from "../helpers/storeSnipe"

export default <EventHandler>{
  name: "messageDelete",
  type: "on",
  async handler(message: MyMessage) {
    // Prevent's caching its own and other bots deleted messages
    if (message.author?.bot) return;

    // Saves Deleted messages in database for `snipe` command.
    try {
      storeSnipe(message, snipes);
    } catch (error) {
      message.client.log.error(error);
    }
  },
};
