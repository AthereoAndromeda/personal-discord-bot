import Collection from "@discordjs/collection";
import { StaticQueue } from "./StaticQueue";

export type SnipeCollection = Collection<string, StaticQueue<SnipeObject>>;
export interface SnipeObject {
  authorId: string;
  content: string;
  /** Equivalent to `Date.now()` */
  timestamp: number;
}

export const snipes: SnipeCollection = new Collection();
export const editSnipes: SnipeCollection = new Collection();
