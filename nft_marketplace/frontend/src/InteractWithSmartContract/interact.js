import Web3 from 'web3/dist/web3.min.js';
import config from "../config";
import store from "../store";
import { setNFTTradingResult } from '../store/actions/nft.actions';
import { setConnectedChainId, setConnectedWalletAddress, setWalletStatus, updateBalanceOfUser } from '../store/actions/auth.actions';
const pinkBananaFactoryABI = config.pinkContractAbi;
const pinkBananaFactoryAddress = config.pinkContractAddress;

const gWeb3 = new Web3(config.mainNetUrl);
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
  } 
  else if (window.web3) 
  {
    window.web3 = new Web3(Web3.givenProvider);
    window.web3.eth.handleRevert = true;
  } 
  else {
    // window.alert(
    //   "Non-Ethereum browser detected. Please connect and unlock your wallet."
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
      store.dispatch(setConnectedWalletAddress(0))
      store.dispatch(setWalletStatus(false));
    });
    window.ethereum.on('accountsChanged', function(accounts /*: Array<string>*/) {
      //  alert("wallet "+accounts[0]+" is connected");
       if(accounts[0]   !== undefined)
       {
        store.dispatch(setConnectedWalletAddress(accounts[0]))
        store.dispatch(setWalletStatus(true));
       }
       if(accounts.length === 0) store.dispatch(setWalletStatus(false));
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
  store.dispatch(setConnectedChainId(cid));
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
  try{
    await window.web3.eth.personal.sign(window.web3.utils.toHex(msgHash), address, function (err, result) 
    {
      if (err) {
        console.error(err);
        return {
          success: false,
          message: err
        }
      }
      signedString = result;
      console.log('SIGNED:' + result)
    })
    return {
      success: true,
      message: signedString
    }
  }catch(err){
    return {
      success: false,
      message: err.message
    }
  }
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
        message: "Metamask successfuly connected.",
        address: addressArray[0],
      };
      checkNetwork();
      store.dispatch(setWalletStatus(true));
      return obj;
    } catch (err) {
      store.dispatch(setWalletStatus(false));
      return {
        success: false,
        address: "",
        message: err.message,
      };
    }
  }
  else {
    store.dispatch(setWalletStatus(false));
    return {
      success: false,
      address: "",
      message: (
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
        store.dispatch(setWalletStatus(true));
        return {
          success: true,
          address: addressArray[0],
          status: "Fill in the text-field above.",
        };
      } else {
        store.dispatch(setWalletStatus(false));
        return {
          success: false,
          address: "",
          status: "🦊 Please connect to Metamask.",
        };
      }
    } catch (err) {
      store.dispatch(setWalletStatus(false));
      return {
        success: false,
        address: "",
        status: err.message,
      };
    }
  } else {
    store.dispatch(setWalletStatus(false));
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

    store.dispatch(updateBalanceOfUser(accountBalance));

    return {
      success: true,
      account: address,
      balance: accountBalance
    }
  } catch (error) {
    
    store.dispatch(updateBalanceOfUser(0));

    return {
      success: false,
      balance: 0,
      result: "Something went wrong: " + parseErrorMsg(error.message)
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

const updateUserBalanceAfterTrading = async (currentAddr) =>
{
  let balanceOfUser = await window.web3.eth.getBalance(currentAddr);
  balanceOfUser = window.web3.utils.fromWei(balanceOfUser);
  store.dispatch(updateBalanceOfUser(balanceOfUser));
}

const parseErrorMsg = (errMsg) =>
{  
  var returStr  = "";
  let startPos = JSON.stringify(errMsg).search("message");
  if(startPos >= 0)
  {
    let subStr = errMsg.substring(startPos+4, errMsg.length)
    let endPos = subStr.indexOf("\"");
    if(endPos >= 0)
    {
      subStr = subStr.substring(0, endPos);
      returStr = subStr;
    }
  }else returStr = errMsg;
  return returStr;
}

export const singleMintOnSale = async (currentAddr, itemId, auctionInterval, auctionPrice, kind = 0) => 
{
  /*
  Single Sell :  singleMintOnSale(string memory _tokenHash, uint _interval, uint _startPrice, uint24 _royalty, uint8 _kind)
  */
  
  if(auctionInterval === undefined || auctionInterval <=0 || auctionInterval === null)
    auctionInterval = 0;

  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    let item_price = window.web3.utils.toWei(auctionPrice !== null ? auctionPrice.toString() : '0', 'ether');
    var interval = Math.floor(Number(auctionInterval)).toString();
    //let mintingFee = web3.utils.toWei(author.minting_fee !== null ? author.minting_fee.toString() : '0', 'ether');
    
    var singleMintOnSale = PinkFactoryContract.methods.singleMintOnSale(itemId, interval, item_price, kind);
    let gasFee = await singleMintOnSale.estimateGas({ from: currentAddr});
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) {
      store.dispatch(setNFTTradingResult("singleMintOnSale", false, "Insufficient balance." ));
    
      return {
        success : false,
        message : "Insufficient balance."
      }
    }
    await singleMintOnSale.send({ from: currentAddr});

    store.dispatch(setNFTTradingResult("singleMintOnSale", true, "Succeed in put on sale"));

    updateUserBalanceAfterTrading(currentAddr);

    return {
      success : true,
      message : "Succeed on minting a item"
    }
  } catch (error) {
    
    store.dispatch(setNFTTradingResult("singleMintOnSale", false, parseErrorMsg(error.message) ));

    return {
      success : false,
      message : parseErrorMsg(error.message)
    }
  }
}

