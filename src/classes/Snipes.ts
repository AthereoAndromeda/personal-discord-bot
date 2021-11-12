import Collection from "@discordjs/collection";
import { StaticQueue } from "./StaticQueue";

export interface SnipeObject {
  authorId: string;
  content: string;
  /** Equivalent to `Date.now()` */
  timestamp: number;
}

export const snipes = new Collection<string, StaticQueue<SnipeObject>>();
export const editSnipes = new Collection<string, StaticQueue<SnipeObject>>();
