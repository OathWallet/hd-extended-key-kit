import { deriveAddress, deriveAddressFromExtendedKey, deriveHdKeys } from "../../src/index.js";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const bitcoin = deriveHdKeys({ chain: "bitcoin", format: "zpub", mnemonic });
const bitcoinAddress = deriveAddress({ chain: "bitcoin", format: "zpub", mnemonic });
const bitcoinAddressFromZpub = deriveAddressFromExtendedKey({
  chain: "bitcoin",
  extendedKey: bitcoin.publicExtendedKey
});
const ethereum = deriveHdKeys({ chain: "ethereum", mnemonic });
const ethereumAddress = deriveAddress({ chain: "ethereum", mnemonic });
const solana = deriveHdKeys({ chain: "solana", mnemonic });
const solanaAddress = deriveAddress({ chain: "solana", mnemonic });

if (!bitcoin.publicExtendedKey.startsWith("zpub")) throw new Error("Bitcoin zpub derivation failed");
if (bitcoinAddress.address !== "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu") throw new Error("Bitcoin address derivation failed");
if (bitcoinAddressFromZpub.address !== bitcoinAddress.address) throw new Error("zpub address derivation failed");
if (ethereum.address !== "0x9858EfFD232B4033E47d90003D41EC34EcaEda94") throw new Error("Ethereum address derivation failed");
if (ethereumAddress.address !== ethereum.address) throw new Error("Ethereum address API failed");
if (solana.extendedPublicKey !== null) throw new Error("Solana should not expose BIP32 xpub");
if (solanaAddress.address !== "HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk") throw new Error("Solana address derivation failed");

console.log("bitcoin zpub:", bitcoin.publicExtendedKey);
console.log("bitcoin address:", bitcoinAddress.address);
console.log("bitcoin address from zpub:", bitcoinAddressFromZpub.address);
console.log("ethereum address:", ethereum.address);
console.log("solana address:", solanaAddress.address);
