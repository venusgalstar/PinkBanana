import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import styles from "./Hero.module.sass";
import Icon from "../../../components/Icon";
import Player from "../../../components/Player";
import Modal from "../../../components/Modal";
import Connect from "../../../components/Connect";
import Bid from "../../../components/Bid";

import { useDispatch, useSelector } from 'react-redux';
// import Bid from "../../../components/Bid";
import { getNftBannerList } from '../../../store/actions/nft.actions';
import config from "../../../config";
import { setBid } from "../../../store/actions/bid.actions";



const items = [
  {
    title: "the creator network®",
    creator: "Enrico Cole",
    currency: "1.00 AVAX",
    price: "$3,618.36",
    avatar: "/images/content/avatar-creator.jpg",
    image: "/images/content/video-preview.jpg",
    image2x: "/images/content/video-preview@2x.jpg",
  },
  {
    title: "Marco carrillo®",
    creator: "Enrico Cole",
    currency: "2.00 AVAX",
    price: "$2,477.92",
    avatar: "/images/content/avatar-creator.jpg",
    image: "/images/content/video-preview.jpg",
    image2x: "/images/content/video-preview@2x.jpg",
  },
  {
    title: "the creator network®",
    creator: "Enrico Cole",
    currency: "1.00 AVAX",
    price: "$3,618.36",
    avatar: "/images/content/avatar-creator.jpg",
    image: "/images/content/video-preview.jpg",
    image2x: "/images/content/video-preview@2x.jpg",
  },
  {
    title: "Marco carrillo®",
    creator: "Enrico Cole",
    currency: "2.00 AVAX",
    price: "$2,477.92",
    avatar: "/images/content/avatar-creator.jpg",
    image: "/images/content/video-preview.jpg",
    image2x: "/images/content/video-preview@2x.jpg",
  },
];

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
  const [load, setLoad] = useState();
  const nft = useSelector(state => state.nft);
  const [itemList, setItemList] = useState([]);
  const [bidPrice, setBidPrice] = useState();
  const [activeIndex, setActiveIndex] = useState(0);
  const auth = useSelector(state => state.auth.user);
  const curTime = useSelector(state => state.bid.system_time);

  const avax = useSelector(state => state.user.avax);

  const onChangeBidPrice = (value) => {
    setBidPrice(value);
  }

  const onBid = () => {
    setBid(itemList[activeIndex]._id, auth._id, bidPrice)(dispatch);
    setVisibleModalBid(false);
  }

  useEffect(() => {
    getNftBannerList(5)(dispatch);
  }, [load, dispatch])

  useEffect(() => {
    if (nft != undefined && nft.banner !== undefined) {
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
    } else if (!isNaN(diff) && diff <= 0){
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
              {/* {items.map((x, index) => ( */}
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
                              <div className={styles.text}>{x.auctionPrice ? x.auctionPrice : ""}AVAX</div>
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
                            {x.bids && x.bids.length > 0 ? x.bids[x.bids.length - 1].price ? Number(avax * x.bids[x.bids.length - 1].price).toFixed(1) : 0 : 0}                          
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
                          <button
                            className={cn("button", styles.button)}
                            onClick={() => { setVisibleModalBid(true); setActiveIndex(index) }}
                          >
                            Place a bid
                          </button>
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
        <Bid onChange={onChangeBidPrice} onOk={onBid} onCancel={() => setVisibleModalBid(false)} />
      </Modal>
    </>
  );
};

export default Hero;
