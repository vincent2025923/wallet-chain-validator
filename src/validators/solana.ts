/**
 * Solana validation (SOL and SPL tokens such as BONK, PENGU, TRUMP, FARTCOIN).
 * Format: base58-encoded 32-byte Ed25519 public key.
 */
import { base58Decode } from "../codecs/base58";

export function isValidSolanaAddress(address: string): boolean {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return false;
  const bytes = base58Decode(address);
  return bytes !== null && bytes.length === 32;
}
