import { HexColorString } from "discord.js";

/**
 * Creates a random hexadecimal value. Used to randomize Discord Embed Colors.
 * @returns Hex String
 */
export function randomHex(): HexColorString {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}
