/**
 * Creates a random RGB Tuple with numbers from `0` to `255`
 * @returns RGB Tuple
 */
export function randomRGBTuple(): [number, number, number] {
  return [
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
  ];
}

export default randomRGBTuple;
