/**
 * Tron validation (TRX and TRC-20 tokens such as USDT-TRC20).
 * Format: Base58Check, 21-byte payload with version byte 0x41 ('T' prefix).
 */
import { base58CheckDecode } from "../codecs/base58check";

export function isValidTronAddress(address: string): boolean {
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return false;
  const payload = base58CheckDecode(address);
  return payload !== null && payload.length === 21 && payload[0] === 0x41;
}
