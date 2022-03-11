var abi = require("./InteractWithSmartContract/PinkBananFactory.json");
var config = {
    // baseUrl: "localhost:5000/api/"
    baseUrl: "http://192.168.103.53:5000/api/",    
    socketUrl: "http://192.168.103.53:5000",
    // baseUrl: "https://pinkbanana.herokuapp.com/api/",
    imgUrl: "http://192.168.103.53:5000/uploads/",
    chainId: 43114, //Fuji testnet : 43113, mainnet : 43114.  bsctestnet : 97
    ipfsUrl: 'https://ipfs.infura.io/ipfs/',
    mainNetUrl: 'https://api.avax.network/ext/bc/C/rpc',
    avaxUsdtPair: "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256",
    pinkContractAddress : "0xA91Bc151066448a07243E2A90879969fF92CB640",
    pinkContractAbi : abi
}

export default config;