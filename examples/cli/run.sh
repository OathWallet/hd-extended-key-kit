#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"

MNEMONIC="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

BITCOIN_JSON="$(node "$ROOT/bin/hdkeykit.js" derive --chain bitcoin --format zpub --mnemonic "$MNEMONIC")"
ETH_JSON="$(node "$ROOT/bin/hdkeykit.js" derive --chain ethereum --mnemonic "$MNEMONIC")"
SOL_JSON="$(node "$ROOT/bin/hdkeykit.js" derive --chain solana --mnemonic "$MNEMONIC")"

echo "$BITCOIN_JSON" | grep -q '"publicExtendedKey":"zpub'
echo "$ETH_JSON" | grep -q '"address":"0x9858EfFD232B4033E47d90003D41EC34EcaEda94"'
echo "$SOL_JSON" | grep -q '"extendedPublicKey":null'

echo "cli-example-ok"
