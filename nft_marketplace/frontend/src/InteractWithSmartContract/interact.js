import Web3 from 'web3/dist/web3.min.js';
import config from "../config";
import store from "../store";
const pinkBananaFactoryABI = config.pinkContractAbi;
const pinkBananaFactoryAddress = config.pinkContractAddress;

const gWeb3 = new Web3(config.testNetUrl);
const abi = [    
  {
      "inputs": [],
      "name": "getReserves",
      "outputs": [
          {
              "internalType": "uint112",
              "name": "_reserve0",
              "type": "uint112"
          },
          {
              "internalType": "uint112",
              "name": "_reserve1",
              "type": "uint112"
          },
          {
              "internalType": "uint32",
              "name": "_blockTimestampLast",
              "type": "uint32"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  }
];


const pairContract = new gWeb3.eth.Contract(abi, "0xed8cbd9f0ce3c6986b22002f03c6475ceb7a6256");
var PinkFactoryContract ;

export const loadWeb3 = async () => 
{
  if (window.ethereum) 
  {
    window.web3 = new Web3(window.ethereum);
    window.web3.eth.handleRevert = true;
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
  } 
  else if (window.web3) 
  {
    window.web3 = new Web3(Web3.givenProvider);
    window.web3.eth.handleRevert = true;
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
  } 
  else {
    // window.alert(
    //   "Non-Ethereum browser detected. You should consider trying MetaMask!"
    // );
    return;
  }
  if (window.ethereum) {
    window.ethereum.on('chainChanged', function (chainId) {
      checkNetworkById(chainId);

    });
    window.web3.eth.getChainId().then((chainId) => {
      checkNetworkById(chainId);

    })
    window.ethereum.on('disconnect', function(error  /*:ProviderRpcError*/) {
      //alert("disconnected, " + error);
      store.dispatch({
        type: "SET_WALLET_ADDR",
        payload: 0
      });
    });
    window.ethereum.on('accountsChanged', function(accounts /*: Array<string>*/) {
       //alert("wallet "+accounts[0]+" is connected");
       if(accounts[0]   !== undefined)
       {
        store.dispatch({
          type: "SET_WALLET_ADDR",
          payload: accounts[0]
        });
       }
    });
  }
};

export const checkNetwork = async () => {
  if (window.web3) {
    const chainId = await window.web3.eth.getChainId();
    return checkNetworkById(chainId);
  }
}

export const checkNetworkById = async (chainId) => {
  if (window.web3.utils.toHex(chainId) !== window.web3.utils.toHex(config.chainId)) 
  {
    await changeNetwork();      
  }
  const cid = await window.web3.eth.getChainId();
  store.dispatch({        
    type: "SET_CHAIN_ID",
    payload: cid
  })
  return (window.web3.utils.toHex(cid) === window.web3.utils.toHex(config.chainId) )
}

const changeNetwork = async () => 
{
  try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: window.web3.utils.toHex(config.chainId) }],
      });
    } 
  catch (switchError) 
    {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) 
      {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: window.web3.utils.toHex(config.chainId),
                chainName: 'Avalanche',
                rpcUrls: [config.testNetUrl] /* ... */,
              },
            ],
          });
          return {
            success : true,
            message : "switching succeed"
          }
        } catch (addError) {          
          return {
            success : false,
            message : "Switching failed." + addError.message
          }
        }
      }
    }
}

export const signString = async (data) => 
{
  var address = data;
  var msgHash = window.web3.utils.keccak256(data);
  var signedString = "";
  await window.web3.eth.personal.sign(window.web3.utils.toHex(msgHash), address, function (err, result) 
  {
    if (err) return console.error(err)
    signedString = result;
    console.log('SIGNED:' + result)
  })
  return signedString;
}

