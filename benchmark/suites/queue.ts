import { add, suite, complete, cycle } from "benny";
import { Queue } from "../../src/classes/Queue";

const q1 = new Queue();
const q2 = new Queue([1]);

export default suite(
  "Queue",
  add("Enqueue", () => {
    q1.enqueue(2);
  }),
  add("Dequeue", () => {
    q2.dequeue();
  }),
  cycle(),
  complete()
);
