var abi = require("./InteractWithSmartContract/PinkBananFactory.json");
var config = {
    // baseUrl: "localhost:5000/api/"
    baseUrl: "http://192.168.103.36/api/",    
    socketUrl: "http://192.168.103.36",
    // baseUrl: "https://pinkbanana.herokuapp.com/api/",
    imgUrl: "http://192.168.103.36/uploads/",
    chainId: 97, //Fuji testnet : 43113, mainnet : 43114.  bsctestnet : 97
    ipfsUrl: 'https://ipfs.infura.io/ipfs/',
    mainNetUrl: 'https://api.avax.network/ext/bc/C/rpc',
    testNetUrl:  "https://data-seed-prebsc-1-s2.binance.org:8545/",           // "https://api.avax-test.network/ext/bc/C/rpc",
    avaxUsdtPair: "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256",
    pinkContractAddress : "0x8C0f5d4A872564A81A83C1e11f8d7729F78c685D",
    pinkContractAbi : abi
}

export default config;
