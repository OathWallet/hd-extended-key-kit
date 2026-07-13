import { secp256k1 } from "@noble/curves/secp256k1.js";
import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";
import {
  base58CheckEncode,
  base58CheckDecode,
  bytesToHex,
  bytesToNumber,
  concatBytes,
  fingerprintFromPublicKey,
  hexToBytes,
  normalizeSeed,
  numberToBytes32,
  parseVersion,
  ser32,
  utf8
} from "./utils.js";

export const HARDENED_OFFSET = 0x80000000;
const SECP256K1_N = secp256k1.Point.Fn.ORDER;

export class ExtendedPrivateKey {
  constructor({ privateKey, chainCode, depth = 0, parentFingerprint = new Uint8Array(4), index = 0 }) {
    if (!(privateKey instanceof Uint8Array) || privateKey.length !== 32) throw new Error("privateKey must be 32 bytes");
    if (!(chainCode instanceof Uint8Array) || chainCode.length !== 32) throw new Error("chainCode must be 32 bytes");
    if (!isValidPrivateKey(privateKey)) throw new Error("invalid secp256k1 private key");
    this.privateKey = privateKey;
    this.chainCode = chainCode;
    this.depth = depth;
    this.parentFingerprint = parentFingerprint;
    this.index = index;
  }

  get publicKey() {
    return secp256k1.getPublicKey(this.privateKey, true);
  }

  get fingerprint() {
    return fingerprintFromPublicKey(this.publicKey);
  }

  derive(index) {
    if (!Number.isSafeInteger(index) || index < 0 || index > 0xffffffff) {
      throw new Error(`invalid child index: ${index}`);
    }

    const hardened = index >= HARDENED_OFFSET;
    const data = hardened
      ? concatBytes(new Uint8Array([0]), this.privateKey, ser32(index))
      : concatBytes(this.publicKey, ser32(index));
    const digest = hmac(sha512, this.chainCode, data);
    const il = digest.slice(0, 32);
    const ir = digest.slice(32);
    const tweak = bytesToNumber(il);
    if (tweak >= SECP256K1_N) throw new Error("invalid BIP32 child tweak");
    const child = (tweak + bytesToNumber(this.privateKey)) % SECP256K1_N;
    if (child === 0n) throw new Error("invalid zero BIP32 child private key");

    return new ExtendedPrivateKey({
      privateKey: numberToBytes32(child),
      chainCode: ir,
      depth: this.depth + 1,
      parentFingerprint: this.fingerprint,
      index
    });
  }

  derivePath(path) {
    return parseDerivationPath(path).reduce((node, index) => node.derive(index), this);
  }

  serializePrivate(version) {
    return serializeExtendedKey({
      version,
      depth: this.depth,
      parentFingerprint: this.parentFingerprint,
      index: this.index,
      chainCode: this.chainCode,
      keyData: concatBytes(new Uint8Array([0]), this.privateKey)
    });
  }

  serializePublic(version) {
    return serializeExtendedKey({
      version,
      depth: this.depth,
      parentFingerprint: this.parentFingerprint,
      index: this.index,
      chainCode: this.chainCode,
      keyData: this.publicKey
    });
  }

  toJSON() {
    return {
      depth: this.depth,
      index: this.index,
      parentFingerprint: bytesToHex(this.parentFingerprint),
      chainCode: bytesToHex(this.chainCode),
      privateKey: bytesToHex(this.privateKey),
      publicKey: bytesToHex(this.publicKey)
    };
  }
}

export class ExtendedPublicKey {
  constructor({ publicKey, chainCode, depth = 0, parentFingerprint = new Uint8Array(4), index = 0 }) {
    if (!(publicKey instanceof Uint8Array) || publicKey.length !== 33) throw new Error("publicKey must be 33 bytes");
    if (!(chainCode instanceof Uint8Array) || chainCode.length !== 32) throw new Error("chainCode must be 32 bytes");
    if (!(parentFingerprint instanceof Uint8Array) || parentFingerprint.length !== 4) {
      throw new Error("parentFingerprint must be 4 bytes");
    }
    if (!secp256k1.utils.isValidPublicKey(publicKey)) throw new Error("invalid secp256k1 public key");
    this.publicKey = publicKey;
    this.chainCode = chainCode;
    this.depth = depth;
    this.parentFingerprint = parentFingerprint;
    this.index = index;
  }

  get fingerprint() {
    return fingerprintFromPublicKey(this.publicKey);
  }

