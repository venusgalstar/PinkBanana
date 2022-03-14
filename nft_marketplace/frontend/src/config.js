var abi = require("./InteractWithSmartContract/PinkBananFactory.json");
var config = {
    // baseUrl: "localhost:5000/api/"
    baseUrl: "http://192.168.103.53:5000/api/",    
    socketUrl: "http://192.168.103.53:5000",
    // baseUrl: "https://pinkbanana.herokuapp.com/api/",
    imgUrl: "http://192.168.103.53:5000/uploads/",
    chainId: 97, //Fuji testnet : 43113, mainnet : 43114.  bsctestnet : 97
    ipfsUrl: 'https://ipfs.infura.io/ipfs/',
    mainNetUrl: 'https://api.avax.network/ext/bc/C/rpc',
    testNetUrl:  "https://data-seed-prebsc-1-s2.binance.org:8545/",           // "https://api.avax-test.network/ext/bc/C/rpc",
    avaxUsdtPair: "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256",
    pinkContractAddress : "0x4527bE6146bC78B7F1855476254d40adAc4d5546",
    pinkContractAbi : abi
}

export default config;
