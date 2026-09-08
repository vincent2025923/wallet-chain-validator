/**
 * Bech32 / Bech32m (BIP-173 / BIP-350) decoding for SegWit v0 and Taproot addresses.
 * Based on the public-domain reference implementation.
 */

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BECH32M_CONST = 0x2bc830a3;

const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values: number[]): number {
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) chk ^= GENERATOR[i]!;
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const high: number[] = [];
  const low: number[] = [];
  for (const c of hrp) {
    high.push(c.charCodeAt(0) >> 5);
    low.push(c.charCodeAt(0) & 31);
  }
  return [...high, 0, ...low];
}

/** Returns 1 for bech32, 2 for bech32m, 0 for invalid checksum. */
function verifyChecksum(hrp: string, data: number[]): number {
  const check = polymod([...hrpExpand(hrp), ...data]);
  if (check === 1) return 1;
  if (check === BECH32M_CONST) return 2;
  return 0;
}

function convertBits(
  data: number[],
  fromBits: number,
  toBits: number,
): number[] {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (const value of data) {
    if (value < 0 || value >> fromBits !== 0) throw new Error("invalid value");
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) !== 0) {
    throw new Error("invalid padding");
  }
  return ret;
}

export interface SegwitInfo {
  /** Witness version 0-16. */
  version: number;
  /** Witness program bytes. */
  program: Uint8Array;
  /** 1 = bech32 (SegWit v0), 2 = bech32m (v1+ / Taproot). */
  encoding: number;
}

/**
 * Decode a SegWit address for the given human-readable part (e.g. "bc", "ltc").
 * Returns null for any invalid address.
 */
export function segwitDecode(
  address: string,
  expectedHrp: string,
): SegwitInfo | null {
  // BIP-173: mixed case is invalid; uniform case is normalized to lowercase.
  if (address !== address.toLowerCase() && address !== address.toUpperCase()) {
    return null;
  }
  const lowered = address.toLowerCase();
  if (lowered.length > 90) return null;

  const pos = lowered.lastIndexOf("1");
  if (pos < 1 || pos + 7 > lowered.length) return null;

  const hrp = lowered.slice(0, pos);
  if (hrp !== expectedHrp) return null;

  const data: number[] = [];
  for (const ch of lowered.slice(pos + 1)) {
    const d = CHARSET.indexOf(ch);
    if (d === -1) return null;
    data.push(d);
  }

  const encoding = verifyChecksum(hrp, data);
  if (encoding === 0) return null;

  const payload = data.slice(0, -6);
  if (payload.length === 0) return null;
  const version = payload[0]!;
  if (version > 16) return null;

  // BIP-350: v0 must use bech32, v1+ must use bech32m.
  if (version === 0 && encoding !== 1) return null;
  if (version !== 0 && encoding !== 2) return null;

  let program: Uint8Array;
  try {
    program = new Uint8Array(convertBits(payload.slice(1), 5, 8));
  } catch {
    return null;
  }
  if (program.length < 2 || program.length > 40) return null;
  if (version === 0 && program.length !== 20 && program.length !== 32) {
    return null;
  }

  return { version, program, encoding };
}
