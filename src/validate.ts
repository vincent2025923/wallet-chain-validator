/**
 * Public API.
 *
 * `validate(address, symbol, opts)` intentionally mirrors the
 * multicoin-address-validator signature for drop-in migration:
 * unknown symbols throw, just like WAValidator did.
 */
import { isValidEvmAddress } from "./validators/evm";
import {
  isValidBitcoinFamilyAddress,
  BITCOIN,
  LITECOIN,
  DOGECOIN,
} from "./validators/bitcoin";
import { isValidTronAddress } from "./validators/tron";
import { isValidSolanaAddress } from "./validators/solana";
import { isValidRippleAddress } from "./validators/ripple";
import { TOKEN_REGISTRY } from "./registry";

export interface ValidateOptions {
  /**
   * Pin validation to one chain/network. Accepts canonical chain ids
   * ("evm", "tron"...) and network labels ("erc20", "bep20", "trc20",
   * "polygon", "sol" ...). Overrides the symbol registry entirely,
   * which is how unknown ERC-20 tokens are validated.
   */
  chainType?: string;
}

const CHAIN_VALIDATORS: Record<string, (address: string) => boolean> = {
  evm: isValidEvmAddress,
  bitcoin: (a) => isValidBitcoinFamilyAddress(a, BITCOIN),
  litecoin: (a) => isValidBitcoinFamilyAddress(a, LITECOIN),
  dogecoin: (a) => isValidBitcoinFamilyAddress(a, DOGECOIN),
  tron: isValidTronAddress,
  solana: isValidSolanaAddress,
  ripple: isValidRippleAddress,
};

const CHAIN_ALIASES: Record<string, string> = {
  evm: "evm",
  ethereum: "evm",
  eth: "evm",
  erc20: "evm",
  bep20: "evm",
  bsc: "evm",
  "bnb smart chain": "evm",
  polygon: "evm",
  matic: "evm",
  arbitrum: "evm",
  optimism: "evm",
  avalanche: "evm",
  avax: "evm",
  cchain: "evm",
  base: "evm",
  manta: "evm",
  bitcoin: "bitcoin",
  btc: "bitcoin",
  litecoin: "litecoin",
  ltc: "litecoin",
  dogecoin: "dogecoin",
  doge: "dogecoin",
  tron: "tron",
  trx: "tron",
  trc20: "tron",
  solana: "solana",
  sol: "solana",
  spl: "solana",
  ripple: "ripple",
  xrp: "ripple",
};

function normalizeChain(chain: string): string {
  const key = chain.trim().toLowerCase();
  const canonical = CHAIN_ALIASES[key];
  if (!canonical || !(canonical in CHAIN_VALIDATORS)) {
    throw new Error("Unknown chain: " + chain);
  }
  return canonical;
}

/** Validate an address against a single chain or network label. */
export function validateByChain(address: string, chain: string): boolean {
  const fn = CHAIN_VALIDATORS[normalizeChain(chain)]!;
  return fn(address.trim());
}

/**
 * Validate an address for a currency symbol (case-insensitive).
 * Multi-network tokens pass on any of their registered chains.
 * Unknown symbols throw — catch and fall back to `chainType` if needed.
 */
export function validate(
  address: string,
  symbol: string,
  opts?: ValidateOptions,
): boolean {
  if (opts?.chainType) {
    return validateByChain(address, opts.chainType);
  }

  const sym = String(symbol || "").trim().toLowerCase();
  const chains = TOKEN_REGISTRY[sym];
  if (!chains || chains.length === 0) {
    throw new Error("Missing validator for currency: " + symbol);
  }

  const trimmed = address.trim();
  return chains.some((c) => CHAIN_VALIDATORS[c]!(trimmed));
}

/** List every chain id that accepts this address. */
export function detectChain(address: string): string[] {
  const trimmed = address.trim();
  return Object.entries(CHAIN_VALIDATORS)
    .filter(([, fn]) => fn(trimmed))
    .map(([chain]) => chain);
}

export function getSupportedSymbols(): string[] {
  return Object.keys(TOKEN_REGISTRY);
}

export function getSupportedChains(): string[] {
  return Object.keys(CHAIN_VALIDATORS);
}

export { TOKEN_REGISTRY };
