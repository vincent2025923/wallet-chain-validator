/**
 * Base58Check: base58 payload + 4-byte double-SHA-256 checksum.
 * Used by Bitcoin, Litecoin, Dogecoin, Tron and Ripple.
 */
import { base58Decode } from "./base58";
import { doubleSha256 } from "../hashes";

/** Returns the decoded payload (checksum stripped), or null if invalid. */
export function base58CheckDecode(
  input: string,
  alphabet?: string,
): Uint8Array | null {
  const bytes = base58Decode(input, alphabet);
  if (!bytes || bytes.length < 5) return null;

  const payload = bytes.slice(0, bytes.length - 4);
  const checksum = bytes.slice(bytes.length - 4);
  const expected = doubleSha256(payload);
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expected[i]) return null;
  }
  return payload;
}
