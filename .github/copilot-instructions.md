# Copilot instructions for HD Extended Key Kit

This package implements HD wallet derivation. Treat derivation code as security-sensitive.

- Run `npm test` after changing `src`.
- Run `examples/run-examples.sh` after changing README, examples, CLI, or exports.
- Preserve BIP32, SLIP10, SLIP44, and SLIP132 compatibility.
- Do not claim Solana supports xpub/zpub. It uses ed25519 SLIP10 hardened derivation only.
- Use only public test mnemonics in docs and tests.
