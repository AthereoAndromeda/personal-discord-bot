import tap from "tap";
import { charSlicer } from "../src/utils/charSlicer";

tap.test("charSlicer", t => {
  const a = charSlicer("dog", 10);
  const b = charSlicer("12345", 3);
  const c = charSlicer("haha");

  t.equal(a, "dog");
  t.equal(b, "...");
  t.equal(c, "haha");

  t.end();
});
