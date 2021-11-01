import winston, { Logger } from "winston";
import got, { Got, RequestError } from "got";
import { gotErrorHandler } from "../utils";
import { PrismaClient } from "@prisma/client";
import { Command, MyInteraction, MyMessage, ReadyCommand } from "typings";
import { Client, ClientOptions, Collection, WebhookClient } from "discord.js";
import {
  bgGreen,
  bgRed,
  bgYellow,
  blackBright,
  bold,
  gray,
  green,
  red,
  yellow,
} from "colorette";
import { oneLine } from "common-tags";

interface MyClientOptions extends ClientOptions {
  db: PrismaClient;
}

export class MyClient extends Client {
  private _commands!: Collection<Command["data"]["name"], Command>;
  private _readyCommands!: Collection<string, ReadyCommand>;
  private _prefixes = new Collection<string, string>();
  private _db: PrismaClient;

  constructor(options: MyClientOptions) {
    super(options);
    this._db = options.db;
  }

  public setCommands(commands: Collection<string, Command>): void {
    this._commands = commands;
  }

  public setReadyCommands(commands: Collection<string, ReadyCommand>): void {
    this._readyCommands = commands;
  }

  public async gotErrorHandler(
    instance: MyMessage | MyInteraction,
    err: RequestError
  ): Promise<void> {
    return gotErrorHandler(instance, err);
  }

  public get prefixes() {
    return this._prefixes;
  }

  public get commands(): Collection<string, Command> {
    return this._commands;
  }

  public get readyCommands(): Collection<string, ReadyCommand> {
    return this._readyCommands;
  }

  public get db(): PrismaClient {
    return this._db;
  }

  public get verseWebhook(): WebhookClient {
    if (!process.env.VERSES_WEBHOOK_ID || !process.env.VERSES_WEBHOOK_TOKEN) {
      throw new Error("Envs not found!");
    }

    return new WebhookClient({
      token: process.env.VERSES_WEBHOOK_TOKEN,
      id: process.env.VERSES_WEBHOOK_ID,
    });
  }

  /* Third-Party Libraries */

  /** Alias for `db` */
  public get $prisma(): PrismaClient {
    return this._db;
  }

  public get $got(): Got {
    return got;
  }

  public get log(): Logger {
    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        log => oneLine`
                    ${log.timestamp} [${log.level.toUpperCase()}]:
                    ${log.message}
                `
      )
    );

    const consoleFormat = winston.format.combine(
      winston.format.label({ label: "console" }),
      winston.format.timestamp(),
      winston.format.printf(({ message, level, timestamp }) => {
        const lvl = level.toUpperCase();
        switch (lvl) {
          case "INFO":
            message = green(message);
            level = bold(bgGreen(blackBright(`[${lvl}]`)));
            break;

          case "WARN":
            message = yellow(message);
            level = bold(bgYellow(blackBright(`[${lvl}]`)));
            break;

          case "ERROR":
            message = red(message);
            level = bold(bgRed(blackBright(`[${lvl}]`)));
            break;
        }

        return `${gray(timestamp)} ${level} ${message}`;
      })
    );

    return winston.createLogger({
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        new winston.transports.File({
          filename: "combined.log",
          dirname: "logs",
          format: fileFormat,
        }),
        new winston.transports.File({
          filename: "error.log",
          dirname: "logs",
          level: "error",
          format: fileFormat,
        }),
      ],
    });
  }
}
