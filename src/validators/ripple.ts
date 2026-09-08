/**
 * Ripple (XRP) validation.
 * Format: Base58Check with the Ripple alphabet, 25 bytes total,
 * version byte 0x00 ('r' prefix).
 */
import { base58Decode, RIPPLE_ALPHABET } from "../codecs/base58";
import { doubleSha256 } from "../hashes";

export function isValidRippleAddress(address: string): boolean {
  if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)) return false;

  const bytes = base58Decode(address, RIPPLE_ALPHABET);
  if (!bytes || bytes.length !== 25) return false;
  if (bytes[0] !== 0x00) return false;

  const payload = bytes.slice(0, 21);
  const checksum = bytes.slice(21);
  const expected = doubleSha256(payload);
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expected[i]) return false;
  }
  return true;
}
