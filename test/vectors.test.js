import assert from "node:assert/strict";
import test from "node:test";
import { deriveAddress, deriveAddresses, deriveAddressFromExtendedKey, deriveHdKeys, listChains } from "../src/index.js";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

test("matches SLIP-132 Bitcoin xpub/xprv vector", () => {
  const result = deriveHdKeys({ chain: "bitcoin", format: "xpub", mnemonic });
  assert.equal(result.path, "m/44'/0'/0'");
  assert.equal(result.privateExtendedKey, "xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb");
  assert.equal(result.publicExtendedKey, "xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj");
});

test("matches SLIP-132 Bitcoin xpub address vector", () => {
  const result = deriveAddress({ chain: "bitcoin", format: "xpub", mnemonic });
  assert.equal(result.path, "m/44'/0'/0'/0/0");
  assert.equal(result.address, "1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");
});

test("matches SLIP-132 Bitcoin ypub/yprv vector", () => {
  const result = deriveHdKeys({ chain: "bitcoin", format: "ypub", mnemonic });
  assert.equal(result.path, "m/49'/0'/0'");
  assert.equal(result.privateExtendedKey, "yprvAHwhK6RbpuS3dgCYHM5jc2ZvEKd7Bi61u9FVhYMpgMSuZS613T1xxQeKTffhrHY79hZ5PsskBjcc6C2V7DrnsMsNaGDaWev3GLRQRgV7hxF");
  assert.equal(result.publicExtendedKey, "ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNB6VvmSEgytSER9azLDWCxoJwW7Ke7icmizBMXrzBx9979FfaHxHcrArf3zbeJJJUZPf663zsP");
});

test("matches SLIP-132 Bitcoin ypub address vector", () => {
  const result = deriveAddress({ chain: "bitcoin", format: "ypub", mnemonic });
  assert.equal(result.path, "m/49'/0'/0'/0/0");
  assert.equal(result.address, "37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf");
});

test("matches SLIP-132 Bitcoin zpub/zprv vector", () => {
  const result = deriveHdKeys({ chain: "bitcoin", format: "zpub", mnemonic });
  assert.equal(result.path, "m/84'/0'/0'");
  assert.equal(result.privateExtendedKey, "zprvAdG4iTXWBoARxkkzNpNh8r6Qag3irQB8PzEMkAFeTRXxHpbF9z4QgEvBRmfvqWvGp42t42nvgGpNgYSJA9iefm1yYNZKEm7z6qUWCroSQnE");
  assert.equal(result.publicExtendedKey, "zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs");
});

test("matches SLIP-132 Bitcoin zpub address vector", () => {
  const result = deriveAddress({ chain: "bitcoin", format: "zpub", mnemonic });
  assert.equal(result.path, "m/84'/0'/0'/0/0");
  assert.equal(result.address, "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu");
});

test("derives the same Bitcoin addresses from account xpub/ypub/zpub", () => {
  for (const [format, expected] of [
    ["xpub", "1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA"],
    ["ypub", "37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf"],
    ["zpub", "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu"]
  ]) {
    const extended = deriveHdKeys({ chain: "bitcoin", format, mnemonic }).publicExtendedKey;
    const result = deriveAddressFromExtendedKey({ chain: "bitcoin", extendedKey: extended });
    assert.equal(result.address, expected);
    assert.equal(result.source, "extended-public-key");
  }
});

test("derives known Ethereum BIP44 account address", () => {
  const result = deriveHdKeys({ chain: "ethereum", mnemonic });
  assert.equal(result.path, "m/44'/60'/0'/0/0");
  assert.equal(result.privateKeyHex, "1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727");
  assert.equal(result.address, "0x9858EfFD232B4033E47d90003D41EC34EcaEda94");
});

test("derives known Ethereum BIP44 account address via address API", () => {
  const result = deriveAddress({ chain: "ethereum", mnemonic });
  assert.equal(result.path, "m/44'/60'/0'/0/0");
  assert.equal(result.address, "0x9858EfFD232B4033E47d90003D41EC34EcaEda94");
});

test("derives Solana SLIP10 ed25519 keys and refuses xpub semantics", () => {
  const result = deriveHdKeys({ chain: "solana", mnemonic });
  assert.equal(result.path, "m/44'/501'/0'/0'");
  assert.equal(result.privateKeyHex, "37df573b3ac4ad5b522e064e25b63ea16bcbe79d449e81a0268d1047948bb445");
  assert.equal(result.publicKeyHex, "f036276246a75b9de3349ed42b15e232f6518fc20f5fcd4f1d64e81f9bd258f7");
  assert.equal(result.extendedPublicKey, null);
  assert.match(result.warnings.join(" "), /do not have BIP32 xpub/);
});

test("derives Solana base58 address from SLIP10 public key", () => {
  const result = deriveAddress({ chain: "solana", mnemonic });
  assert.equal(result.address, "HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk");
  assert.equal(result.publicKeyHex, "f036276246a75b9de3349ed42b15e232f6518fc20f5fcd4f1d64e81f9bd258f7");
});

test("derives Litecoin and Dogecoin deterministic addresses", () => {
  assert.equal(deriveAddress({ chain: "litecoin", format: "Ltub", mnemonic }).address, "LUWPbpM43E2p7ZSh8cyTBEkvpHmr3cB8Ez");
  assert.equal(deriveAddress({ chain: "litecoin", format: "Mtub", mnemonic }).address, "M7wtsL7wSHDBJVMWWhtQfTMSYYkyooAAXM");
  assert.equal(deriveAddress({ chain: "litecoin", format: "zpub", mnemonic }).address, "ltc1qjmxnz78nmc8nq77wuxh25n2es7rzm5c2rkk4wh");
  assert.equal(deriveAddress({ chain: "dogecoin", mnemonic }).address, "DBus3bamQjgJULBJtYXpEzDWQRwF5iwxgC");
});

test("derives address batches", () => {
  const addresses = deriveAddresses({ chain: "bitcoin", format: "zpub", mnemonic, count: 3 });
  assert.deepEqual(addresses.map((item) => item.address), [
    "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu",
    "bc1qnjg0jd8228aq7egyzacy8cys3knf9xvrerkf9g",
    "bc1qp59yckz4ae5c4efgw2s5wfyvrz0ala7rgvuz8z"
  ]);
});

test("lists supported chain metadata", () => {
  const ids = listChains().map((chain) => chain.id);
  for (const id of ["bitcoin", "ethereum", "solana", "dogecoin", "litecoin"]) {
    assert.ok(ids.includes(id), `${id} should be listed`);
  }
});

test("rejects unsupported format for chain", () => {
  assert.throws(() => deriveHdKeys({ chain: "dogecoin", format: "zpub", mnemonic }), /format zpub is not supported/);
});
