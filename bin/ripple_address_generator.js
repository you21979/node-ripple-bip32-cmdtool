#!/usr/bin/env node
'use strict'
const program = require('commander');
const bip32 = require('ripple-bip32');

program
  .version('0.0.1')
  .option('-k, --xpub <xpubxxxxxx>', 'input xpub')
  .option('-s, --start <n>', 'start position', parseInt, 0)
  .option('-c, --count <n>', 'generate count', parseInt, 5)
  .parse(process.argv);

const gen = (xpub, start, count) => {
    const results = []
    const m = bip32.fromBase58(xpub).derive(0);
    for(let i = start; i<start + count; ++i){
        results.push(m.derive(i).getAddress());
    }
    return results
}

const main = (program) => {
    if(!program.xpub){
        return
    }
    const addresses = gen(program.xpub, program.start, program.count)
    console.log(addresses.join("\n"))
}

main(program)
