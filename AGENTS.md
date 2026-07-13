# Agent guide for HD Extended Key Kit

This repository derives HD wallet extended keys and account keys. GitHub is the source of truth.

## Package identity

- Repository: `devdasx/hd-extended-key-kit`
- npm package: `hd-extended-key-kit`
- CLI: `hdkeykit`
- Primary APIs: `deriveHdKeys`, `deriveAddress`, `deriveAddresses`, `deriveAddressFromExtendedKey`

## Repository layout

- `src/bip32.js`: BIP32 secp256k1 private derivation and extended-key serialization.
- `src/slip10.js`: SLIP10 ed25519 hardened derivation.
- `src/chains.js`: chain metadata, coin types, and version bytes.
- `src/address.js`: address encoders and address derivation from mnemonic/seed or account extended keys.
- `src/index.js`: public API.
- `bin/hdkeykit.js`: CLI.
- `test`: standard-vector tests.
- `examples`: runnable examples.
- `docs`: search and AI-agent-readable GitHub Pages docs.

## Validate changes

Run:

```bash
npm test
examples/run-examples.sh
node bin/hdkeykit.js derive --chain bitcoin --format zpub --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
```

## Rules

- Do not change BIP32 or SLIP10 derivation behavior without adding standard vectors.
- Do not claim Solana has xpub/zpub semantics; it uses ed25519 SLIP10 hardened private derivation.
- Do not log real private keys or real mnemonics. Use public test vectors only.
- Keep README, `llms.txt`, docs, package metadata, and examples aligned.
