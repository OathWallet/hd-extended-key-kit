import { deriveHdKeys } from "../../src/index.js";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const bitcoin = deriveHdKeys({ chain: "bitcoin", format: "zpub", mnemonic });
const ethereum = deriveHdKeys({ chain: "ethereum", mnemonic });
const solana = deriveHdKeys({ chain: "solana", mnemonic });

if (!bitcoin.publicExtendedKey.startsWith("zpub")) throw new Error("Bitcoin zpub derivation failed");
if (ethereum.address !== "0x9858EfFD232B4033E47d90003D41EC34EcaEda94") throw new Error("Ethereum address derivation failed");
if (solana.extendedPublicKey !== null) throw new Error("Solana should not expose BIP32 xpub");

console.log("bitcoin zpub:", bitcoin.publicExtendedKey);
console.log("ethereum address:", ethereum.address);
console.log("solana public key:", solana.publicKeyHex);
