/**
 * Symbol -> chain registry. This is the only file that needs updating when
 * the exchange lists a new token — add one line, no code changes.
 *
 * Values are arrays because multi-network tokens (USDT, USDC) are valid on
 * several chains. `validate(addr, symbol)` passes if any listed chain accepts it;
 * `validate(addr, symbol, { chainType })` pins validation to one network.
 *
 * NOTE: exchange-specific tokens (AIA, BGSC, CJL, ...) are mapped to "evm"
 * pending confirmation from ops — verify when a new one is listed.
 */
export const TOKEN_REGISTRY: Record<string, string[]> = {
  // EVM networks (ERC20 / BEP20 / Polygon / Arbitrum / Optimism / Avalanche / Base)
  eth: ["evm"],
  bnb: ["evm"],
  matic: ["evm"],
  pol: ["evm"],
  avax: ["evm"],
  link: ["evm"],
  uni: ["evm"],
  aave: ["evm"],
  dai: ["evm"],
  cro: ["evm"],
  shib: ["evm"],
  pepe: ["evm"],
  ondo: ["evm"],
  fdusd: ["evm"],
  usd1: ["evm"],
  usdp: ["evm"],
  xaut: ["evm"],
  lit: ["evm"],
  leo: ["evm"],
  idrt: ["evm"],
  gidr: ["evm"],

  // Multi-network
  usdt: ["evm", "tron"],
  usdc: ["evm", "solana"],

  // Solana (SPL)
  sol: ["solana"],
  bonk: ["solana"],
  pengu: ["solana"],
  trump: ["solana"],
  fartcoin: ["solana"],

  // Bitcoin family
  btc: ["bitcoin"],
  ltc: ["litecoin"],
  doge: ["dogecoin"],

  // Tron
  trx: ["tron"],

  // Ripple
  xrp: ["ripple"],

  // Exchange-listed tokens — verify chain with ops
  aia: ["evm"],
  anda: ["evm"],
  bgsc: ["evm"],
  cjl: ["evm"],
  crclx: ["evm"],
  cst: ["evm"],
  drx: ["evm"],
  jam: ["evm"],
  kite: ["evm"],
  lab: ["evm"],
  nxa: ["evm"],
  prompt: ["evm"],
  rai: ["evm"],
  siren: ["evm"],
  slvon: ["evm"],
  vvv: ["evm"],

  // TODO: add validators, then register:
  // ada -> cardano, algo -> algorand, atom -> cosmos, dot -> polkadot
};
