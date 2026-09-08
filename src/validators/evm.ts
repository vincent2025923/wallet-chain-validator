/**
 * EVM address validation (Ethereum and every EVM-compatible chain:
 * ERC20, BEP20, Polygon, Arbitrum, Optimism, Avalanche C-Chain, Base, Manta...).
 *
 * All EVM chains share the same 20-byte hex format, so one validator covers
 * every token on every EVM network — including SHIB, PEPE, ONDO, etc.
 *
 * Checksum rule (EIP-55): enforced only when the address contains both
 * upper- and lowercase hex letters; all-lower/all-upper forms pass.
 */
import { keccak256Hex } from "../hashes";

export function isValidEvmAddress(address: string): boolean {
  if (!/^0[xX][0-9a-fA-F]{40}$/.test(address)) return false;

  const hex = address.slice(2);
  if (hex === hex.toLowerCase() || hex === hex.toUpperCase()) return true;

  const hash = keccak256Hex(hex.toLowerCase());
  for (let i = 0; i < 40; i++) {
    const c = hex[i]!;
    if (c >= "0" && c <= "9") continue;
    const nibble = parseInt(hash[i]!, 16);
    const shouldBeUpper = nibble >= 8;
    const isUpper = c === c.toUpperCase();
    if (shouldBeUpper !== isUpper) return false;
  }
  return true;
}
