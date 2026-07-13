import { sha256 } from "@noble/hashes/sha2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex) {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("hex string must have an even number of characters");
  if (!/^[0-9a-fA-F]*$/.test(clean)) throw new Error("hex string contains non-hex characters");
  const out = new Uint8Array(clean.length / 2);
  for (let index = 0; index < out.length; index += 1) {
    out[index] = Number.parseInt(clean.slice(index * 2, index * 2 + 2), 16);
  }
  return out;
}

export function concatBytes(...chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export function utf8(value) {
  return utf8ToBytes(value);
}

export function ser32(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error(`invalid uint32: ${value}`);
  }
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value, false);
  return out;
}

export function ser32Hex(value) {
  return bytesToHex(ser32(value));
}

export function numberToBytes32(value) {
  if (value < 0n) throw new Error("cannot encode negative bigint");
  let hex = value.toString(16);
  if (hex.length > 64) throw new Error("bigint does not fit in 32 bytes");
  hex = hex.padStart(64, "0");
  return hexToBytes(hex);
}

export function bytesToNumber(bytes) {
  return BigInt(`0x${bytesToHex(bytes)}`);
}

export function hash160(bytes) {
  return ripemd160(sha256(bytes));
}

export function fingerprintFromPublicKey(publicKey) {
  return hash160(publicKey).slice(0, 4);
}

export function base58Encode(bytes) {
  let value = bytesToNumber(bytes);
  let out = "";
  while (value > 0n) {
    const mod = Number(value % 58n);
    out = BASE58_ALPHABET[mod] + out;
    value /= 58n;
  }
  for (const byte of bytes) {
    if (byte === 0) out = "1" + out;
    else break;
  }
  return out || "1";
}

export function base58CheckEncode(payload) {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  return base58Encode(concatBytes(payload, checksum));
}

export function parseVersion(version) {
  if (typeof version === "number") return ser32(version);
  if (typeof version === "string") return hexToBytes(version);
  if (version instanceof Uint8Array && version.length === 4) return version;
  throw new Error("extended-key version must be a uint32, hex string, or 4-byte Uint8Array");
}

export function normalizeSeed(seed) {
  if (typeof seed === "string") return hexToBytes(seed);
  if (seed instanceof Uint8Array) return seed;
  if (ArrayBuffer.isView(seed)) return new Uint8Array(seed.buffer, seed.byteOffset, seed.byteLength);
  throw new Error("seed must be hex or bytes");
}

export function toChecksumAddress(hexAddress) {
  const clean = hexAddress.toLowerCase().replace(/^0x/, "");
  const hash = bytesToHex(keccak_256(utf8(clean)));
  let out = "0x";
  for (let index = 0; index < clean.length; index += 1) {
    out += Number.parseInt(hash[index], 16) >= 8 ? clean[index].toUpperCase() : clean[index];
  }
  return out;
}
