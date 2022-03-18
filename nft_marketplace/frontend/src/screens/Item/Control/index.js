import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import cn from "classnames";
import styles from "./Control.module.sass";
import Checkout from "./Checkout";
// import Connect from "../../../components/Connect";
import Bid from "../../../components/Bid";
import Accept from "./Accept";
import PutSale from "./PutSale";
// import SuccessfullyPurchased from "./SuccessfullyPurchased";
import Modal from "../../../components/Modal";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "../../../components/Alert";

import { emptyNFTTradingResult, getNftDetail } from "../../../store/actions/nft.actions";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import config from "../../../config";
import { singleMintOnSale, placeBid, buyNow, acceptOrEndBid } from "../../../InteractWithSmartContract/interact";
import { checkNetworkById } from "../../../InteractWithSmartContract/interact";
import { getBalanceOf, destroySale } from "../../../InteractWithSmartContract/interact";
import { useHistory } from "react-router-dom";

import { io } from 'socket.io-client';
var socket = io(`${config.socketUrl}`);

const Control = ({ className, id }) => 
{
  const [visibleModalPurchase, setVisibleModalPurchase] = useState(false);
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [visibleModalSale, setVisibleModalSale] = useState(false);
  const currentWalletAddress = useSelector(state => state.auth.currentWallet);
  const currentChainId = useSelector(state => state.auth.currentChainId);
  const [bidPrice, setBidPrice] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);
  const history = useHistory();

  const auth = useSelector(state => state.auth.user);
  const nft = useSelector(state => state.nft.detail);
  const avax = useSelector(state => state.user.avax);
  const tradingResult = useSelector(state => state.nft.tradingResult)

  const dispatch = useDispatch();
  const params = useParams();

  useEffect(() => {
    
    socket.on("UpdateStatus", data => 
    {
      console.log("status updated!:", data);
      if(params.id) 
      {
        if(data.type === "BURN_NFT" && data.data.itemId === params.id) 
        {
          history.push(`/collectionItems/${data.data.colId}`)
          return;
        }
        getNftDetail(params.id)(dispatch);
      }
      
    });
  }, [dispatch, params, history])

  useEffect(() => {
    if(params.id) getNftDetail(params.id)(dispatch);
  }, [params, dispatch]);

  const checkWalletAddrAndChainId = async () => 
  {
    if(Object.keys(auth).length === 0)
    {
      setAlertParam({state: "warning", title:"Warning", content:"You have to sign in before creting a item."});      
      setVisibleModal(true);
      console.log("Invalid account.");
      return false;
    }
    if (currentWalletAddress && auth && auth.address && currentWalletAddress.toLowerCase() !== auth.address.toLowerCase()) {
      setAlertParam({state: "warning", title:"Warning", content:"Wallet addresses are not equal. Please check current wallet to your registered wallet."});      
      setVisibleModal(true);
      return false;
    }
    var result = await checkNetworkById(currentChainId);
    if (!result) {
      setAlertParam({state: "warning", title:"Warning", content:"Please connect to Avalanche network and try again."});      
      setVisibleModal(true);
      return false;
    }
    return true;
  }

  useEffect(() =>
  {
    if(tradingResult)
    {
      setProcessing(false);
      switch(tradingResult.function)
      {
        default : 
          setVisibleModal(false); 
          break;
        case "buyNow":
          if(tradingResult.success)
          {
            setAlertParam({state: "success", title:"Success", content:"You 've bought a NFT."});  
          }else{
            setAlertParam({state: "error", title:"Error", content:"You 've failed in buying a NFT."});
          }    
          setVisibleModal(true);  
          break;
        case "placeBid":
          if(tradingResult.success)
          {
            setAlertParam({state: "success", title:"Success", content:"You 've placed a bid."});      
          }else{
            setAlertParam({state: "error", title:"Error", content:"You 've failed in placing a bid."});  
          }
          setVisibleModal(true);  
          break;
        case "singleMintOnSale":
          if(tradingResult.success)
          {
            setAlertParam({state: "success", title:"Success", content:"You 've put a NFT on sale."});     
          }else{
            setAlertParam({state: "error", title:"Error", content:"You 've failed in put a NFT on sale."});   
          }
          setVisibleModal(true);  
          break;
        case "destroySale":
          if(tradingResult.success)
          {
            setAlertParam({state: "success", title:"Success", content:"You 've removed a NFT from sale."});      
          }else{
            setAlertParam({state: "error", title:"Error", content:"Failed in removing a NFT from sale."});   
          }
          setVisibleModal(true);  
          break;
        case "acceptOrEndBid":
          if(tradingResult.success)
          {
            setAlertParam({state: "success", title:"Success", content:"You 've accept a final bid and sold your NFT."});   
          }else{
            setAlertParam({state: "error", title:"Error", content:"You 've failed accepting a bid."}); 
          }
          setVisibleModal(true);  
          break;
      }
      dispatch(emptyNFTTradingResult());    
      getNftDetail(params.id)(dispatch);
    }
  }, [tradingResult, params, dispatch])

  const cofirmBuy = async () => 
  {
    setVisibleModalPurchase(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }
    await buyNow(auth.address, params.id, nft.price);
  }

  const changeBidPrice = (value) => {
    setBidPrice(value);
  }

  const onBid = async () => {
    setVisibleModalBid(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }
    await placeBid(auth.address, params.id, bidPrice);      
  }

  const onPutSale = async (price, instant, period) => 
  {
    console.log("put sale:", price, "instant:", instant, "period:", period);
    setVisibleModalSale(false);

    if(Number(price) <= 0 || isNaN(price))
    {      
      setAlertParam({state: "error", title:"Error", content:"Invalid price."});      
      setVisibleModal(true);
      return;
    }

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    var aucperiod = instant === true ? 0 : period;
    
    await singleMintOnSale(auth.address, params.id, aucperiod * 24 * 3600, price, 0);
      
  }

  const removeSale = async () => 
  {
    console.log("nft = ", nft);
    
    if(nft.owner._id !== auth._id)
    {
      setAlertParam({state: "warning", title:"Warning", content:"You are not the owner of this nft."});      
      setVisibleModal(true);
      return;
    }    

    if(nft.bids.length >0 && nft.isSale === 2 )
    {
      setAlertParam({state: "warning", title:"Warning", content:"You cannot remove it from sale because you had one or more bid(s) already."});      
      setVisibleModal(true);
      return;
    }

    setProcessing(true);
    try{
      let iHaveit = await getBalanceOf(auth.address, params.id);
      if(iHaveit === 1)
      {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"Your NFT is not on sale."});      
        setVisibleModal(true);
        return;      
      }
    }catch(err)
    {
      console.log("getBalanceOf error : ", err.message)
    }
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }
      
    await destroySale(auth.address, params.id );
     
  }

  const onAccept = async () => {
    setVisibleModalAccept(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    await acceptOrEndBid(auth.address, params.id);
    
  }

  const onOk = () => { 
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  return (
    <>
      <div className={cn(styles.control, className)}>
        {
          nft && nft.bids.length > 0 ?
            <div className={styles.head}>
              <div className={styles.avatar}>
                <img src={config.imgUrl + nft.bids[nft.bids.length - 1].user_id.avatar} alt="Avatar" />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>
                  Highest bid by <span>{nft.bids[nft.bids.length - 1].user_id.username}</span>
                </div>
                <div className={styles.cost}>
                  <div className={styles.price}>{nft.bids[nft.bids.length - 1].price} AVAX</div>
                  <div className={styles.price}>${(Number(nft.bids[nft.bids.length - 1].price) && avax) ?
                    Number(nft.bids[nft.bids.length - 1].price) * avax : 0
                  }</div>
                </div>
              </div>
            </div> : <></>
        }
        <div className={styles.btns}>
          {
            nft && auth && nft.isSale === 1 && nft.owner && nft.owner._id !== auth._id ?

              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalPurchase(true)}
              >
                Purchase now
              </button> : <></>
          }
          {
            nft && auth && nft.isSale === 2 && nft.owner && nft.owner._id !== auth._id ?
              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalBid(true)}
              >
                Place a bid
              </button> : <></>
          }
          {/* <button className={cn("button-stroke", styles.button)}>
            View all
          </button> */}
          {
            nft && auth && nft.isSale === 2 && nft.owner && nft.owner._id === auth._id ?
             nft.bids.length > 0 ?
              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalAccept(true)}
              >
                Accept
              </button>
              :
              <button
              className={cn("button", styles.button)}
              onClick={() => removeSale()}
              >
                Remove
              </button>
            :<></>
          }
        </div>
       
        {/* <div className={styles.text}>
          Service fee <span className={styles.percent}>{serviceFee}%</span>{" "} 
          {
            nft ? 
            <>
              <span>{Number(serviceFee*0.01*(nft.isSale ===0? 0 : (nft.isSale ===1? nft.price : nft.auctionPrice))).toFixed(4)} AVAX</span> 
              <span>${Number(serviceFee*0.01*(nft.isSale ===0? 0 : (nft.isSale ===1? nft.price : nft.auctionPrice)) * avax).toFixed(2)}</span>
            </>
            :
            <>
              <span>0 AVAX</span> 
              <span>$ 0</span>
            </>
          }       
        </div> */}
        {nft && nft.owner && nft.owner._id === auth._id  && nft.isSale === 0 &&
          <div className={styles.foot}>
            <button
              className={cn("button", styles.button)}
              onClick={() => setVisibleModalSale(true)}
            >
              Put on sale
            </button>
          </div> 
        }
        {nft && nft.owner && nft.owner._id === auth._id  && nft.isSale === 1 &&
          <div className={styles.foot}>
            <button
              className={cn("button", styles.button)}
              onClick={() => removeSale()}
            >
              Remove
            </button>
          </div> 
        }
        <div className={styles.note}>
          {/* You can sell this token on Pink Banana */}
        </div>
      </div>
      <Modal
        visible={visibleModalPurchase}
        onClose={() => setVisibleModalPurchase(false)}
      >
        <Checkout onOk={cofirmBuy} nft={nft}/>
        {/* <SuccessfullyPurchased /> */}
      </Modal>
      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >
        {/* <Connect /> */}
        <Bid onChange={changeBidPrice} onOk={onBid} onCancel={() => setVisibleModalBid(false)} nft={nft}/>
      </Modal>
      <Modal
        visible={visibleModalAccept}
        onClose={() => setVisibleModalAccept(false)} >
        <Accept onOk={onAccept} onCancel={() => { setVisibleModalAccept(false) }} nft={nft} />
      </Modal>
      <Modal
        visible={visibleModalSale}
        onClose={() => setVisibleModalSale(false)}
      >
        <PutSale onOk={onPutSale} onCancel={() => setVisibleModalSale(false)} />
      </Modal>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="OK" onOk={onOk} onCancel={onCancel} />
      </Modal>
      {<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={processing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>}
    </>
  );
};

export default Control;