export const connectWallet = async () => 
{
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        success: true,
        status: "Metamask successfuly connected.",
        address: addressArray[0],
      };
      checkNetwork();
      return obj;
    } catch (err) {
      return {
        success: false,
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  }
  else {
    return {
      success: false,
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual BSC wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getValidWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          success: true,
          address: addressArray[0],
          status: "Fill in the text-field above.",
        };
      } else {
        return {
          success: false,
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        success: false,
        address: "",
        status: "Something went wrong: " + err.message,
      };
    }
  } else {
    return {
      success: false,
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual BSC wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getBalanceOfAccount = async (address) => 
{
  try {
    //let accounts = await web3.eth.getAccounts();

    let accountBalance = await window.web3.eth.getBalance(address);

    accountBalance = window.web3.utils.fromWei(accountBalance);

    return {
      success: true,
      account: address,
      balance: accountBalance
    }
  } catch (error) {

    return {
      success: false,
      balance: 0,
      result: "Something went wrong: " + error.message
    }
  }
}

export const compareWalllet = (first, second) => 
{
  if (!first || !second) {
    return false;
  }
  if (first.toUpperCase() === second.toUpperCase()) {
    return true;
  }
  return false;
}

export const singleMintOnSale = async (currentAddr, itemId, auctionInterval, auctionPrice, kind = 0) => 
{
  /*
  Single Sell :  singleMintOnSale(string memory _tokenHash, uint _interval, uint _startPrice, uint24 _royalty, uint8 _kind)
  */
  
  const web3 = window.web3;  
  if(auctionInterval === undefined || auctionInterval <=0 || auctionInterval === null)
    auctionInterval = 0;

  try 
  {
    let item_price = web3.utils.toWei(auctionPrice !== null ? auctionPrice.toString() : '0', 'ether');
    var interval = Math.floor(Number(auctionInterval)).toString();
    //let mintingFee = web3.utils.toWei(author.minting_fee !== null ? author.minting_fee.toString() : '0', 'ether');
    
    await PinkFactoryContract.methods.singleMintOnSale(itemId, interval, item_price, kind).send({ from: currentAddr});

    return {
      success: true,
      status: "Put on sale succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 2: " + error.message          
    };
  }
}

export const placeABid = async (currentAddr, tokenId, bidPrice) =>
{
  /*
  Place Bid : function placeBid(string memory _tokenHash)
  */
  const web3 = window.web3;  

  try 
  {
    let item_price = web3.utils.toWei(bidPrice !== null ? bidPrice.toString() : '0', 'ether');
    await PinkFactoryContract.methods.placeBid(tokenId).send({ from: currentAddr, value: item_price});

    return {
      success: true,
      status: "Placing a bid succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 4: " + error.message          
    };
  }
}

export const destroySale = async (currentAddr, tokenId) => 
{
  /*
  Cancel Sale : destroySale(string memory _tokenHash)
  */ 

  try 
  {
    await PinkFactoryContract.methods.destroySale(tokenId).send({ from: currentAddr});

    return {
      success: true,
      status: "Destroying a sale succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 6: " + error.message          
    };
  }
}

export const buyNow = async (currentAddr, tokenId, price) =>
{
  /*
  acceptOrEndBid(string memory _tokenHash)
  */  

  try 
  {
    let item_price = window.web3.utils.toWei(price !== null ? price.toString() : '0', 'ether');
    //alert("tokenHash = " +  tokenId + ", price=" + item_price);
    await PinkFactoryContract.methods.buyNow(tokenId).send({ from: currentAddr, value: item_price});

    return {
      success: true,
      status: "Placing a bid succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 8: " + error.message          
    };
  }
}

export const acceptOrEndBid = async (currentAddr, tokenId) =>
{
  /*
  acceptOrEndBid(string memory _tokenHash)
  */  
  try 
  {
    await PinkFactoryContract.methods.acceptOrEndBid(tokenId).send({ from: currentAddr});

    return {
      success: true,
      status: "Placing a bid succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 12: " + error.message          
    };
  }
}

export const getAvaxPrice = async () => {
  var reserve = await pairContract.methods.getReserves().call();
  return reserve;
}

export const batchMintOnSale = async (currentAddr, itemIds = [], auctionInterval, auctionPrice, kind = 0) => 
{
  /*
  Batch Sell :  batchMintOnSale(string memory _tokenHash, uint _interval, uint _startPrice, uint24 _royalty, uint8 _kind)
  */
  
  const web3 = window.web3;  
  if(auctionInterval === undefined || auctionInterval <=0 || auctionInterval === null)
    auctionInterval = 0;

    console.log("before creating contract")

  try 
  {
    let item_price = web3.utils.toWei(auctionPrice !== null ? auctionPrice.toString() : '0', 'ether');
    var interval = Math.floor(Number(auctionInterval)).toString();
    //let mintingFee = web3.utils.toWei(author.minting_fee !== null ? author.minting_fee.toString() : '0', 'ether');    
    await PinkFactoryContract.methods.batchMintOnSale(itemIds, interval, item_price, kind).send({ from: currentAddr});

    return {
      success: true,
      status: "Put on sale succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 14: " + error.message          
    };
  }
}

export const transferNFT = async (currentAddr, toAddr, tokenId) =>
{
  /*
    transferNFT(address to, string memory tokenHash)
  */  

  try 
  {
    await PinkFactoryContract.methods.transferNFT(toAddr, tokenId).send({ from: currentAddr});

    return {
      success: true,
      status: "Transfering a NFT succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 16: " + error.message          
    };
  }
}

export const whoHasTokenNow = async (currentAddr, tokenId) =>
{
  /*
    //getBalanceOf(address user, string memory tokenHash, 0)   //0: our NFT, other : NFT's from other nft marketplaces
  */  
  // alert(" address: " + currentAddr+", tokenhash = " +  tokenId);
  
  try 
  {
    let queryRet = await PinkFactoryContract.methods.getBalanceOf(currentAddr, tokenId, "0x0000000000000000000000000000000000000000").call();

    // alert("queryRet = "+ queryRet);

    if(Number(queryRet) === 0) return 0;  //token is on smart contract, it means the nft is on sale
    else return 1; // it means you have this NFT no on sale

  } catch (error) {    
    console.log( "Something went wrong 18: " + error.message )
  }
}

export const burnNFT = async (currentAddr, tokenId) =>
{
  /*
    //burnNFT(string memory tokenHash)
  */  
  // alert("tokenhash = " +  tokenId +  " address: " + currentAddr);
  
  try 
  {
    await PinkFactoryContract.methods.burnNFT(tokenId).send({ from: currentAddr});

    return {
      success: true,
      status: "Burning a NFT succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 20: " + error.message          
    };
  }
}

export const changePrice = async (currentAddr, tokenId, newPrice) =>
{
  /*
    //changePrice(string memory tokenHash, uint256 newPrice)
  */  
  const web3 = window.web3;  
  
  try 
  {
    let item_price = web3.utils.toWei(newPrice !== null ? newPrice.toString() : '0', 'ether');

    await PinkFactoryContract.methods.changePrice(tokenId, item_price).send({ from: currentAddr});

    return {
      success: true,
      status: "Changing price of NFT succeed"          
    };

  } catch (error) {
    return {
      success: false,
      status: "Something went wrong 22: " + error.message          
    };
  }
}