export const placeBid = async (currentAddr, tokenId, bidPrice) =>
{
  /*
  Place Bid : function placeBid(string memory _tokenHash)
  */
  // alert("placeBid interact.js 00 ")
  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    let item_price = window.web3.utils.toWei(bidPrice !== null ? bidPrice.toString() : '0', 'ether');
    var placeBid = PinkFactoryContract.methods.placeBid(tokenId);

    console.log("placeBid 00")

    var doContinue = true;
    let gasFee = await placeBid.estimateGas({ from: currentAddr, value: item_price}).then(() => {
    }).catch((error) =>{

    console.log("placeBid 11")

      doContinue = false;
      store.dispatch(setNFTTradingResult("placeBid", false, parseErrorMsg(error.message) ));
      return;
    });
    if(!doContinue) return;

    console.log("placeBid 22")

    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    console.log("placeBid 33")

    if (balanceOfUser <= gasFee * gasPrice ) {

    console.log("placeBid 44")

      store.dispatch(setNFTTradingResult("placeBid", false, "Insufficient balance." ));
      return;
    }

    console.log("placeBid 55")

    await placeBid.send({ from: currentAddr, value: item_price});

    console.log("placeBid 66")

    store.dispatch(setNFTTradingResult("placeBid", true, "Succeed in placing a bid."));

    console.log("placeBid 77")

    updateUserBalanceAfterTrading(currentAddr);

    console.log("placeBid 88")

  } catch (error) {
    
    console.log("placeBid 99")

    // alert(error.message)
    store.dispatch(setNFTTradingResult("placeBid", false, parseErrorMsg(error.message) ));
  }
}

export const destroySale = async (currentAddr, tokenId) => 
{
  /*
  Cancel Sale : destroySale(string memory _tokenHash)
  */ 

  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    var destroySale = PinkFactoryContract.methods.destroySale(tokenId);
    let gasFee = await destroySale.estimateGas({ from: currentAddr });
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) {
      store.dispatch(setNFTTradingResult("destroySale", false, "Insufficient balance." ));
      return;
    }
    await destroySale.send({ from: currentAddr});

    store.dispatch(setNFTTradingResult("destroySale", true, "Succeed in destroying a sale."));

    updateUserBalanceAfterTrading(currentAddr);

  } catch (error) {
    store.dispatch(setNFTTradingResult("destroySale", false, parseErrorMsg(error.message) ));
  }
}

export const buyNow = async (currentAddr, tokenId, price) =>
{
  /*
  acceptOrEndBid(string memory _tokenHash)
  */  

  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    let item_price = window.web3.utils.toWei(price !== null ? price.toString() : '0', 'ether');
    //alert("tokenHash = " +  tokenId + ", price=" + item_price);
    var buyNow = PinkFactoryContract.methods.buyNow(tokenId);
    let gasFee = await buyNow.estimateGas({ from: currentAddr, value: item_price});
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) 
    {
      store.dispatch(setNFTTradingResult("buyNow", false, "Insufficient balance." ));
      return;
    }
    await buyNow.send({ from: currentAddr, value: item_price});

    store.dispatch(setNFTTradingResult("buyNow", true, "Succeed in purchasing a NFT."));

    updateUserBalanceAfterTrading(currentAddr);

  } catch (error) {
    store.dispatch(setNFTTradingResult("buyNow", false, parseErrorMsg(error.message) ));
  }
}

