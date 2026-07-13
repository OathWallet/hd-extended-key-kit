# HD Extended Key Kit

HD Extended Key Kit derives HD wallet extended keys and chain account keys from BIP-39 mnemonics or raw seeds.

It supports Bitcoin-family `xpub/xprv`, `ypub/yprv`, and `zpub/zprv` formats where those formats are defined, plus multi-chain BIP32 and SLIP10 derivation for chains that use HD wallets.

GitHub is the canonical source of truth:

```text
https://github.com/devdasx/hd-extended-key-kit
```

## What this package does

- Derive Bitcoin `xpub/xprv`, `ypub/yprv`, `zpub/zprv`.
- Derive Bitcoin legacy, nested SegWit, and native SegWit addresses from mnemonic/seed or account xpub/ypub/zpub.
- Derive Bitcoin testnet `tpub/tprv`, `upub/uprv`, `vpub/vprv`.
- Derive Litecoin registered `Ltub/Ltpv` and `Mtub/Mtpv`, plus compatibility `xpub/ypub/zpub` formats and addresses.
- Derive Dogecoin, Dash, Bitcoin Cash, Zcash transparent, and DigiByte addresses.
- Derive Dogecoin, Dash, Bitcoin Cash, Zcash transparent, DigiByte, and other secp256k1 HD account extended keys.
- Derive Ethereum/EVM account keys and the EIP-55 checksummed address for `m/44'/60'/0'/0/0`.
- Derive Solana SLIP10 ed25519 private/public keys and base58 public-key address for hardened paths.
- Provide a CLI: `hdkeykit`.
- Include real tests against published SLIP-132 vectors.

## Important key-format boundary

`xpub`, `ypub`, `zpub`, `xprv`, `yprv`, and `zprv` are BIP32 serialized extended-key formats used by Bitcoin-style secp256k1 HD wallets.

Ethereum can use BIP32 secp256k1 derivation, but Ethereum wallets normally use account private/public keys and addresses rather than xpub-style wallet imports.

Solana uses ed25519 SLIP10-style hardened derivation. It does not support BIP32 public child derivation, so this package deliberately returns `extendedPublicKey: null` for Solana and explains why.

## Install

Install from GitHub:

```bash
npm install github:devdasx/hd-extended-key-kit#0.2.0
```

When npm registry publishing is configured:

```bash
npm install hd-extended-key-kit
```

Use the CLI without installing globally:

```bash
npx github:devdasx/hd-extended-key-kit#0.2.0 hdkeykit list-chains --pretty
```

## JavaScript API

```js
import { deriveAddress, deriveAddressFromExtendedKey, deriveHdKeys } from "hd-extended-key-kit";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const bitcoin = deriveHdKeys({
  chain: "bitcoin",
  format: "zpub",
  mnemonic
});

console.log(bitcoin.publicExtendedKey);
// zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4w...

const bitcoinAddress = deriveAddress({
  chain: "bitcoin",
  format: "zpub",
  mnemonic,
  index: 0
});

console.log(bitcoinAddress.address);
// bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu

const watchOnlyAddress = deriveAddressFromExtendedKey({
  chain: "bitcoin",
  extendedKey: bitcoin.publicExtendedKey,
  index: 0
});

console.log(watchOnlyAddress.address);
// bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu

const ethereum = deriveHdKeys({
  chain: "ethereum",
  mnemonic
});

console.log(ethereum.address);
// 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

const solana = deriveHdKeys({
  chain: "solana",
  mnemonic
});

console.log(solana.publicKeyHex);
console.log(solana.extendedPublicKey); // null: ed25519 SLIP10 has no BIP32 xpub semantics
```

## CLI

```bash
hdkeykit derive --chain bitcoin --format zpub --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit address --chain bitcoin --format zpub --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --index 0 --pretty
hdkeykit addresses --chain bitcoin --format zpub --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --count 5 --pretty
hdkeykit address-from-xpub --chain bitcoin --xpub "zpub..." --index 0 --pretty
hdkeykit derive --chain ethereum --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit address --chain ethereum --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit derive --chain solana --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit address --chain solana --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit list-chains --pretty
```

You can also derive from a raw seed:

```bash
hdkeykit derive --chain bitcoin --format xpub --seed-hex 000102030405060708090a0b0c0d0e0f --path "m/0'"
```

