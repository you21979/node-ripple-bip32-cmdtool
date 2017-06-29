#!/usr/bin/env node
'use strict'
const program = require('commander');
const bip32 = require('ripple-bip32');
const RippleAPI = require('ripple-lib').RippleAPI;
const task = require('promise-util-task');

program
  .version('0.0.1')
  .option('-k, --xpub <xpubxxxxxx>', 'input xpub')
  .option('-s, --start <n>', 'start position', (v) => parseInt(v), 0)
  .option('-c, --count <n>', 'generate count', (v) => parseInt(v), 5)
  .parse(process.argv);

const gen = (xpub, start, count) => {
    const results = []
    const m = bip32.fromBase58(xpub).derive(0);
    for(let i = start; i<start + count; ++i){
        results.push(m.derive(i).getAddress());
    }
    return results
}

const getBalance = (api, address) => {
    return api.getBalances(address).
        catch(e => [{currency:"XRP", value:"0"}]).
        then(r => r.filter(v => v.currency === "XRP").reduce((r,v)=>{
            r[v.currency] = v.value
            return r
        }))
}

const ripple_main = (api, addresses) => {
    return api.getLedger().then(res => res.ledgerVersion).then(current_ledger => {
        return task.seq(addresses.map(v => () => getBalance(api, v).then(r => [v, r.value])))
    }).then(r => {
        console.log(r.map(v => v.join(',')).join('\n'))
    })
}

const main = (program) => {
    if(!program.xpub){
        return
    }
    const addresses = gen(program.xpub, program.start, program.count)
    const api = new RippleAPI({server: 'wss://s1.ripple.com:443'});
    api.on('connected', () => {
        console.log('Connection is open now.');
    });
    api.on('disconnected', (code) => {
        if (code !== 1000) {
            console.log('Connection is closed due to error.');
        } else {
            console.log('Connection is closed normally.');
        }
    });
    return api.connect().then(() => ripple_main(api, addresses) ).
        then(() => api.disconnect() ).
        then(() => process.exit(0)).
        catch(console.error);
}

main(program)
