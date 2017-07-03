#!/usr/bin/env node
'use strict'
const bip39 = require("bip39")
const bip32 = require("ripple-bip32")
const sign = require('ripple-sign-keypairs')
const program = require('commander')

program
  .version('0.0.1')
  .option('-m, --mnemonic <xxx xxx xxx>', 'input mnemonic', "")
  .option('-p, --password <xxxxxxxxxxx>', 'input password', "")
  .option('-d, --dest_address <rxxxxxxxxxx>', 'input address', "")
  .option('-a, --amount <1.0>', 'send xrp amount', "0")
  .option('-f, --fee_amount <0.1>', 'network fee amount', "0.1")
  .parse(process.argv);

const createByMnemonic = (mnemonic, password, base_path) => {
    const seed = bip39.mnemonicToSeed(mnemonic, password)
    const m = bip32.fromSeedBuffer(seed)
    const derived = m.derivePath(base_path)
    return {
        address : derived.getAddress(),
        keypairs : derived.keyPair.getKeyPairs(),
    }
}

const XRP2Drops = (xrp) => (Math.floor(parseFloat(xrp) * 1e6)).toString()

const createPaymentTx = (src_address, dest_address, amount, fee) => {
    const tx = JSON.parse('{"TransactionType":"Payment","Account":"","Destination":"","Amount":"1","Flags":2147483648,"Fee":"1"}')
    tx.Account = src_address
    tx.Destination = dest_address
    tx.Amount = XRP2Drops(amount)
    tx.Fee = XRP2Drops(fee)
    return JSON.stringify(tx)
}

const main = (program) => {
    if(program.mnemonic === ""){
        return;
    }
    const base_path = "m/44'/144'/0'/0/0"
    const mnemonic = program.mnemonic
    const password = program.password
    const dest_address = program.dest_address
    const amount = program.amount
    const fee = program.fee_amount
    const data = createByMnemonic(mnemonic, password, base_path)
    const txJSON = createPaymentTx(data.address, dest_address, amount, fee)
    const signedTx = sign(txJSON, data.keypairs)
    console.log(signedTx)
}

main(program)