export const acceptOrEndBid = async (currentAddr, tokenId) =>
{
  /*
  acceptOrEndBid(string memory _tokenHash)
  */  
  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    var acceptOrEndBid = PinkFactoryContract.methods.acceptOrEndBid(tokenId);
    let gasFee = await acceptOrEndBid.estimateGas({ from: currentAddr });
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) {
      store.dispatch(setNFTTradingResult("acceptOrEndBid", false, "Insufficient balance." ));
      return;
    }
    await acceptOrEndBid.send({ from: currentAddr});

    store.dispatch(setNFTTradingResult("acceptOrEndBid", true, "Succeed in ending sale."));

    updateUserBalanceAfterTrading(currentAddr);

  } catch (error) {
    store.dispatch(setNFTTradingResult("acceptOrEndBid", false, parseErrorMsg(error.message) ));
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
  
  if(auctionInterval === undefined || auctionInterval <=0 || auctionInterval === null)
    auctionInterval = 0;

    console.log("before creating contract")

  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    let item_price = window.web3.utils.toWei(auctionPrice !== null ? auctionPrice.toString() : '0', 'ether');
    var interval = Math.floor(Number(auctionInterval)).toString();
    //let mintingFee = web3.utils.toWei(author.minting_fee !== null ? author.minting_fee.toString() : '0', 'ether');   
    
    var batchMintOnSale = PinkFactoryContract.methods.batchMintOnSale(itemIds, interval, item_price, kind);
    let gasFee = await batchMintOnSale.estimateGas({ from: currentAddr });
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) {
      store.dispatch(setNFTTradingResult("batchMintOnSale", false, "Insufficient balance." ));
      return {
        success : false,
        message : "Insufficient balance"
      }
    }

    await batchMintOnSale.send({ from: currentAddr});

    store.dispatch(setNFTTradingResult("batchMintOnSale", true, "Succeed in batch minitng." ));

    updateUserBalanceAfterTrading(currentAddr);   

    return {
      success : true,
      message : "Succeed on minting multiple items"
    }
  } catch (error) {
    store.dispatch(setNFTTradingResult("batchMintOnSale", false, parseErrorMsg(error.message) ));
    
    return {
      success : false,
      message : parseErrorMsg(error.message)
    }
  }
}

export const transferNFT = async (currentAddr, toAddr, tokenId) =>
{
  /*
    transferNFT(address to, string memory tokenHash)
  */  

  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    var transferNFT = PinkFactoryContract.methods.transferNFT(toAddr, tokenId);
    let gasFee = await transferNFT.estimateGas({ from: currentAddr });
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) {
      store.dispatch(setNFTTradingResult("transferNFT", false, "Insufficient balance." ));
      return;
    }

    await transferNFT.send({ from: currentAddr});

    store.dispatch(setNFTTradingResult("transferNFT", true, "Succeed in transfering a NFT." ));

    updateUserBalanceAfterTrading(currentAddr);

  } catch (error) {
    store.dispatch(setNFTTradingResult("transferNFT", false, parseErrorMsg(error.message) ));
  }
}

export const getBalanceOf = async (currentAddr, tokenId) =>
{
  /*
    //getBalanceOf(address user, string memory tokenHash, 0)   //0: our NFT, other : NFT's from other nft marketplaces
  */  
  // alert(" address: " + currentAddr+", tokenhash = " +  tokenId);
  
  try 
  {
   
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    let queryRet = await PinkFactoryContract.methods.getBalanceOf(currentAddr, tokenId, "0x0000000000000000000000000000000000000000").call();

    // alert("queryRet = "+ queryRet);

    if(Number(queryRet) === 0) return 0;  //token is on smart contract, it means the nft is on sale
    else return 1; // it means you have this NFT no on sale

  } catch (error) {    
    console.log( "Something went wrong 18: " + parseErrorMsg(error.message) )
    return {
      success: false,
      message: parseErrorMsg(error.message)
    }
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
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    var burnNFT = PinkFactoryContract.methods.burnNFT(tokenId);
    let gasFee = await burnNFT.estimateGas({ from: currentAddr });
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) {
      store.dispatch(setNFTTradingResult("burnNFT", false, "Insufficient balance." ));
      return;
    }
    await burnNFT.send({ from: currentAddr});

    store.dispatch(setNFTTradingResult("burnNFT", true, "Burning a NFT succeed." ));

    updateUserBalanceAfterTrading(currentAddr);

  } catch (error) {
    store.dispatch(setNFTTradingResult("burnNFT", false, parseErrorMsg(error.message) ));
  }
}

export const changePrice = async (currentAddr, tokenId, newPrice) =>
{
  /*
    //changePrice(string memory tokenHash, uint256 newPrice)
  */  
  
  try 
  {
    PinkFactoryContract = await new window.web3.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);
    let item_price = window.web3.utils.toWei(newPrice !== null ? newPrice.toString() : '0', 'ether');

    var changePrice = PinkFactoryContract.methods.changePrice(tokenId, item_price);
    let gasFee = await changePrice.estimateGas({ from: currentAddr });
    // console.log("before getBalance");
    var balanceOfUser = await window.web3.eth.getBalance(currentAddr);
    var gasPrice = 30 * (10 ** 9);

    if (balanceOfUser <= gasFee * gasPrice) 
    {
      store.dispatch(setNFTTradingResult("changePrice", false, "Insufficient balance." ));
      return;
    }
    await changePrice.send({ from: currentAddr});

    store.dispatch(setNFTTradingResult("changePrice", true, "Changing price succeed." ));

    updateUserBalanceAfterTrading(currentAddr);

  } catch (error) {
    store.dispatch(setNFTTradingResult("changePrice", false, parseErrorMsg(error.message) ));
  }
}
