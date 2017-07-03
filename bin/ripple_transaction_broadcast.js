#!/usr/bin/env node
'use strict'
const program = require('commander');
const RippleAPI = require('ripple-lib').RippleAPI;

program
  .version('0.0.1')
  .option('-r, --rawtx <xxxxxx>', 'input rawtx')
  .parse(process.argv);

const ripple_main = (api, rawtx) => {
    return api.getLedger().then(res => res.ledgerVersion).then(current_ledger => {
        return api.submit(rawtx)
    }).then(r => {
        console.log(r)
    }).catch(e => console.log(e.message))
}

const main = (program) => {
    if(!program.rawtx){
        return
    }
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
    return api.connect().then(() => ripple_main(api, program.rawtx) ).
        then(() => api.disconnect() ).
        then(() => process.exit(0)).
        catch(console.error);
}

main(program)