## Supported chains in v0.2.0

| Chain id | Curve | Default path / account path | Formats |
| --- | --- | --- | --- |
| `bitcoin` | secp256k1 | `m/84'/0'/0'` for `zpub`; addresses at `/0/i` | `xpub`, `ypub`, `zpub`; P2PKH, P2SH-P2WPKH, Bech32 |
| `testnet` | secp256k1 | `m/84'/1'/0'` for `vpub`; addresses at `/0/i` | `tpub`, `upub`, `vpub`; testnet P2PKH/P2SH/Bech32 |
| `litecoin` | secp256k1 | `m/44'/2'/0'` for `Ltub`; addresses at `/0/i` | `Ltub`, `Mtub`, `xpub`, `ypub`, `zpub`; Litecoin legacy/P2SH/Bech32 |
| `dogecoin` | secp256k1 | `m/44'/3'/0'`; addresses at `/0/i` | `xpub`; Dogecoin P2PKH |
| `dash` | secp256k1 | `m/44'/5'/0'`; addresses at `/0/i` | `xpub`; Dash P2PKH |
| `bitcoin-cash` | secp256k1 | `m/44'/145'/0'`; addresses at `/0/i` | `xpub`; legacy Base58 P2PKH |
| `zcash` | secp256k1 | `m/44'/133'/0'`; addresses at `/0/i` | `xpub`; transparent t-address |
| `digibyte` | secp256k1 | BIP44/BIP49/BIP84 by format; addresses at `/0/i` | `xpub`, `ypub`, `zpub`; P2PKH/P2SH/Bech32 |
| `ethereum` | secp256k1 | `m/44'/60'/0'/0/0` | account key/address |
| `ethereum-classic` | secp256k1 | `m/44'/61'/0'/0/0` | account key/address |
| `polygon`, `bsc`, `avalanche-c`, `arbitrum`, `optimism`, `base` | secp256k1 | `m/44'/60'/0'/0/0` | EVM account key/address |
| `tron` | secp256k1 | `m/44'/195'/0'/0/0` | account key |
| `solana` | ed25519 | `m/44'/501'/0'/0'` | SLIP10 private/public key, no xpub |

## Examples

Run real examples:

```bash
npm install
examples/run-examples.sh
```

See:

- [`examples/node`](examples/node)
- [`examples/cli`](examples/cli)

## Validation

Run tests:

```bash
npm test
```

The test suite verifies:

- SLIP-132 Bitcoin `xpub/xprv` vector.
- SLIP-132 Bitcoin `ypub/yprv` vector.
- SLIP-132 Bitcoin `zpub/zprv` vector.
- SLIP-132 Bitcoin address vectors for `1...`, `3...`, and `bc1...`.
- Address derivation from account `xpub`, `ypub`, and `zpub`.
- Address batches for watch-only wallets.
- Litecoin and Dogecoin deterministic address derivation.
- Ethereum BIP44 first account private key and checksummed address.
- Solana SLIP10 ed25519 derivation, base58 address, and explicit no-xpub behavior.
- Chain metadata listing.
- Rejection of unsupported chain/format combinations.

## Standards used

- [BIP-32: Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [SLIP-0132: Registered HD version bytes for BIP-0032](https://github.com/satoshilabs/slips/blob/master/slip-0132.md)
- [SLIP-0044: Registered coin types for BIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- [SLIP-0010: Universal private key derivation](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)

## Security notes

- Never paste a real wallet mnemonic into logs, tickets, analytics, or public examples.
- Treat `xprv/yprv/zprv` and raw private keys as spending secrets.
- Treat `xpub/ypub/zpub` as privacy-sensitive because they can reveal wallet activity.
- This package derives keys; it does not sign transactions, scan balances, or store secrets.

## AI-agent readability

This repository includes:

- `README.md` with install commands and working examples.
- `llms.txt` for concise retrieval by AI agents.
- `docs/llms.txt` and `docs/llms-full.txt` for GitHub Pages.
- `AGENTS.md` with repository structure and test rules.
- `.github/copilot-instructions.md`.
- Schema.org `SoftwareSourceCode` JSON-LD on the docs page.

Agents should treat GitHub release tags as canonical and run `npm test` plus `examples/run-examples.sh` before changing derivation logic.

## License

MIT
