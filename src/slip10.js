import { ed25519 } from "@noble/curves/ed25519.js";
import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, concatBytes, normalizeSeed, ser32, utf8 } from "./utils.js";
import { HARDENED_OFFSET, parseDerivationPath } from "./bip32.js";

export class Slip10Ed25519Key {
  constructor({ privateKey, chainCode, depth = 0, index = 0 }) {
    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) throw new Error("privateKey must be 32 bytes");
    if (!(chainCode instanceof Uint8Array) || chainCode.length !== 32) throw new Error("chainCode must be 32 bytes");
    this.privateKey = privateKey;
    this.chainCode = chainCode;
    this.depth = depth;
    this.index = index;
  }

  get publicKey() {
    return ed25519.getPublicKey(this.privateKey);
  }

  derive(index) {
    if (index < HARDENED_OFFSET) {
      throw new Error("SLIP10 ed25519 supports hardened private child derivation only");
    }
    const digest = hmac(sha512, this.chainCode, concatBytes(new Uint8Array([0]), this.privateKey, ser32(index)));
    return new Slip10Ed25519Key({
      privateKey: digest.slice(0, 32),
      chainCode: digest.slice(32),
      depth: this.depth + 1,
      index
    });
  }

  derivePath(path) {
    return parseDerivationPath(path).reduce((node, index) => node.derive(index), this);
  }

  toJSON() {
    return {
      depth: this.depth,
      index: this.index,
      chainCode: bytesToHex(this.chainCode),
      privateKey: bytesToHex(this.privateKey),
      publicKey: bytesToHex(this.publicKey)
    };
  }
}

export function slip10Ed25519MasterFromSeed(seed) {
  const digest = hmac(sha512, utf8("ed25519 seed"), normalizeSeed(seed));
  return new Slip10Ed25519Key({
    privateKey: digest.slice(0, 32),
    chainCode: digest.slice(32)
  });
}

export function deriveSlip10Ed25519(seed, path) {
  return slip10Ed25519MasterFromSeed(seed).derivePath(path);
}
