import {
  Message,
  ClientEvents,
  CommandInteraction,
  ApplicationCommandData,
} from "discord.js";
import { MyClient } from "../src/classes/Client";

export interface MyMessage extends Message {
  client: MyClient;
}

export interface MyInteraction extends CommandInteraction {
  client: MyClient;
}

/**
 * Command Interface of the bot
 */
export interface Command {
  data: ApplicationCommandData;
  aliases: string[];
  usage: string | null;
  cooldown: number;
  guildOnly: boolean;
  argsRequired: boolean;
  rolesRequired: Record<string, unknown>[];
  isDisabled?: boolean;
  /**
   * The actual command to be executed.
   * @param   message       Discord Message
   * @param   args          Arguments passed by user
   * */
  executeMessage(message: MyMessage, args: string[]): Promise<void> | void;
  executeInteraction(interaction: MyInteraction): Promise<void> | void;
}

export interface ReadyCommand {
  data: { name: string };
  isDisabled?: boolean;
  execute(client: MyClient): Promise<void> | void;
}

export interface EventHandler {
  name: keyof ClientEvents;
  type: "on" | "once";
  handler(...args: unknown): Promise<void> | void;
}
