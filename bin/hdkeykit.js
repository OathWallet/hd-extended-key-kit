#!/usr/bin/env node
import { deriveAddress, deriveAddresses, deriveAddressFromExtendedKey, deriveHdKeys, listChains } from "../src/index.js";

const version = "0.2.0";

function usage() {
  console.log(`hdkeykit ${version}

Usage:
  hdkeykit derive --chain bitcoin --format zpub --mnemonic "..."
  hdkeykit derive --chain ethereum --mnemonic "..."
  hdkeykit derive --chain solana --mnemonic "..."
  hdkeykit derive --chain bitcoin --format xpub --seed-hex <hex> --path "m/44'/0'/0'"
  hdkeykit address --chain bitcoin --format zpub --mnemonic "..." --index 0
  hdkeykit addresses --chain bitcoin --format zpub --mnemonic "..." --count 20
  hdkeykit address-from-xpub --chain bitcoin --xpub <xpub-or-ypub-or-zpub> --index 0
  hdkeykit list-chains

Options:
  --chain NAME        Chain id. Default: bitcoin
  --format FORMAT     xpub, ypub, zpub, Ltub, Mtub, etc. Chain dependent.
  --path PATH         Explicit derivation path.
  --change NUMBER     Address branch. Default: 0
  --index NUMBER      Address index. Default: 0
  --start NUMBER      First address index for address batches. Default: 0
  --count NUMBER      Address count for address batches. Default: 20
  --xpub KEY          Extended public key for address-from-xpub.
  --extended-key KEY  Extended public/private key for address-from-xpub.
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
  if (command === "address") {
    const result = deriveAddress({
      chain: args.chain,
      format: args.format,
      path: args.path,
      mnemonic: args.mnemonic,
      passphrase: args.passphrase,
      seedHex: args.seedHex,
      change: args.change,
      index: args.index
    });
    console.log(JSON.stringify(result, null, args.pretty ? 2 : 0));
    process.exit(0);
  }
  if (command === "addresses") {
    const result = deriveAddresses({
      chain: args.chain,
      format: args.format,
      path: args.path,
      mnemonic: args.mnemonic,
      passphrase: args.passphrase,
      seedHex: args.seedHex,
      change: args.change,
      start: args.start,
      count: args.count
    });
    console.log(JSON.stringify(result, null, args.pretty ? 2 : 0));
    process.exit(0);
  }
  if (command === "address-from-xpub") {
    const result = deriveAddressFromExtendedKey({
      chain: args.chain,
      format: args.format,
      extendedKey: args.extendedKey || args.xpub || args.ypub || args.zpub || args.xprv || args.yprv || args.zprv,
      change: args.change,
      index: args.index
    });
    console.log(JSON.stringify(result, null, args.pretty ? 2 : 0));
    process.exit(0);
  }
  throw new Error(`unknown command: ${command}`);
} catch (error) {
  console.error(`error: ${error.message}`);
  process.exit(1);
}
