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

import { getNftDetail, buyNft } from "../../../store/actions/nft.actions";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { putSale } from "../../../store/actions/user.action";
import config from "../../../config";
import { setBid, acceptBid } from "../../../store/actions/bid.actions";


const Control = ({ className, id }) => 
{
  const [visibleModalPurchase, setVisibleModalPurchase] = useState(false);
  const [visibleModalBid, setVisibleModalBid] = useState(false);
  const [visibleModalAccept, setVisibleModalAccept] = useState(false);
  const [visibleModalSale, setVisibleModalSale] = useState(false);

  const [buyCheckList, setBuyCheckList] = useState([]);

  const [bidPrice, setBidPrice] = useState(0);

  const auth = useSelector(state => state.auth.user);
  const nft = useSelector(state => state.nft.detail);

  const dispatch = useDispatch();
  const params = useParams();
  useEffect(() => {
    getNftDetail(params.id)(dispatch);
  }, [params, dispatch]);

  const cofirmBuy = () => {
    setVisibleModalPurchase(false);
    buyNft(params.id, nft.price, nft.owner._id, auth._id)(dispatch);
  }

  const changeBidPrice = (value) => {
    setBidPrice(value);
    console.log("bid value:", value);
  }

  const onBid = () => {
    console.log("on bid");
    setVisibleModalBid(false);
    setBid(nft._id, auth._id, bidPrice)(dispatch);
  }

  const onPutSale = (price, instant, period) => {
    console.log("put sale:", price, "instant:", instant, "period:", period);
    setVisibleModalSale(false);
    putSale(params.id, auth._id, price, instant, period)(dispatch);
  }

  const onAccept = () => {
    setVisibleModalAccept(false);
    acceptBid(params.id)(dispatch);
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
            nft && auth && nft.isSale == 2 && nft.owner._id != auth._id?
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
        {nft && nft.isSale == 0 && nft.owner._id == auth._id ? //"621c330d0b33ba73438c3c03"? //auth._id
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
    
        <Accept onOk={onAccept} onCancel={()=>{setVisibleModalAccept(false)}}/>
      </Modal>
      <Modal
        visible={visibleModalSale}
        onClose={() => setVisibleModalSale(false)}
      >
        <PutSale onOk={onPutSale} onCancel={() => setVisibleModalSale(false)} />
      </Modal>
    </>
  );
};

export default Control;
