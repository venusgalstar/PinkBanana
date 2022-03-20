import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import styles from "./Hero.module.sass";
import Icon from "../../../components/Icon";
import Player from "../../../components/Player";
import Modal from "../../../components/Modal";
import Bid from "../../../components/Bid";

import { useDispatch, useSelector } from 'react-redux';
import { emptyNFTTradingResult, getNftBannerList } from '../../../store/actions/nft.actions';
import config from "../../../config";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { getNftDetail } from "../../../store/actions/nft.actions";
import { checkNetworkById, placeBid } from "../../../InteractWithSmartContract/interact";
import Alert from "../../../components/Alert";

import { io } from 'socket.io-client';
var socket = io(`${config.socketUrl}`);

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Hero = () => {
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
  };

  const dispatch = useDispatch();
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [biddingNftId, setBiddingNftId] = useState(0);
  const [biddingNft, setBiddingNft] = useState(0);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);

  const nft = useSelector(state => state.nft);
  const auth = useSelector(state => state.auth.user);
  const curTime = useSelector(state => state.bid.system_time);
  const avax = useSelector(state => state.user.avax);
  const currentWalletAddress = useSelector(state => state.auth.currentWallet);
  const currentChainId = useSelector(state => state.auth.currentChainId);
  const tradingResult = useSelector(state => state.nft.tradingResult);
  const walletStatus = useSelector(state => state.auth.walletStatus);

  const checkWalletAddrAndChainId = async () => {
    if (Object.keys(auth).length === 0) {
      setAlertParam({ state: "warning", title: "Warning", content: "You have to sign in before doing a trading." });
      setVisibleModal(true);
      console.log("Invalid account.");
      return false;
    }
    if(walletStatus === false)
    {
      setAlertParam({ state: "warning", title: "Warning", content: "Please connect and unlock your wallet." });
      setVisibleModal(true);
      return false;      
    }
    if (currentWalletAddress && auth && auth.address && currentWalletAddress.toLowerCase() !== auth.address.toLowerCase()) {
      //alert("Wallet addresses are not equal. Please check current wallet to your registered wallet.");
      setAlertParam({ state: "warning", title: "Warning", content: "Wallet addresses are not equal. Please check current wallet to your registered wallet." });
      setVisibleModal(true);
      return false;
    }
    var result = await checkNetworkById(currentChainId);
    if (!result) {
      //alert("Please connect to Avalanche network and try again.");
      setAlertParam({ state: "warning", title: "Warning", content: "Please connect to Avalanche network and try again." });
      setVisibleModal(true);
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (tradingResult) {
      setProcessing(false);
      switch(tradingResult.function)
      {
        default : 
          setVisibleModal(false); 
          break;
        case "placeBid":
          if (tradingResult.success) {
            setAlertParam({ state: "success", title: "Success", content: "You 've placed a bid." });
          } else {
            setAlertParam({ state: "error", title: "Error", content: tradingResult.message });
          }
          setVisibleModal(true);
          break;
      }
      dispatch(emptyNFTTradingResult());
      dispatch(getNftDetail(nft._id));
    }
  }, [tradingResult])

  const getDelta2EndTime = (created, period, curTime) => {

    var createdTime = (new Date(created)).getTime();
    var diff = createdTime + period * 24 * 3600 * 1000 - curTime;
    return diff = diff / 1000;
  }

  const onBid = async (bidPrice) => {

    setVisibleModalBid(false);

    setProcessing(true);
    let checkResut = await checkWalletAddrAndChainId();
    if (!checkResut) {
      setProcessing(false);
      return;
    }

    if (getDelta2EndTime(nft.auctionStarted, nft.auctionPeriod, curTime) <= 12) {
      setTimeout(() => {
        setProcessing(false);
      }, 15000)
    }
    await placeBid(auth.address, biddingNftId, Number(bidPrice));
  }

  useEffect(() => {
    socket.on("UpdateStatus", data => {
      getNftBannerList(100)(dispatch);
    })
  }, []);

  useEffect(() => {
    getNftBannerList(100)(dispatch);
  }, [dispatch])

  useEffect(() => {
    if (nft !== undefined && nft.banner !== undefined) {
      setItemList(nft.banner);
    }
  }, [nft]);

  const getLeftDuration = (created, period, curTime) => {

    var createdTime = (new Date(created)).getTime();
    var diff = createdTime + period * 24 * 3600 * 1000 - curTime;
    diff = diff / 1000;

    var hr = 0;
    var min = 0;
    var sec = 0;

    if (diff > 0) {
      hr = Math.floor(diff / 3600);
      min = Math.floor((diff - 3600 * hr) / 60);
      sec = Math.floor(diff - 3600 * hr - 60 * min);
    } else if (!isNaN(diff) && diff <= 0) {
      // update banner list when this item's auction time is ended
      getNftBannerList(5)(dispatch);
    }

    const hours = () => {
      return hr;
    }
    const minutes = () => {
      return min;
    }
    const seconds = () => {
      return sec;
    }
    return { hours, minutes, seconds }
  }

  const onOk = () => {
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  return (
    <>
      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.head}>
            <div className={styles.stage}>
              Create, explore, & collect digital art NFTs.
            </div>
            <h2 className={cn("h3", styles.title)}>
              The new creative economy.
            </h2>
            <Link className={cn("button-stroke", styles.button)} to="/search01">
              Start your search
            </Link>
          </div>
          <div className={styles.wrapper}>
            <Slider className="creative-slider" {...settings}>
              {
                (itemList && itemList.length > 0) &&
                itemList.map((x, index) => (
                  <div className={styles.slide} key={index}>
                    <div className={styles.row}>
                      <Player className={styles.player} item={x} />
                      <div className={styles.details}>
                        <div className={cn("h1", styles.subtitle)}>{x.name}</div>
                        <div className={styles.line}>
                          <div className={styles.item}>
                            <div className={styles.avatar}>
                              <img src={x.owner ? config.imgUrl + x.owner.avatar : ""} alt="Avatar" />
                            </div>
                            <div className={styles.description}>
                              <div className={styles.category}>Owner</div>
                              <div className={styles.text}>{x.owner ? x.owner.username : ""}</div>
                            </div>
                          </div>
                          <div className={styles.item}>
                            <div className={styles.icon}>
                              <Icon name="stop" size="24" />
                            </div>
                            <div className={styles.description}>
                              <div className={styles.category}>Auction Price</div>
                              <div className={styles.text}>{x.price ? x.price : ""}AVAX</div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.wrap}>
                          <div className={styles.info}>Current Bid</div>
                          <div className={styles.currency}>
                            {/* {x.currency} */}
                            {x.bids && x.bids.length > 0 ? x.bids[x.bids.length - 1].price ? x.bids[x.bids.length - 1].price : 0 : 0} AVAX
                          </div>
                          <div className={styles.price}>
                            $
                            {x.bids && avax && x.bids.length > 0 ? x.bids[x.bids.length - 1].price ? Number(avax * x.bids[x.bids.length - 1].price).toFixed(2) : 0 : 0}
                          </div>
                          <div className={styles.info}>Auction ending in</div>
                          <div className={styles.timer}>
                            <div className={styles.box}>
                              <div className={styles.number}>{getLeftDuration(x.updatedAt, x.auctionPeriod, curTime).hours()}</div>
                              <div className={styles.time}>Hrs</div>
                            </div>
                            <div className={styles.box}>
                              <div className={styles.number}>{getLeftDuration(x.updatedAt, x.auctionPeriod, curTime).minutes()}</div>
                              <div className={styles.time}>mins</div>
                            </div>
                            <div className={styles.box}>
                              <div className={styles.number}>{getLeftDuration(x.updatedAt, x.auctionPeriod, curTime).seconds()}</div>
                              <div className={styles.time}>secs</div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.btns}>
                          {
                            auth && x.owner._id && auth._id && x.owner._id.toLowerCase() === auth._id.toLowerCase() ? <></> :
                              <button
                                className={cn("button", styles.button)}
                                onClick={() => { setVisibleModalBid(true); setBiddingNft(x); setBiddingNftId(x._id) }}
                              >
                                Place a bid
                              </button>
                          }
                          <Link
                            className={cn("button-stroke", styles.button)}
                            to={`/item/${x._id}`}
                          >
                            View item
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
        </div>
      </div>
      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >
        {/* <Connect /> */}
        <Bid onOk={onBid} onCancel={() => setVisibleModalBid(false)} nft={biddingNft} />
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

export default Hero;
