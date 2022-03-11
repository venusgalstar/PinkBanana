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

import { getNftDetail } from "../../../store/actions/nft.actions";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import config from "../../../config";
import { singleMintOnSale, placeABid, buyNow, performBid } from "../../../InteractWithSmartContract/interact";
import { checkNetworkById } from "../../../InteractWithSmartContract/interact";

import { io } from 'socket.io-client';
var socket = io(`${config.socketUrl}`);
socket.on("disconnect", () =>
{
  console.log("disconnected");
  setTimeout(() =>
  {
    socket.connect();
  }, 1000)
})

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

  const auth = useSelector(state => state.auth.user);
  const nft = useSelector(state => state.nft.detail);
  const avax = useSelector(state => state.user.avax);
  const serviceFee = useSelector(state => state.nft.serviceFee);

  const dispatch = useDispatch();
  const params = useParams();

  useEffect(() => {
    
    socket.on("UpdateStatus", data => 
    {
      console.log("status updated!:", data);
      getNftDetail(params.id)(dispatch);
    });
  }, [])

  useEffect(() => {
    getNftDetail(params.id)(dispatch);
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

  const cofirmBuy = async () => 
  {
    setVisibleModalPurchase(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    let ret = await buyNow(auth.address, params.id, nft.price);
    if (ret.success === true) 
    {
      setProcessing(false);
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
      setAlertParam({state: "success", title:"Success", content:"You 've bought a NFT."});      
      setVisibleModal(true);
    }
    else {
      console.log("failed on buyNow : ", ret.status);
      setProcessing(false);
      setAlertParam({state: "error", title:"Error", content:"You 've failed in buying a NFT."});      
      setVisibleModal(true);
    }
    setProcessing(false);
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

    let ret = await placeABid(auth.address, params.id, bidPrice);
    if (ret.success === true) 
    {
      setProcessing(false);
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
      setAlertParam({state: "success", title:"Success", content:"You 've placed a bid."});      
      setVisibleModal(true);
    }
    else {
      console.log("failed on place a bid : ", ret.status);
      setProcessing(false);
      setAlertParam({state: "error", title:"Error", content:"You 've failed in placing a bid."});      
      setVisibleModal(true);
    }
    setProcessing(false);
  }

  const onPutSale = async (price, instant, period) => 
  {
    console.log("put sale:", price, "instant:", instant, "period:", period);
    setVisibleModalSale(false);

    if(Number(price) <= 0 || Number(price) === NaN)
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

    let ret = await singleMintOnSale(auth.address, params.id, aucperiod * 24 * 3600, price, 0);
    if (ret.success === true) 
    {
      setProcessing(false);
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
      setAlertParam({state: "success", title:"Success", content:"You 've put a NFT on sale."});      
      setVisibleModal(true);
    }
    else {
      console.log("failed on put on sale : ", ret.status);
      setProcessing(false);
      setAlertParam({state: "error", title:"Error", content:"You 've failed in put a NFT on sale."});      
      setVisibleModal(true);
    }
    setProcessing(false);
  }

  const onAccept = async () => {
    setVisibleModalAccept(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    let ret;
    if (params.id) ret = await performBid(auth.address, params.id);
    else {
      setAlertParam({state: "warning", title:"Warning", content:"Invalid NFT."});      
      setVisibleModal(true);
      return;
    }

    if (ret.success === true) 
    {
      setProcessing(false);
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
      setAlertParam({state: "success", title:"Success", content:"You 've accept a final bid and sold your NFT."});      
      setVisibleModal(true);
    }
    else {
      console.log("failed on place accept : ", ret.status);
      setProcessing(false);
      setAlertParam({state: "error", title:"Error", content:"You 've failed accepting a bid."});      
      setVisibleModal(true);
    }
    setProcessing(false);
  }

  // const purchaseNow = () => {
  //   const items = [
  //     {
  //       title: "0.007",
  //       value: "AVAX",
  //     },
  //     {
  //       title: "Your balance",
  //       value: "8.498 AVAX",
  //     },
  //     {
  //       title: "Service fee",
  //       value: "0 AVAX",
  //     },
  //     {
  //       title: "You will pay",
  //       value: "0.007 AVAX",
  //     },
  //   ];
  //   setVisibleModalPurchase(true);
  //   // setBuyCheckList(items);
  // }

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
                  <div className={styles.price}>${Number(nft.bids[nft.bids.length - 1].price * avax).toFixed(2)}</div>
                </div>
              </div>
            </div> : <></>
        }
        <div className={styles.btns}>
          {
            nft && auth && nft.isSale === 1 && nft.owner._id !== auth._id ?

              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalPurchase(true)}
              >
                Purchase now
              </button> : <></>
          }
          {
            nft && auth && nft.isSale === 2 && nft.owner._id !== auth._id ?
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
            nft && auth && nft.isSale === 2 && nft.owner._id === auth._id ?
              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalAccept(true)}
              >
                Accept
              </button> : <></>
          }
        </div>
       
        <div className={styles.text}>
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
        </div>
        {nft && nft.isSale === 0 && nft.owner._id === auth._id ?
          <div className={styles.foot}>
            <button
              className={cn("button", styles.button)}
              onClick={() => setVisibleModalSale(true)}
            >
              Put on sale
            </button>
          </div> : <></>
        }
        <div className={styles.note}>
          You can sell this token on Cryptor Marketplace
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
