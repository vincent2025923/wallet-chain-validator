/**
 * Synchronous hash primitives.
 *
 * Web Crypto's `crypto.subtle` is async and has no keccak, so we vendor
 * battle-tested pure-JS implementations instead (js-sha256 / js-sha3).
 */
import { sha256 } from "js-sha256";
import { keccak256 } from "js-sha3";

/** Double SHA-256, as used by Base58Check. */
export function doubleSha256(bytes: Uint8Array): Uint8Array {
  const once = sha256.array(bytes);
  return new Uint8Array(sha256.array(once));
}

/** keccak-256 (pre-NIST padding, the Ethereum variant) of a UTF-8 string, hex-encoded. */
export function keccak256Hex(input: string): string {
  return keccak256(input);
}
