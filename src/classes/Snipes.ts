import Collection from "@discordjs/collection";
import { Queue } from "./Queue";

export interface SnipeObject {
  authorId: string;
  content: string;
  /** Equivalent to `Date.now()` */
  timestamp: number;
}

export const snipes = new Collection<string, Queue<SnipeObject>>();
export const editSnipes = new Collection<string, Queue<SnipeObject>>();
