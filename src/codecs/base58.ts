/**
 * Base58 codec (Bitcoin alphabet by default, Ripple alphabet supported).
 * Decoding only — this package validates, it does not generate addresses.
 */

const BTC_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export const RIPPLE_ALPHABET =
  "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz";

export function base58Decode(
  input: string,
  alphabet: string = BTC_ALPHABET,
): Uint8Array | null {
  if (!input) return null;

  const charValue = new Map<string, number>();
  for (let i = 0; i < alphabet.length; i++) {
    charValue.set(alphabet[i]!, i);
  }

  let num = 0n;
  for (const ch of input) {
    const v = charValue.get(ch);
    if (v === undefined) return null;
    num = num * 58n + BigInt(v);
  }

  // Leading zero bytes are encoded as leading '1' (alphabet[0]) characters.
  let zeros = 0;
  for (const ch of input) {
    if (ch === alphabet[0]) zeros++;
    else break;
  }

  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }

  return new Uint8Array([...new Array(zeros).fill(0), ...bytes]);
}
