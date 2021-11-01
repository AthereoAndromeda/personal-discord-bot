import { Collection } from "discord.js";
import { Command, EventHandler, MyMessage } from "../../typings";
import { stripIndents } from "common-tags";

const cooldowns = new Collection<string, Collection<string, number>>();

// Exported for testing
export function isValidMessage(message: MyMessage, prefix: string): boolean {
  const invalidMsg =
    message.author?.bot ||
    !message.content.slice(0, prefix.length).toLowerCase().startsWith(prefix);

  if (invalidMsg) {
    return false;
  } else {
    return true;
  }
}

type ParseCommandReturn = {
  command: Command;
  args: string[];
};

export function parseCommand(
  message: MyMessage,
  prefix: string
): ParseCommandReturn | undefined {
  const { client } = message;
  const args = message.content.slice(prefix.length).trim().split(/ +/g);

  const commandName = args.shift()?.toLowerCase();

  // Occurs if only prefix is typed without a command.
  if (!commandName) {
    const msg = stripIndents`
      You need to supply a command, not just the prefix dummy.
      Try \`${prefix}help\`
    `;

    message.channel.send(msg);
    return undefined;
  }

  const command =
    client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases.includes(commandName));

  if (!command) return undefined;

  return { command, args };
}

export function isGuildOnlyCheck(
  message: MyMessage,
  command: Command,
  prefix: string
): boolean {
  if (command.guildOnly && message.channel.type !== "GUILD_TEXT") {
    const reply = `\`${prefix}${command.data.name}\` only works for servers.`;
    message.reply(reply);
    return false;
  } else {
    return true;
  }
}

export function isArgsRequiredCheck(
  message: MyMessage,
  command: Command,
  args: string[],
  prefix: string
): boolean {
  if (command.argsRequired && !args.length) {
    const usage = command.usage
      ? `\nUsage: \`${prefix}${command.data.name} ${command.usage}\``
      : "";

    const reply = `**Args required!**${usage}`;
    message.channel.send(reply);
    return false;
  } else {
    return true;
  }
}

export default <EventHandler>{
  name: "messageCreate",
  type: "on",
  async handler(message: MyMessage) {
    const prefix = message.client.prefixes.get(message.guildId || "") ?? "";

    if (!isValidMessage(message, prefix)) {
      return;
    }

    const parsedCommand = parseCommand(message, prefix);
    if (!parsedCommand) {
      return;
    }

    const { command, args } = parsedCommand;

    if (!isGuildOnlyCheck(message, command, prefix)) {
      return;
    }

    if (!isArgsRequiredCheck(message, command, args, prefix)) {
      return;
    }

    // Sets cooldown for each command
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection<string, number>());
    }

    const now = Date.now();
    // Records the time command was called
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = command.cooldown * 1000;

    if (!timestamps) {
      throw new Error("Timestamps not found for some reason");
    }

    if (timestamps.has(message.author.id)) {
      const expirationTime =
        (timestamps.get(message.author.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        const timeLeftToFixed = timeLeft.toFixed(1);
        const text = stripIndents`
                    Please wait **${timeLeftToFixed}** more second(s) before reusing
                    the \`${command.data.name}\` command.
                `;

        message.channel.send(text);
        return;
      }
    }

    // Executes the Command
    try {
      await command.executeMessage(message, args);
      // Set Cooldown.
      // If cooldown is 0, it will not set since it is instantaneous.
      // I think this makes it less expensive to run though I may be wrong
      if (cooldownAmount !== 0) {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      }
    } catch (error) {
      console.error(error);
      message.channel.send(
        `There was an error executing the command!\n\`${error}\``
      );
    }
  },
};
