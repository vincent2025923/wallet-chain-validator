# wallet-chain-validator

Chain-based crypto wallet address validation with an exchange token registry. One tiny package validates deposit addresses for EVM, Bitcoin (incl. SegWit/Taproot), Litecoin, Dogecoin, Tron, Solana, and Ripple — including tokens like USDT, USDC, SHIB, and PEPE on their respective networks.

- **Real checksum validation** — Base58Check, Bech32/Bech32m (BIP-173/350), EIP-55, Keccak-based Tron, Solana ed25519 curve checks, XRP Base58Check. Not just regex.
- **Chain-aware registry** — `validate(addr, "USDT")` accepts both ERC-20 and TRC-20 addresses; pin a network with `chainType` when you need to.
- **Drop-in migration** from `multicoin-address-validator` (WAValidator) — same `validate(address, symbol)` signature.
- **Dual ESM/CJS builds** with TypeScript types, ~5 kB gzipped, only `js-sha3` and `js-sha256` as dependencies.

## Install

```bash
npm install wallet-chain-validator
```

Requires Node.js >= 18. Works in browsers, bundlers, and server runtimes.

## Usage

### Validate by token symbol

```ts
import { validate } from "wallet-chain-validator";

validate("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "ETH");   // true
validate("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "USDT");          // true (TRC-20)
validate("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "USDT");  // true (ERC-20)
validate("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", "ETH");           // false

// Unknown symbols throw, mirroring WAValidator:
validate("0x...", "NOTACOIN"); // throws "Missing validator for currency: NOTACOIN"
```

### Pin a network with `chainType`

For unknown tokens (any ERC-20/BEP-20 mint), validate via its network instead of its symbol:

```ts
validate("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed", "SOMENEWTOKEN", {
  chainType: "erc20",
}); // true — same 20-byte EVM format as every ERC-20/BEP-20/Polygon/... token
```

### Validate against a single chain

```ts
import { validateByChain } from "wallet-chain-validator";

validateByChain("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "tron");     // true
validateByChain("bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0", "bitcoin"); // true (Taproot)
validateByChain("So11111111111111111111111111111111111111112", "solana"); // true (wrapped SOL)
```

### Detect which chains an address belongs to

```ts
import { detectChain } from "wallet-chain-validator";

detectChain("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed");
// ["evm"]
```

### Migrating from multicoin-address-validator

```ts
// before
import WAValidator from "multicoin-address-validator";
WAValidator.validate(address, "BTC");

// after
import { validate } from "wallet-chain-validator";
validate(address, "BTC");
```

## API

| Export | Description |
| --- | --- |
| `validate(address, symbol, opts?)` | Validate against every chain registered for `symbol` (case-insensitive). Passes if any chain accepts it. Throws on unknown symbols. |
| `validateByChain(address, chain)` | Validate against one chain. Accepts canonical ids (`"evm"`, `"bitcoin"`) and network labels (`"erc20"`, `"bep20"`, `"trc20"`, `"polygon"`, `"base"`, ...). |
| `detectChain(address)` | Return every chain id that accepts this address. |
| `getSupportedSymbols()` | List registered token symbols. |
| `getSupportedChains()` | List supported chain ids. |
| `TOKEN_REGISTRY` | The symbol-to-chains map — extend it to add tokens. |
| `isValidEvmAddress(addr)` | EIP-55 aware EVM validation (checksum enforced only for mixed-case). |
| `isValidTronAddress(addr)` | Keccak-based Base58Check validation. |
| `isValidSolanaAddress(addr)` | Base58 + ed25519 curve point validation. |
| `isValidRippleAddress(addr)` | XRP "r..." Base58Check validation. |
| `isValidBitcoinFamilyAddress(addr, network)` | Shared validator behind BTC/LTC/DOGE. |

## Supported chains

| Chain id | Networks / labels | Address formats |
| --- | --- | --- |
| `evm` | ethereum, eth, erc20, bep20, bsc, polygon, matic, arbitrum, optimism, avalanche, base, manta, ... | Hex with optional EIP-55 checksum |
| `bitcoin` | btc | P2PKH, P2SH, Bech32 (SegWit), Bech32m (Taproot) |
| `litecoin` | ltc | P2PKH, P2SH, Bech32 |
| `dogecoin` | doge | P2PKH, P2SH |
| `tron` | trx, trc20 | Base58Check with Keccak (same as Ethereum bytes) |
| `solana` | sol, spl | Base58, 32-byte ed25519 public keys |
| `ripple` | xrp | Base58Check |

The registry covers common tokens (ETH, BNB, MATIC, LINK, UNI, AAVE, DAI, SHIB, PEPE, USDT, USDC, SOL, BONK, TRUMP, BTC, LTC, DOGE, TRX, XRP, and more). Multi-network tokens map to several chains: `usdt: ["evm", "tron"]`, `usdc: ["evm", "solana"]`.

## Adding tokens

One line in `src/registry.ts`, no code changes:

```ts
export const TOKEN_REGISTRY = {
  // ...
  mytoken: ["evm"], // or ["evm", "solana"] for multi-network tokens
};
```

## Development

```bash
npm install
npm test     # vitest
npm run build # tsup -> dist/ (CJS + ESM + .d.ts)
```

## License

[MIT](LICENSE)
