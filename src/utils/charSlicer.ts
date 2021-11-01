/**
 * Checks Length of string. If over max, it shortens it and adds trailing ellipses.
 * @param str   String to check character amount.
 * @param max   Maximum amount of characters. Defaults to 2048.
 */
export function charSlicer(str: string, max = 2048): string {
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}

export default charSlicer;
