import { add, suite, complete, cycle } from "benny";
import { StaticQueue } from "../../src/classes/StaticQueue";

const q1 = new StaticQueue(3);
const q2 = new StaticQueue(3);
q2.enQueue(3);

export default suite(
  "StaticQueue",

  add("Enqueue", () => {
    q1.enQueue(2);
  }),
  add("Dequeue", () => {
    q2.deQueue();
  }),
  add("Peek", () => {
    q1.peek();
  }),
  add("BackPeek", () => {
    q1.backPeek();
  }),

  cycle(),
  complete()
);
