import { describe, it, expect } from "vitest";
import {
  validate,
  validateByChain,
  detectChain,
  isValidEvmAddress,
  isValidTronAddress,
  isValidSolanaAddress,
  isValidRippleAddress,
} from "../src";

/** Invert the case of every letter — deterministically breaks EIP-55 checksums. */
const invertHexCase = (s: string) =>
  "0x" +
  s
    .slice(2)
    .split("")
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");

describe("EVM", () => {
  // Canonical examples from the EIP-55 specification itself.
  const valid = [
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
    "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
    "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
  ];

  it.each(valid)("accepts EIP-55 checksummed address %s", (addr) => {
    expect(isValidEvmAddress(addr)).toBe(true);
  });

  it("accepts all-lowercase and all-uppercase (no checksum enforced)", () => {
    expect(isValidEvmAddress(valid[0]!.toLowerCase())).toBe(true);
    expect(isValidEvmAddress(valid[0]!.toUpperCase())).toBe(true);
  });

  it("rejects a broken EIP-55 checksum", () => {
    expect(isValidEvmAddress(invertHexCase(valid[0]!))).toBe(false);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEvmAddress("0x123")).toBe(false);
    expect(isValidEvmAddress("0x" + "a".repeat(41))).toBe(false);
    expect(isValidEvmAddress("0x" + "g".repeat(40))).toBe(false);
    expect(isValidEvmAddress("5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toBe(
      false,
    );
  });
});

describe("Bitcoin family", () => {
  const genesis = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"; // P2PKH
  const p2sh = "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy";
  const segwitV0 = "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"; // BIP-173
  const taproot = "bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0"; // BIP-350
  const testnetHrp = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"; // BIP-173

  it.each([genesis, p2sh, segwitV0, taproot])("accepts %s", (addr) => {
    expect(validateByChain(addr, "bitcoin")).toBe(true);
  });

  it("rejects tampered Base58Check (checksum failure)", () => {
    expect(validateByChain(genesis.slice(0, -1) + "b", "bitcoin")).toBe(false);
    expect(validateByChain(p2sh.slice(0, -2) + "zz", "bitcoin")).toBe(false);
  });

  it("rejects a wrong checksum in bech32", () => {
    expect(validateByChain(segwitV0.slice(0, -1) + "5", "bitcoin")).toBe(false);
  });

  it("rejects other networks' hrp", () => {
    expect(validateByChain(testnetHrp, "bitcoin")).toBe(false);
  });

  it("rejects a Bitcoin address as Litecoin", () => {
    expect(validateByChain(genesis, "litecoin")).toBe(false);
  });
});

describe("Tron", () => {
  // USDT TRC-20 contract address on Tron mainnet.
  const usdtTrc20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

  it("accepts a valid Tron address", () => {
    expect(isValidTronAddress(usdtTrc20)).toBe(true);
  });

  it("rejects tampered and non-Tron addresses", () => {
    expect(isValidTronAddress(usdtTrc20.slice(0, -1) + "u")).toBe(false);
    expect(isValidTronAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toBe(
      false,
    );
    expect(isValidTronAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4")).toBe(
      false,
    );
  });
});

describe("Solana", () => {
  it("accepts valid Solana addresses", () => {
    expect(isValidSolanaAddress("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T")).toBe(true);
    // Wrapped SOL mint — 44 chars, exercises the long end of the range.
    expect(isValidSolanaAddress("So11111111111111111111111111111111111111112")).toBe(true);
  });

  it("rejects malformed Solana addresses", () => {
    expect(isValidSolanaAddress("4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4")).toBe(false); // 43 chars but invalid bytes
    expect(isValidSolanaAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toBe(false);
  });
});

describe("Ripple", () => {
  // XRP ledger genesis account.
  const genesis = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";

  it("accepts a valid XRP address", () => {
    expect(isValidRippleAddress(genesis)).toBe(true);
  });

  it("rejects tampered XRP addresses", () => {
    expect(isValidRippleAddress(genesis.slice(0, -1) + "T")).toBe(false);
  });
});

describe("registry-driven validate()", () => {
  const eth = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed";
  const tronUsdt = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const btc = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
  const sol = "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T";

  it("validates registered symbols case-insensitively", () => {
    expect(validate(eth, "ETH")).toBe(true);
    expect(validate(eth, "shib")).toBe(true); // the coin that started this
    expect(validate(btc, "BTC")).toBe(true);
    expect(validate(sol, "SOL")).toBe(true);
    expect(validate(sol, "trump")).toBe(true);
    expect(validate(tronUsdt, "TRX")).toBe(true);
  });

  it("multi-network tokens pass on any registered chain", () => {
    expect(validate(eth, "USDT")).toBe(true); // ERC20
    expect(validate(tronUsdt, "USDT")).toBe(true); // TRC20
  });

  it("cross-chain mismatches fail", () => {
    expect(validate(btc, "ETH")).toBe(false);
    expect(validate(eth, "BTC")).toBe(false);
    expect(validate(tronUsdt, "SHIB")).toBe(false);
  });

  it("chainType override pins the network and covers unknown symbols", () => {
    // SHIB-style unknown token, validated via its network
    expect(validate(eth, "SOMENEWTOKEN", { chainType: "erc20" })).toBe(true);
    expect(validate(eth, "SOMENEWTOKEN", { chainType: "bep20" })).toBe(true);
    expect(validate(tronUsdt, "SOMENEWTOKEN", { chainType: "trc20" })).toBe(true);
    expect(validate(sol, "SOMENEWTOKEN", { chainType: "solana" })).toBe(true);
    expect(validate(btc, "SOMENEWTOKEN", { chainType: "erc20" })).toBe(false);
  });

  it("unknown symbols throw (WAValidator-compatible behavior)", () => {
    expect(() => validate(eth, "NOTACOIN")).toThrow(/Missing validator/);
    expect(() => validate(eth, "ETH", { chainType: "wtf" })).toThrow(
      /Unknown chain/,
    );
  });

  it("detectChain finds candidates", () => {
    expect(detectChain(eth)).toContain("evm");
    expect(detectChain(btc)).toContain("bitcoin");
    expect(detectChain(btc)).not.toContain("evm");
  });
});
