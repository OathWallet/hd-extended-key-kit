export const EXTENDED_KEY_FORMATS = {
  xpub: { publicVersion: "0488b21e", privateVersion: "0488ade4", publicPrefix: "xpub", privatePrefix: "xprv", purpose: 44, addressEncoding: "P2PKH or P2SH" },
  ypub: { publicVersion: "049d7cb2", privateVersion: "049d7878", publicPrefix: "ypub", privatePrefix: "yprv", purpose: 49, addressEncoding: "P2WPKH in P2SH" },
  zpub: { publicVersion: "04b24746", privateVersion: "04b2430c", publicPrefix: "zpub", privatePrefix: "zprv", purpose: 84, addressEncoding: "P2WPKH" },
  tpub: { publicVersion: "043587cf", privateVersion: "04358394", publicPrefix: "tpub", privatePrefix: "tprv", purpose: 44, addressEncoding: "testnet P2PKH or P2SH" },
  upub: { publicVersion: "044a5262", privateVersion: "044a4e28", publicPrefix: "upub", privatePrefix: "uprv", purpose: 49, addressEncoding: "testnet P2WPKH in P2SH" },
  vpub: { publicVersion: "045f1cf6", privateVersion: "045f18bc", publicPrefix: "vpub", privatePrefix: "vprv", purpose: 84, addressEncoding: "testnet P2WPKH" },
  Ltub: { publicVersion: "019da462", privateVersion: "019d9cfe", publicPrefix: "Ltub", privatePrefix: "Ltpv", purpose: 44, addressEncoding: "Litecoin P2PKH or P2SH" },
  Mtub: { publicVersion: "01b26ef6", privateVersion: "01b26792", publicPrefix: "Mtub", privatePrefix: "Mtpv", purpose: 49, addressEncoding: "Litecoin P2WPKH in P2SH" }
};

const bitcoinFormats = { xpub: EXTENDED_KEY_FORMATS.xpub, ypub: EXTENDED_KEY_FORMATS.ypub, zpub: EXTENDED_KEY_FORMATS.zpub };

export const CHAINS = {
  bitcoin: {
    name: "Bitcoin",
    symbol: "BTC",
    coinType: 0,
    curve: "secp256k1",
    defaultFormat: "zpub",
    formats: bitcoinFormats
  },
  testnet: {
    name: "Bitcoin Testnet",
    symbol: "TBTC",
    coinType: 1,
    curve: "secp256k1",
    defaultFormat: "vpub",
    formats: { tpub: EXTENDED_KEY_FORMATS.tpub, upub: EXTENDED_KEY_FORMATS.upub, vpub: EXTENDED_KEY_FORMATS.vpub }
  },
  litecoin: {
    name: "Litecoin",
    symbol: "LTC",
    coinType: 2,
    curve: "secp256k1",
    defaultFormat: "Ltub",
    formats: {
      Ltub: EXTENDED_KEY_FORMATS.Ltub,
      Mtub: EXTENDED_KEY_FORMATS.Mtub,
      xpub: EXTENDED_KEY_FORMATS.xpub,
      ypub: EXTENDED_KEY_FORMATS.ypub,
      zpub: EXTENDED_KEY_FORMATS.zpub
    }
  },
  dogecoin: {
    name: "Dogecoin",
    symbol: "DOGE",
    coinType: 3,
    curve: "secp256k1",
    defaultFormat: "xpub",
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  dash: {
    name: "Dash",
    symbol: "DASH",
    coinType: 5,
    curve: "secp256k1",
    defaultFormat: "xpub",
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  "bitcoin-cash": {
    name: "Bitcoin Cash",
    symbol: "BCH",
    coinType: 145,
    curve: "secp256k1",
    defaultFormat: "xpub",
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  zcash: {
    name: "Zcash transparent",
    symbol: "ZEC",
    coinType: 133,
    curve: "secp256k1",
    defaultFormat: "xpub",
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  digibyte: {
    name: "DigiByte",
    symbol: "DGB",
    coinType: 20,
    curve: "secp256k1",
    defaultFormat: "xpub",
    formats: bitcoinFormats
  },
  ethereum: {
    name: "Ethereum",
    symbol: "ETH",
    coinType: 60,
    curve: "secp256k1",
    accountPath: "m/44'/60'/0'",
    defaultPath: "m/44'/60'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  "ethereum-classic": {
    name: "Ethereum Classic",
    symbol: "ETC",
    coinType: 61,
    curve: "secp256k1",
    accountPath: "m/44'/61'/0'",
    defaultPath: "m/44'/61'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  polygon: {
    name: "Polygon",
    symbol: "MATIC",
    coinType: 60,
    curve: "secp256k1",
    accountPath: "m/44'/60'/0'",
    defaultPath: "m/44'/60'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  bsc: {
    name: "BNB Smart Chain",
    symbol: "BNB",
    coinType: 60,
    curve: "secp256k1",
    accountPath: "m/44'/60'/0'",
    defaultPath: "m/44'/60'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  "avalanche-c": {
    name: "Avalanche C-Chain",
    symbol: "AVAX",
    coinType: 60,
    curve: "secp256k1",
    accountPath: "m/44'/60'/0'",
    defaultPath: "m/44'/60'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  arbitrum: {
    name: "Arbitrum",
    symbol: "ARB",
    coinType: 60,
    curve: "secp256k1",
    accountPath: "m/44'/60'/0'",
    defaultPath: "m/44'/60'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  optimism: {
    name: "Optimism",
    symbol: "OP",
    coinType: 60,
    curve: "secp256k1",
    accountPath: "m/44'/60'/0'",
    defaultPath: "m/44'/60'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  base: {
    name: "Base",
    symbol: "BASE",
    coinType: 60,
    curve: "secp256k1",
    accountPath: "m/44'/60'/0'",
    defaultPath: "m/44'/60'/0'/0/0",
    evmAddress: true,
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  tron: {
    name: "TRON",
    symbol: "TRX",
    coinType: 195,
    curve: "secp256k1",
    accountPath: "m/44'/195'/0'",
    defaultPath: "m/44'/195'/0'/0/0",
    formats: { xpub: EXTENDED_KEY_FORMATS.xpub }
  },
  solana: {
    name: "Solana",
    symbol: "SOL",
    coinType: 501,
    curve: "ed25519",
    defaultPath: "m/44'/501'/0'/0'",
    supportsExtendedPublicKey: false
  }
};

export function listChains() {
  return Object.entries(CHAINS).map(([id, chain]) => ({
    id,
    name: chain.name,
    symbol: chain.symbol,
    coinType: chain.coinType,
    curve: chain.curve,
    formats: chain.formats ? Object.keys(chain.formats) : []
  }));
}

export function accountPathFor(chain, formatName) {
  const format = chain.formats?.[formatName || chain.defaultFormat];
  if (chain.accountPath) return chain.accountPath;
  if (!format) return chain.defaultPath;
  return `m/${format.purpose}'/${chain.coinType}'/0'`;
}