  derive(index) {
    if (!Number.isSafeInteger(index) || index < 0 || index > 0xffffffff) {
      throw new Error(`invalid child index: ${index}`);
    }
    if (index >= HARDENED_OFFSET) {
      throw new Error("cannot derive hardened child from extended public key");
    }
    const digest = hmac(sha512, this.chainCode, concatBytes(this.publicKey, ser32(index)));
    const il = digest.slice(0, 32);
    const ir = digest.slice(32);
    const tweak = bytesToNumber(il);
    if (tweak >= SECP256K1_N) throw new Error("invalid BIP32 child tweak");

    const childPoint = secp256k1.Point.BASE
      .multiply(tweak)
      .add(secp256k1.Point.fromHex(bytesToHex(this.publicKey)));
    if (childPoint.equals(secp256k1.Point.ZERO)) throw new Error("invalid zero BIP32 child public key");

    return new ExtendedPublicKey({
      publicKey: childPoint.toBytes(true),
      chainCode: ir,
      depth: this.depth + 1,
      parentFingerprint: this.fingerprint,
      index
    });
  }

  serializePublic(version) {
    return serializeExtendedKey({
      version,
      depth: this.depth,
      parentFingerprint: this.parentFingerprint,
      index: this.index,
      chainCode: this.chainCode,
      keyData: this.publicKey
    });
  }

  toJSON() {
    return {
      depth: this.depth,
      index: this.index,
      parentFingerprint: bytesToHex(this.parentFingerprint),
      chainCode: bytesToHex(this.chainCode),
      publicKey: bytesToHex(this.publicKey)
    };
  }
}

export function masterFromSeed(seed) {
  const seedBytes = normalizeSeed(seed);
  if (seedBytes.length < 16 || seedBytes.length > 64) {
    throw new Error("BIP32 seed should be between 16 and 64 bytes");
  }
  const digest = hmac(sha512, utf8("Bitcoin seed"), seedBytes);
  const privateKey = digest.slice(0, 32);
  const chainCode = digest.slice(32);
  return new ExtendedPrivateKey({ privateKey, chainCode });
}

export function deriveBip32PrivateKey(seed, path) {
  return masterFromSeed(seed).derivePath(path);
}

export function serializeExtendedKey({ version, depth, parentFingerprint, index, chainCode, keyData }) {
  if (depth < 0 || depth > 255) throw new Error(`invalid depth: ${depth}`);
  if (!(parentFingerprint instanceof Uint8Array) || parentFingerprint.length !== 4) {
    throw new Error("parentFingerprint must be 4 bytes");
  }
  if (!(chainCode instanceof Uint8Array) || chainCode.length !== 32) throw new Error("chainCode must be 32 bytes");
  if (!(keyData instanceof Uint8Array) || keyData.length !== 33) throw new Error("keyData must be 33 bytes");
  return base58CheckEncode(concatBytes(
    parseVersion(version),
    new Uint8Array([depth]),
    parentFingerprint,
    ser32(index),
    chainCode,
    keyData
  ));
}

export function parseDerivationPath(path) {
  if (path === "m" || path === "M") return [];
  if (typeof path !== "string" || !/^[mM]\//.test(path)) {
    throw new Error(`invalid derivation path: ${path}`);
  }
  return path.split("/").slice(1).map((part) => {
    const hardened = /['hH]$/.test(part);
    const raw = hardened ? part.slice(0, -1) : part;
    if (!/^\d+$/.test(raw)) throw new Error(`invalid path component: ${part}`);
    const index = Number.parseInt(raw, 10);
    if (index >= HARDENED_OFFSET) throw new Error(`path component too large: ${part}`);
    return hardened ? index + HARDENED_OFFSET : index;
  });
}

export function isValidPrivateKey(privateKey) {
  const value = bytesToNumber(privateKey);
  return value > 0n && value < SECP256K1_N;
}

export function compressedPublicKeyFromPrivate(privateKey) {
  return secp256k1.getPublicKey(privateKey instanceof Uint8Array ? privateKey : hexToBytes(privateKey), true);
}

export function parseExtendedKey(serialized) {
  const payload = base58CheckDecode(serialized);
  if (payload.length !== 78) throw new Error("extended key payload must be 78 bytes");
  const version = payload.slice(0, 4);
  const depth = payload[4];
  const parentFingerprint = payload.slice(5, 9);
  const index = new DataView(payload.buffer, payload.byteOffset + 9, 4).getUint32(0, false);
  const chainCode = payload.slice(13, 45);
  const keyData = payload.slice(45, 78);
  const isPrivate = keyData[0] === 0;
  return {
    serialized,
    version,
    versionHex: bytesToHex(version),
    depth,
    parentFingerprint,
    index,
    chainCode,
    keyData,
    isPrivate,
    node: isPrivate
      ? new ExtendedPrivateKey({
          privateKey: keyData.slice(1),
          chainCode,
          depth,
          parentFingerprint,
          index
        })
      : new ExtendedPublicKey({
          publicKey: keyData,
          chainCode,
          depth,
          parentFingerprint,
          index
        })
  };
}
