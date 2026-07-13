import assert from "node:assert/strict";
import test from "node:test";
import { deriveHdKeys, listChains } from "../src/index.js";

const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

test("matches SLIP-132 Bitcoin xpub/xprv vector", () => {
  const result = deriveHdKeys({ chain: "bitcoin", format: "xpub", mnemonic });
  assert.equal(result.path, "m/44'/0'/0'");
  assert.equal(result.privateExtendedKey, "xprv9xpXFhFpqdQK3TmytPBqXtGSwS3DLjojFhTGht8gwAAii8py5X6pxeBnQ6ehJiyJ6nDjWGJfZ95WxByFXVkDxHXrqu53WCRGypk2ttuqncb");
  assert.equal(result.publicExtendedKey, "xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj");
});

test("matches SLIP-132 Bitcoin ypub/yprv vector", () => {
  const result = deriveHdKeys({ chain: "bitcoin", format: "ypub", mnemonic });
  assert.equal(result.path, "m/49'/0'/0'");
  assert.equal(result.privateExtendedKey, "yprvAHwhK6RbpuS3dgCYHM5jc2ZvEKd7Bi61u9FVhYMpgMSuZS613T1xxQeKTffhrHY79hZ5PsskBjcc6C2V7DrnsMsNaGDaWev3GLRQRgV7hxF");
  assert.equal(result.publicExtendedKey, "ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNB6VvmSEgytSER9azLDWCxoJwW7Ke7icmizBMXrzBx9979FfaHxHcrArf3zbeJJJUZPf663zsP");
});

test("matches SLIP-132 Bitcoin zpub/zprv vector", () => {
  const result = deriveHdKeys({ chain: "bitcoin", format: "zpub", mnemonic });
  assert.equal(result.path, "m/84'/0'/0'");
  assert.equal(result.privateExtendedKey, "zprvAdG4iTXWBoARxkkzNpNh8r6Qag3irQB8PzEMkAFeTRXxHpbF9z4QgEvBRmfvqWvGp42t42nvgGpNgYSJA9iefm1yYNZKEm7z6qUWCroSQnE");
  assert.equal(result.publicExtendedKey, "zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs");
});

test("derives known Ethereum BIP44 account address", () => {
  const result = deriveHdKeys({ chain: "ethereum", mnemonic });
  assert.equal(result.path, "m/44'/60'/0'/0/0");
  assert.equal(result.privateKeyHex, "1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727");
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

test("lists supported chain metadata", () => {
  const ids = listChains().map((chain) => chain.id);
  for (const id of ["bitcoin", "ethereum", "solana", "dogecoin", "litecoin"]) {
    assert.ok(ids.includes(id), `${id} should be listed`);
  }
});

test("rejects unsupported format for chain", () => {
  assert.throws(() => deriveHdKeys({ chain: "dogecoin", format: "zpub", mnemonic }), /format zpub is not supported/);
});
