import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import cn from "classnames";
import styles from "./Control.module.sass";
import Checkout from "./Checkout";
import Connect from "../../../components/Connect";
import Bid from "../../../components/Bid";
import Accept from "./Accept";
import PutSale from "./PutSale";
// import SuccessfullyPurchased from "./SuccessfullyPurchased";
import Modal from "../../../components/Modal";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { getNftDetail, buyNft } from "../../../store/actions/nft.actions";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { putSale } from "../../../store/actions/user.action";
import config from "../../../config";
import { setBid, acceptBid } from "../../../store/actions/bid.actions";
import { singleMintOnSale, placeABid, buyNow, createSale, performBid } from "../../../InteractWithSmartContract/interact";
import { checkNetworkById } from "../../../InteractWithSmartContract/interact";

const Control = ({ className, id }) => {
  const [visibleModalPurchase, setVisibleModalPurchase] = useState(false);
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [visibleModalSale, setVisibleModalSale] = useState(false);
  const currentWalletAddress = useSelector(state => state.auth.currentWallet);
  const currentChainId = useSelector(state => state.auth.currentChainId);
  const [processing, setProcessing] = useState(false);

  const [buyCheckList, setBuyCheckList] = useState([]);

  const [bidPrice, setBidPrice] = useState(0);

  const auth = useSelector(state => state.auth.user);
  const nft = useSelector(state => state.nft.detail);

  const dispatch = useDispatch();
  const params = useParams();
 
 
  useEffect(() => {
    getNftDetail(params.id)(dispatch);
  }, [params, dispatch]);

  const checkWalletAddrAndChainId = async () => {
    if (currentWalletAddress && auth && auth.address && currentWalletAddress.toLowerCase() !== auth.address.toLowerCase()) {
      //alert("Wallet addresses are not equal. Please check current wallet to your registered wallet.");
      return false;
    }
    var result = await checkNetworkById(currentChainId);
    if (!result) {
      //alert("Please connect to Avalanche network and try again.");
      return false;
    }
    return true;
  }

  const cofirmBuy = async () => {
    setVisibleModalPurchase(false);
    
    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) 
    {
      setProcessing(false);
      return;
    }

    let ret = await buyNow(auth.address, params.id, nft.price);
    if (ret.success === true) {
      //buyNft(params.id, nft.price, nft.owner._id, auth._id)(dispatch);

      //alert("Buying succeed.");
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
    }
    else {
      console.log("failed on buyNow : ", ret.status);
      setProcessing(false);
      //alert(ret.status);
    }
    setProcessing(false);
  }

  const changeBidPrice = (value) => {
    setBidPrice(value);
    console.log("bid value:", value);
  }

  const onBid = async () => {
    console.log("on bid");
    setVisibleModalBid(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut)
    {
      setProcessing(false);
      return;
    }

    let ret = await placeABid(auth.address, params.id, bidPrice);
    if (ret.success === true) {
      //setBid(params.id, auth._id, bidPrice)(dispatch);

      //alert("Bidding succeed.");
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
    }
    else {
      console.log("failed on place a bid : ", ret.status);
      setProcessing(false);
      //alert(ret.status);
    }
    setProcessing(false);
  }

  const onPutSale = async (price, instant, period) => {
    console.log("put sale:", price, "instant:", instant, "period:", period);
    setVisibleModalSale(false);
    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) 
    {
      setProcessing(false);
      return;
    }

    // //alert("checkResut = "+checkResut);

    var aucperiod = instant === true ? 0 : period;

    let ret = await singleMintOnSale(auth.address, params.id, aucperiod*24*3600 , price, 0);
    if (ret.success === true) 
    {
      //putSale(params.id, auth._id, price, instant, period)(dispatch); 

      //alert("Putting on sale succeed.");
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
    }
    else {
      console.log("failed on put on sale : ", ret.status);
      setProcessing(false);
      //alert(ret.status);
    }
    setProcessing(false);
  }

  const onAccept = async () => {
    setVisibleModalAccept(false);
    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) 
    {
      setProcessing(false);
      return;
    }

    let ret;
    if (params.id) ret = await performBid(auth.address, params.id);
    else {
      //alert("Incorrect token ID");
      return;
    }

    if (ret.success === true) {
      //acceptBid( params.id)(dispatch);   

      //alert("Accepting succeed.");
      setTimeout(() => {
        getNftDetail(params.id)(dispatch);
      }, 1000);
    }
    else {
      console.log("failed on place accept : ", ret.status);
      setProcessing(false);
      //alert(ret.status);
    }
    setProcessing(false);
  }

  const purchaseNow = () => {
    const items = [
      {
        title: "0.007",
        value: "AVAX",
      },
      {
        title: "Your balance",
        value: "8.498 AVAX",
      },
      {
        title: "Service fee",
        value: "0 AVAX",
      },
      {
        title: "You will pay",
        value: "0.007 AVAX",
      },
    ];
    setVisibleModalPurchase(true);
    // setBuyCheckList(items);
  }

  useEffect(() => {
    console.log("control nft:", nft);
  }, [nft])

  useEffect(() => {
    console.log("control auth:", auth);
  }, [auth])


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
                  <div className={styles.price}>$2,764.89</div>
                </div>
              </div>
            </div> : <></>
        }
        <div className={styles.btns}>
          {
            nft && auth && nft.isSale == 1 && nft.owner._id != auth._id ?

              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalPurchase(true)}
              >
                Purchase now
              </button> : <></>
          }
          {
            nft && auth && nft.isSale == 2 && nft.owner._id != auth._id ?
              <button
                className={cn("button-stroke", styles.button)}
                onClick={() => setVisibleModalBid(true)}
              >
                Place a bid
              </button> : <></>
          }
          {/* <button className={cn("button-stroke", styles.button)}>
            View all
          </button> */}
          {
            nft && auth && nft.isSale == 2 && nft.owner._id == auth._id ?
              <button
                className={cn("button", styles.button)}
                onClick={() => setVisibleModalAccept(true)}
              >
                Accept
              </button> : <></>
          }
        </div>
        {nft && nft.owner == auth._id ?
          <div className={styles.btns}>
            <button className={cn("button-stroke", styles.button)}>
              View all
            </button>
            <button
              className={cn("button", styles.button)}
              onClick={() => setVisibleModalAccept(true)}
            >
              Accept
            </button>
          </div> : <></>}
        <div className={styles.text}>
          Service fee <span className={styles.percent}>1.5%</span>{" "}
          <span>2.563 AVAX</span> <span>$4,540.62</span>
        </div>
        {nft && nft.isSale == 0 && nft.owner._id == auth._id ?
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
        <Checkout onOk={cofirmBuy} />
        {/* <SuccessfullyPurchased /> */}
      </Modal>
      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >
        {/* <Connect /> */}
        <Bid onChange={changeBidPrice} onOk={onBid} onCancel={() => setVisibleModalBid(false)} />
      </Modal>
      <Modal
        visible={visibleModalAccept}
        onClose={() => setVisibleModalAccept(false)} >

        <Accept onOk={onAccept} onCancel={() => { setVisibleModalAccept(false) }} />
      </Modal>
      <Modal
        visible={visibleModalSale}
        onClose={() => setVisibleModalSale(false)}
      >
        <PutSale onOk={onPutSale} onCancel={() => setVisibleModalSale(false)} />
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
