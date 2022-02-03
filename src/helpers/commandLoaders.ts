import { Collection } from "discord.js";
import fsp from "fs/promises";
import path from "path";
import { MyClient } from "src/classes/Client";
import { EventHandler } from "typings";

/**
 * Imports and sets commands inside a Collection
 * @param dirPath Path of `command` directory
 * @param collection Command Collection
 * @returns Command Collection for convenience
 */
export async function setCommandsInCollection<K, V>(
  dirPath: string,
  collection: Collection<K, V>
) {
  const files = await fsp.readdir(dirPath);

  for (const file of files) {
    const commandPath = path.resolve(dirPath, file);
    const command = (await import(commandPath)).default;

    if (command.isDisabled) {
      continue;
    }

    collection.set(command.data.name, command);
  }

  // Return for convenience
  return collection;
}

/**
 * Attaches and sets Event Handlers to the Client
 * @param dirPath Path of `event` directory
 * @param client Client to attach events to
 */
export async function setEventHandlers(dirPath: string, client: MyClient) {
  const files = await fsp.readdir(dirPath);

  for (const file of files) {
    const eventPath = path.resolve(dirPath, file);
    const event: EventHandler = (await import(eventPath)).default;

    // Either client.on() or client.once()
    client[event.type](event.name, (...args) => event.handler(...args));
  }
}
