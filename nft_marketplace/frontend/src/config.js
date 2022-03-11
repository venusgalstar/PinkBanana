var abi = require("./InteractWithSmartContract/PinkBananFactory.json");
var config = {
    // baseUrl: "localhost:5000/api/"
    baseUrl: "http://45.61.53.28:5000/api/",    
    socketUrl: "http://45.61.53.28:5000",
    // baseUrl: "https://pinkbanana.herokuapp.com/api/",
    imgUrl: "http://45.61.53.28:5000/uploads/",
    chainId: 43113, //Fuji testnet : 43113, mainnet : 43114.  bsctestnet : 97
    ipfsUrl: 'https://ipfs.infura.io/ipfs/',
    mainNetUrl: 'https://api.avax.network/ext/bc/C/rpc',
    avaxUsdtPair: "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256",
    pinkContractAddress : "0xF2b2cdc554d3b07ADbe9B46C9438982F6B6055B8",
    pinkContractAbi : abi
}

export default config;
