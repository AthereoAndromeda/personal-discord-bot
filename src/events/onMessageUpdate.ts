import { editSnipes } from "../classes/Snipes";
import { EventHandler, MyMessage } from "../../typings";
import { storeSnipe } from "../helpers/storeSnipe";

export default <EventHandler>{
  name: "messageUpdate",
  type: "on",
  async handler(message: MyMessage) {
    if (message.author?.bot) return;

    try {
      storeSnipe(message, editSnipes);
    } catch (error) {
      message.client.log.error(error);
    }
  },
};
