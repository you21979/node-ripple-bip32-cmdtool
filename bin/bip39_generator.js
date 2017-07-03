#!/usr/bin/env node
'use strict'
const bip39 = require("bip39");
const bip32 = require("ripple-bip32");
const program = require('commander');

program
  .version('0.0.1')
  .option('-m, --mnemonic <xxx xxx xxx>', 'input mnemonic', "")
  .option('-p, --password <xxxxxxxxxxx>', 'input password', "")
  .option('-s, --start <n>', 'start position', (v) => parseInt(v), 0)
  .option('-c, --count <n>', 'generate count', (v) => parseInt(v), 5)
  .parse(process.argv);

const createByXprvNode = (m, base_path, from, count) => {
    const results = []
    const derived = m.derivePath(base_path)
    for(let i = from; i < from + count; ++i){
        const pathstring = ['m', '0', i.toString()].join("/")
        const w = m.derivePath(pathstring)
        const obj = {
            childpath : [].concat(0, i.toString()).join("/"),
            address : w.getAddress(),
            keypairs : w.keyPair.getKeyPairs(),
        }
        results.push(obj)
    }
    return results
} 

const createByMnemonic = (mnemonic, password, base_path, begin, count) => {
    const seed = bip39.mnemonicToSeed(mnemonic, password)
    const m = bip32.fromSeedBuffer(seed)
    const addresses = createByXprvNode(m, base_path, begin, count)
    const data = {
        root: {
            mnemonic : mnemonic,
            password : password,
            xprv : m.toBase58(),
        },
        child: {
            basepath : base_path,
            xpub : m.derivePath(base_path).neutered().toBase58(),
            addresses : addresses
        },
    }
    return data
}

const main = (program) => {
    if(program.mnemonic === ""){
        return;
    }
    const base_path = "m/44'/144'/0'"
    const mnemonic = program.mnemonic
    const password = program.password
    const start = program.start
    const count = program.count
    const data = createByMnemonic(mnemonic, password, base_path, start, count)
    console.log(JSON.stringify(data, null, 2))
}

main(program)
