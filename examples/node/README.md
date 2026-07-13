# Node.js API example

Run from the repository root:

```bash
node examples/node/example.mjs
```

This example derives:

- Bitcoin account `zpub` from `m/84'/0'/0'`
- Ethereum first account address from `m/44'/60'/0'/0/0`
- Solana SLIP10 ed25519 public key from `m/44'/501'/0'/0'`

It uses the public BIP-39 `abandon ... about` test mnemonic. Do not use real wallet mnemonics in examples, logs, bug reports, or CI.
