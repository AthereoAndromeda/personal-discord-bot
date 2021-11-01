import { ActivitiesOptions } from "discord.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production" | "test";
      DISCORD_TOKEN?: string;
      PREFIX?: string;
      IANA_TIMEZONE?: string;
      VERSES_WEBHOOK_ID?: string;
      VERSES_WEBHOOK_TOKEN?: string;
      OWNER_ID?: string;
      DATABASE_URL?: string;
      ACTIVITY_NAME?: string;
      ACTIVITY_TYPE?: ActivitiesOptions["type"];
      /** Maximum number of snipes to be stored */
      MAX_SNIPES?: string;
    }
  }
}

export {};
