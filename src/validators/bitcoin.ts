/**
 * Bitcoin-family validation: Base58Check (P2PKH / P2SH) and
 * SegWit (bech32 v0 / bech32m Taproot) with per-coin parameters.
 */
import { base58CheckDecode } from "../codecs/base58check";
import { segwitDecode } from "../codecs/bech32";

export interface BitcoinFamilyParams {
  /** Version bytes for pay-to-pubkey-hash addresses (leading '1' on mainnet). */
  pubkeyHash: number[];
  /** Version bytes for pay-to-script-hash addresses (leading '3' on mainnet). */
  scriptHash: number[];
  /** Bech32 human-readable part for SegWit/Taproot, if supported. */
  bech32Hrp?: string;
}

export const BITCOIN: BitcoinFamilyParams = {
  pubkeyHash: [0x00],
  scriptHash: [0x05],
  bech32Hrp: "bc",
};

export const LITECOIN: BitcoinFamilyParams = {
  pubkeyHash: [0x30],
  scriptHash: [0x32],
  bech32Hrp: "ltc",
};

export const DOGECOIN: BitcoinFamilyParams = {
  pubkeyHash: [0x1e],
  scriptHash: [0x16],
};

export function isValidBitcoinFamilyAddress(
  address: string,
  p: BitcoinFamilyParams,
): boolean {
  const addr = address.trim();
  if (addr.length < 26 || addr.length > 90) return false;

  // SegWit / Taproot branch
  if (p.bech32Hrp && addr.toLowerCase().startsWith(p.bech32Hrp + "1")) {
    return segwitDecode(addr, p.bech32Hrp) !== null;
  }

  // Base58 branch
  if (addr.length > 35) return false;
  if (/[0OIl]/.test(addr)) return false; // not in the base58 alphabet
  const payload = base58CheckDecode(addr);
  if (!payload || payload.length !== 21) return false;
  const version = payload[0]!;
  return p.pubkeyHash.includes(version) || p.scriptHash.includes(version);
}
