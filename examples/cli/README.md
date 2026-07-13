# CLI example

Run from this folder:

```bash
sh run.sh
```

Direct CLI usage:

```bash
hdkeykit derive --chain bitcoin --format zpub --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit address --chain bitcoin --format zpub --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --index 0 --pretty
hdkeykit addresses --chain bitcoin --format zpub --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --count 5 --pretty
hdkeykit address-from-xpub --chain bitcoin --xpub "zpub..." --index 0 --pretty
hdkeykit derive --chain ethereum --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit derive --chain solana --mnemonic "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" --pretty
hdkeykit list-chains --pretty
```
