#!/usr/bin/env node
import { deriveHdKeys, listChains } from "../src/index.js";

const version = "0.1.0";

function usage() {
  console.log(`hdkeykit ${version}

Usage:
  hdkeykit derive --chain bitcoin --format zpub --mnemonic "..."
  hdkeykit derive --chain ethereum --mnemonic "..."
  hdkeykit derive --chain solana --mnemonic "..."
  hdkeykit derive --chain bitcoin --format xpub --seed-hex <hex> --path "m/44'/0'/0'"
  hdkeykit list-chains

Options:
  --chain NAME        Chain id. Default: bitcoin
  --format FORMAT     xpub, ypub, zpub, Ltub, Mtub, etc. Chain dependent.
  --path PATH         Explicit derivation path.
  --mnemonic WORDS    BIP-39 mnemonic. Quote it.
  --passphrase TEXT   Optional BIP-39 passphrase.
  --seed-hex HEX      Raw BIP-32 seed as hex.
  --pretty            Pretty-print JSON.
  --help              Show help.
`);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === "pretty" || key === "help") {
      out[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined) throw new Error(`missing value for ${arg}`);
    out[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
    index += 1;
  }
  return out;
}

try {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  if (!command || args.help || command === "help") {
    usage();
    process.exit(0);
  }
  if (command === "version") {
    console.log(version);
    process.exit(0);
  }
  if (command === "list-chains") {
    console.log(JSON.stringify(listChains(), null, args.pretty ? 2 : 0));
    process.exit(0);
  }
  if (command === "derive") {
    const result = deriveHdKeys({
      chain: args.chain,
      format: args.format,
      path: args.path,
      mnemonic: args.mnemonic,
      passphrase: args.passphrase,
      seedHex: args.seedHex
    });
    console.log(JSON.stringify(result, null, args.pretty ? 2 : 0));
    process.exit(0);
  }
  throw new Error(`unknown command: ${command}`);
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
