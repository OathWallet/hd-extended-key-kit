#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"

MNEMONIC="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"

BITCOIN_JSON="$(node "$ROOT/bin/hdkeykit.js" derive --chain bitcoin --format zpub --mnemonic "$MNEMONIC")"
BITCOIN_ADDRESS_JSON="$(node "$ROOT/bin/hdkeykit.js" address --chain bitcoin --format zpub --mnemonic "$MNEMONIC" --index 0)"
ETH_JSON="$(node "$ROOT/bin/hdkeykit.js" derive --chain ethereum --mnemonic "$MNEMONIC")"
ETH_ADDRESS_JSON="$(node "$ROOT/bin/hdkeykit.js" address --chain ethereum --mnemonic "$MNEMONIC")"
SOL_JSON="$(node "$ROOT/bin/hdkeykit.js" derive --chain solana --mnemonic "$MNEMONIC")"
SOL_ADDRESS_JSON="$(node "$ROOT/bin/hdkeykit.js" address --chain solana --mnemonic "$MNEMONIC")"

echo "$BITCOIN_JSON" | grep -q '"publicExtendedKey":"zpub'
echo "$BITCOIN_ADDRESS_JSON" | grep -q '"address":"bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu"'
echo "$ETH_JSON" | grep -q '"address":"0x9858EfFD232B4033E47d90003D41EC34EcaEda94"'
echo "$ETH_ADDRESS_JSON" | grep -q '"address":"0x9858EfFD232B4033E47d90003D41EC34EcaEda94"'
echo "$SOL_JSON" | grep -q '"extendedPublicKey":null'
echo "$SOL_ADDRESS_JSON" | grep -q '"address":"HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk"'

echo "cli-example-ok"
