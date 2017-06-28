const bip39 = require("bip39");
const bip32 = require("ripple-bip32");

const createByXprvNode = (m, base_path, from, count) => {
    const results = []
    const path = base_path.split("/")
    for(let i = from; i < from + count; ++i){
        const pathstring = path.concat(0, i.toString()).join("/")
        const derived = m.derivePath(pathstring)
        const obj = {
            childpath : [].concat(0, i.toString()).join("/"),
            address : derived.getAddress(),
            keypairs : derived.keyPair.getKeyPairs(),
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

const main = () => {
    const base_path = "m/44'/144'/0'"
    const mnemonic = bip39.generateMnemonic(256)
    const password = ""
    const data = createByMnemonic(mnemonic, password, base_path, 0, 10)
    console.log(JSON.stringify(data, null, 2))
}

main()
