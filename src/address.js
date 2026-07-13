import { secp256k1 } from "@noble/curves/secp256k1.js";
import { mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { deriveBip32PrivateKey, parseExtendedKey } from "./bip32.js";
import { CHAINS, accountPathFor } from "./chains.js";
import { deriveSlip10Ed25519 } from "./slip10.js";
import {
  base58CheckEncode,
  base58Encode,
  bytesToHex,
  concatBytes,
  hash160,
  hexToBytes,
  toChecksumAddress
} from "./utils.js";

const BECH32_ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BECH32_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

export const ADDRESS_NETWORKS = {
  bitcoin: { p2pkh: "00", p2sh: "05", bech32: "bc" },
  testnet: { p2pkh: "6f", p2sh: "c4", bech32: "tb" },
  litecoin: { p2pkh: "30", p2sh: "32", bech32: "ltc" },
  dogecoin: { p2pkh: "1e", p2sh: "16" },
  dash: { p2pkh: "4c", p2sh: "10" },
  "bitcoin-cash": { p2pkh: "00", p2sh: "05" },
  zcash: { p2pkh: "1cb8", p2sh: "1cbd" },
  digibyte: { p2pkh: "1e", p2sh: "3f", bech32: "dgb" }
};

export function deriveAddress(options = {}) {
  const chainId = options.chain || "bitcoin";
  const chain = CHAINS[chainId];
  if (!chain) throw new Error(`unsupported chain: ${chainId}`);
  const index = integerOption(options.index, 0, "index");
  const change = integerOption(options.change, 0, "change");

  if (chain.curve === "ed25519") {
    const path = options.path || chain.defaultPath || `m/44'/${chain.coinType}'/0'/0'`;
    const key = deriveSlip10Ed25519(resolveSeedFromOptions(options), path);
    return {
      chain: chainId,
      chainName: chain.name,
      symbol: chain.symbol,
      curve: chain.curve,
      path,
      address: base58Encode(key.publicKey),
      publicKeyHex: bytesToHex(key.publicKey),
      privateKeyHex: bytesToHex(key.privateKey),
      warnings: [
        "SLIP10 ed25519 supports hardened private derivation only.",
        "Solana-style ed25519 HD wallets do not have BIP32 xpub/ypub/zpub public child derivation."
      ]
    };
  }

  const format = options.format || chain.defaultFormat || "xpub";
  if (chain.evmAddress) {
    const path = options.path || `${chain.accountPath || `m/44'/${chain.coinType}'/0'`}/0/${index}`;
    const key = deriveBip32PrivateKey(resolveSeedFromOptions(options), path);
    return {
      chain: chainId,
      chainName: chain.name,
      symbol: chain.symbol,
      curve: chain.curve,
      path,
      address: ethereumAddressFromPrivateKey(key.privateKey),
      privateKeyHex: bytesToHex(key.privateKey),
      publicKeyHex: bytesToHex(key.publicKey)
    };
  }

  const accountPath = accountPathFor(chain, format);
  const path = options.path || `${accountPath}/${change}/${index}`;
  const key = deriveBip32PrivateKey(resolveSeedFromOptions(options), path);
  const address = publicKeyToAddress(key.publicKey, { chain: chainId, format });
  return {
    chain: chainId,
    chainName: chain.name,
    symbol: chain.symbol,
    curve: chain.curve,
    format,
    path,
    change,
    index,
    address,
    publicKeyHex: bytesToHex(key.publicKey),
    privateKeyHex: bytesToHex(key.privateKey)
  };
}

export function deriveAddresses(options = {}) {
  const count = integerOption(options.count, 20, "count");
  if (count < 1 || count > 10000) throw new Error("count must be between 1 and 10000");
  const start = integerOption(options.start, options.index ?? 0, "start");
  return Array.from({ length: count }, (_, offset) => deriveAddress({
    ...options,
    index: start + offset
  }));
}

export function deriveAddressFromExtendedKey(options = {}) {
  const serialized = options.extendedKey || options.xpub || options.ypub || options.zpub || options.xprv || options.yprv || options.zprv;
  if (!serialized) throw new Error("provide extendedKey, xpub, ypub, zpub, xprv, yprv, or zprv");
  const parsed = parseExtendedKey(serialized);
  const format = options.format || formatFromVersion(parsed.versionHex);
  const chain = options.chain || chainFromFormat(format) || "bitcoin";
  const change = integerOption(options.change, 0, "change");
  const index = integerOption(options.index, 0, "index");
  if (change >= 0x80000000 || index >= 0x80000000) {
    throw new Error("address derivation from extended public keys requires non-hardened change/index");
  }
  const changeNode = parsed.node.derive(change);
  const addressNode = changeNode.derive(index);
  const publicKey = parsed.isPrivate ? addressNode.publicKey : addressNode.publicKey;
  return {
    chain,
    format,
    change,
    index,
    address: publicKeyToAddress(publicKey, { chain, format }),
    publicKeyHex: bytesToHex(publicKey),
    source: parsed.isPrivate ? "extended-private-key" : "extended-public-key"
  };
}

export function publicKeyToAddress(publicKeyInput, options = {}) {
  const publicKey = typeof publicKeyInput === "string" ? hexToBytes(publicKeyInput) : publicKeyInput;
  const chain = options.chain || "bitcoin";
  const format = options.format || "xpub";
  const scriptType = options.scriptType || scriptTypeFromFormat(format);
  const network = ADDRESS_NETWORKS[chain];
  if (!network) throw new Error(`address network not configured for ${chain}`);

  if (scriptType === "p2pkh") {
    return base58CheckEncode(concatBytes(hexToBytes(network.p2pkh), hash160(publicKey)));
  }
  if (scriptType === "p2sh-p2wpkh") {
    if (!network.p2sh) throw new Error(`${chain} does not support configured P2SH addresses`);
    const redeemScript = concatBytes(new Uint8Array([0x00, 0x14]), hash160(publicKey));
    return base58CheckEncode(concatBytes(hexToBytes(network.p2sh), hash160(redeemScript)));
  }
  if (scriptType === "p2wpkh") {
    if (!network.bech32) throw new Error(`${chain} does not support configured Bech32 addresses`);
    return bech32Encode(network.bech32, [0, ...convertBits(hash160(publicKey), 8, 5, true)]);
  }
  throw new Error(`unsupported script type: ${scriptType}`);
}

export function scriptTypeFromFormat(format = "xpub") {
  if (["xpub", "tpub", "Ltub"].includes(format)) return "p2pkh";
  if (["ypub", "upub", "Mtub"].includes(format)) return "p2sh-p2wpkh";
  if (["zpub", "vpub"].includes(format)) return "p2wpkh";
  return "p2pkh";
}

export function formatFromVersion(versionHex) {
  const normalized = versionHex.toLowerCase();
  const map = {
    "0488b21e": "xpub",
    "0488ade4": "xpub",
    "049d7cb2": "ypub",
    "049d7878": "ypub",
    "04b24746": "zpub",
    "04b2430c": "zpub",
    "043587cf": "tpub",
    "04358394": "tpub",
    "044a5262": "upub",
    "044a4e28": "upub",
    "045f1cf6": "vpub",
    "045f18bc": "vpub",
    "019da462": "Ltub",
    "019d9cfe": "Ltub",
    "01b26ef6": "Mtub",
    "01b26792": "Mtub"
  };
  const format = map[normalized];
  if (!format) throw new Error(`unknown extended-key version: ${versionHex}`);
  return format;
}

function chainFromFormat(format) {
  if (["tpub", "upub", "vpub"].includes(format)) return "testnet";
  if (["Ltub", "Mtub"].includes(format)) return "litecoin";
  return undefined;
}

export function bech32Encode(hrp, words) {
  const checksum = bech32CreateChecksum(hrp, words);
  const combined = [...words, ...checksum];
  return `${hrp}1${combined.map((word) => BECH32_ALPHABET[word]).join("")}`;
}

function bech32CreateChecksum(hrp, words) {
  const values = [...bech32HrpExpand(hrp), ...words, 0, 0, 0, 0, 0, 0];
  const mod = bech32Polymod(values) ^ 1;
  return Array.from({ length: 6 }, (_, index) => (mod >> (5 * (5 - index))) & 31);
}

function bech32HrpExpand(hrp) {
  const high = Array.from(hrp, (char) => char.charCodeAt(0) >> 5);
  const low = Array.from(hrp, (char) => char.charCodeAt(0) & 31);
  return [...high, 0, ...low];
}

function bech32Polymod(values) {
  let chk = 1;
  for (const value of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;
    for (let index = 0; index < 5; index += 1) {
      if ((top >> index) & 1) chk ^= BECH32_GENERATORS[index];
    }
  }
  return chk;
}

export function convertBits(data, fromBits, toBits, pad) {
  let acc = 0;
  let bits = 0;
  const ret = [];
  const maxv = (1 << toBits) - 1;
  for (const value of data) {
    if (value < 0 || value >> fromBits !== 0) throw new Error("invalid value for convertBits");
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    throw new Error("invalid incomplete group");
  }
  return ret;
}

function integerOption(value, fallback, name) {
  const actual = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(actual) || actual < 0) throw new Error(`${name} must be a non-negative integer`);
  return actual;
}

function resolveSeedFromOptions(options) {
  if (options.seed) return options.seed;
  if (options.seedHex) return options.seedHex;
  if (options.mnemonic) return mnemonicToSeedSync(options.mnemonic, options.passphrase || "", wordlist);
  throw new Error("provide seed, seedHex, or mnemonic");
}

export function ethereumAddressFromPrivateKey(privateKey) {
  const bytes = privateKey instanceof Uint8Array ? privateKey : hexToBytes(privateKey);
  const uncompressed = secp256k1.getPublicKey(bytes, false);
  const digest = keccak_256(uncompressed.slice(1));
  return toChecksumAddress(bytesToHex(digest.slice(-20)));
}
