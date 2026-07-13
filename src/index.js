import { mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { deriveBip32PrivateKey, masterFromSeed } from "./bip32.js";
import { CHAINS, accountPathFor, listChains } from "./chains.js";
import { deriveSlip10Ed25519 } from "./slip10.js";
import { bytesToHex, hexToBytes, normalizeSeed, toChecksumAddress } from "./utils.js";

export { CHAINS, EXTENDED_KEY_FORMATS, listChains } from "./chains.js";
export {
  ExtendedPrivateKey,
  HARDENED_OFFSET,
  compressedPublicKeyFromPrivate,
  deriveBip32PrivateKey,
  masterFromSeed,
  parseDerivationPath,
  serializeExtendedKey
} from "./bip32.js";
export { Slip10Ed25519Key, deriveSlip10Ed25519, slip10Ed25519MasterFromSeed } from "./slip10.js";

export function seedFromMnemonic(mnemonic, passphrase = "") {
  return mnemonicToSeedSync(mnemonic, passphrase, wordlist);
}

export function deriveHdKeys(options = {}) {
  const chainId = options.chain || "bitcoin";
  const chain = CHAINS[chainId];
  if (!chain) {
    throw new Error(`unsupported chain: ${chainId}`);
  }

  const seed = resolveSeed(options);
  if (chain.curve === "ed25519") {
    const path = options.path || chain.defaultPath;
    const key = deriveSlip10Ed25519(seed, path);
    return {
      chain: chainId,
      chainName: chain.name,
      symbol: chain.symbol,
      coinType: chain.coinType,
      curve: chain.curve,
      path,
      privateKeyHex: bytesToHex(key.privateKey),
      publicKeyHex: bytesToHex(key.publicKey),
      extendedPrivateKey: null,
      extendedPublicKey: null,
      warnings: [
        "SLIP10 ed25519 supports hardened private derivation only.",
        "Solana-style ed25519 HD wallets do not have BIP32 xpub/ypub/zpub public child derivation."
      ]
    };
  }

  const formatName = options.format || chain.defaultFormat || "xpub";
  const format = chain.formats?.[formatName];
  if (!format) {
    throw new Error(`format ${formatName} is not supported for ${chainId}`);
  }

  const path = options.path || chain.defaultPath || accountPathFor(chain, formatName);
  const key = deriveBip32PrivateKey(seed, path);
  const result = {
    chain: chainId,
    chainName: chain.name,
    symbol: chain.symbol,
    coinType: chain.coinType,
    curve: chain.curve,
    format: formatName,
    addressEncoding: format.addressEncoding,
    path,
    privateExtendedKey: key.serializePrivate(format.privateVersion),
    publicExtendedKey: key.serializePublic(format.publicVersion),
    privateKeyHex: bytesToHex(key.privateKey),
    publicKeyHex: bytesToHex(key.publicKey)
  };

  if (chain.evmAddress) {
    result.address = ethereumAddressFromPrivateKey(key.privateKey);
  }

  return result;
}

export function deriveAccountExtendedKeys(options = {}) {
  return deriveHdKeys({
    ...options,
    path: options.path || accountPathFor(CHAINS[options.chain || "bitcoin"], options.format)
  });
}

export function ethereumAddressFromPrivateKey(privateKey) {
  const uncompressed = secp256k1.getPublicKey(privateKey instanceof Uint8Array ? privateKey : hexToBytes(privateKey), false);
  const digest = keccak_256(uncompressed.slice(1));
  return toChecksumAddress(bytesToHex(digest.slice(-20)));
}

function resolveSeed(options) {
  if (options.seed) return normalizeSeed(options.seed);
  if (options.seedHex) return normalizeSeed(options.seedHex);
  if (options.mnemonic) return seedFromMnemonic(options.mnemonic, options.passphrase || "");
  throw new Error("provide seed, seedHex, or mnemonic");
}
