import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import cn from "classnames";
import styles from "./Item.module.sass";
import Users from "./Users";
import Control from "./Control";
import Options from "./Options";
import { useSelector } from "react-redux";
import config from "../../config";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar'


const navLinks = ["Info", "History", "Bids"];

const categories = [
  {
    category: "",
    content: "",
  },
  {
    category: "black",
    content: "Art",
  },
  {
    category: "purple",
    content: "Game",
  },
  {
    category: "black",
    content: "Photography",
  },
  {
    category: "purple",
    content: "Music",
  },
  {
    category: "black",
    content: "Video",
  }
];


const Item = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { id } = useParams();
  const [processing, setProcessing] = useState(false);

  const nft = useSelector(state => state.nft);
  const [itemDetail, setItemDetail] = useState();
  const [users, setUsers] = useState();
  const avax = useSelector(state => state.user.avax);
  const curTime = useSelector(state => state.bid.system_time);

  useEffect(() => {
    var list = [];
    if (activeIndex === 0) {
      list = [
        {
          name: itemDetail && itemDetail.owner ? itemDetail.owner.username : "",
          id: itemDetail && itemDetail.owner ? itemDetail.owner._id : "",
          position: "Owner",
          avatar: itemDetail && itemDetail.owner ? config.imgUrl + itemDetail.owner.avatar : "",
          reward: "",
        },
        {
          name: itemDetail && itemDetail.creator ? itemDetail.creator.username : "",
          id: itemDetail && itemDetail.creator ? itemDetail.creator._id : "",
          position: "Creator",
          avatar: itemDetail && itemDetail.creator ? config.imgUrl + itemDetail.creator.avatar : "",
        }
      ];
    } else if (activeIndex === 1) {
      if (nft.history) {
        list = [];
        for (let i = 0; i < nft.history.length; i++) {
          list.push({
            name: nft.history[i].owner.username,
            id: nft.history[i].owner._id,
            position: "Owner",
            avatar: config.imgUrl + nft.history[i].owner.avatar,
            reward: "",
          })
        }
      }
    } else if (activeIndex === 2) {
      if (itemDetail) {
        list = [];
        var bids = [...itemDetail.bids];
        bids = bids.reverse();
        for (let i = 0; i < itemDetail.bids.length; i++) {
          list.push({
            name: bids[i].username,
            id: bids[i]._id,
            position: bids[i].price + "AVAX",
            avatar: config.imgUrl + bids[i].user_id.avatar,
            reward: "",
          })
        }
      }
    }
    setUsers(list);
  }, [activeIndex, itemDetail, nft])

  useEffect(() => {
    if (nft && nft.detail) {
      setItemDetail(nft.detail);
    }
  }, [nft])

  // const getFormatString = (str) => {
  //   return String(str).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  // }

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
          <div className={styles.bg}>
            <div className={styles.preview}>
              <div className={styles.categories}>
                {/* {categories && categories.length > 0 && categories.map((x, index) => (
                  <div
                    className={cn(
                      { "status-black": x.category === "black" },
                      { "status-purple": x.category === "purple" },
                      styles.category
                    )}
                    key={index}
                  >
                    {x.content}
                  </div>
                ))} */}
                {
                  itemDetail ?
                    <div
                      className={cn(
                        { "status-black": categories[itemDetail.collection_id.category].category === "black" },
                        { "status-purple": categories[itemDetail.collection_id.category].category === "purple" },
                        styles.category
                      )}
                    >
                      {categories[itemDetail.collection_id.category].content}
                    </div> : <></>
                }
              </div>
              <img
                src={itemDetail ? config.imgUrl + itemDetail.logoURL : ""}
                alt="Item"
              />
            </div>
            <Options className={styles.options} setProcessing={setProcessing} />
          </div>
          <div className={styles.details}>
            <h1 className={cn("h3", styles.title)}>{itemDetail ? itemDetail.name : ""}
            </h1>
            {itemDetail &&
              <a href={`/collectionItems/${itemDetail.collection_id._id}`} style={{width:"fit-content"}} ><h3>{itemDetail.collection_id.name}</h3></a>
            }
            <div className={styles.cost}>
              <div className={cn("status-stroke-green", styles.price)}>
                {itemDetail && itemDetail.price} AVAX
              </div>
              <div className={cn("status-stroke-black", styles.price)}>
                $
                {itemDetail && avax &&
                  Number(itemDetail.price * avax).toFixed(2)
                }
              </div>
              {/* <div className={styles.counter}>10 in stock</div> */}
            </div>
            <div className={styles.info}>
              {/* This NFT Card will give you Access to Special Airdrops. To learn
              more about UI8 please visit{" "} */}
              {itemDetail ? itemDetail.description : ""}
              {/* <a
                href="https://ui8.net"
                target="_blank"
                rel="noopener noreferrer" 
              >
                https://ui8.net
              </a> */}
            </div>
            {
              itemDetail && itemDetail.isSale === 2 ?
                <div className={styles.timer} style={{ marginBottom: "10px" }}>
                  <div className={styles.box}>
                    <div className={styles.number}>{getLeftDuration(itemDetail.auctionStarted, itemDetail.auctionPeriod, curTime).hours()}</div>
                    <div className={styles.time}>Hrs</div>
                  </div>
                  <div className={styles.box}>
                    <div className={styles.number}>{getLeftDuration(itemDetail.auctionStarted, itemDetail.auctionPeriod, curTime).minutes()}</div>
                    <div className={styles.time}>mins</div>
                  </div>
                  <div className={styles.box}>
                    <div className={styles.number}>{getLeftDuration(itemDetail.auctionStarted, itemDetail.auctionPeriod, curTime).seconds()}</div>
                    <div className={styles.time}>secs</div>
                  </div>
                </div> : <></>
            }
            <div className={styles.nav}>
              {navLinks && navLinks.length > 0 && navLinks.map((x, index) => (
                <button
                  className={cn(
                    { [styles.active]: index === activeIndex },
                    styles.link
                  )}
                  onClick={() => setActiveIndex(index)}
                  key={index}
                >
                  {x}
                </button>
              ))}
            </div>
            <PerfectScrollbar style={{ minHeight: "250px", maxHeight: "250px" }}>
              <Users className={styles.users} items={users ? users : []} />
            </PerfectScrollbar>
            <Control className={styles.control} id={id} />
          </div>
        </div>

        {<Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={processing}
        >
          <CircularProgress color="inherit" />
        </Backdrop>}
      </div>
    </>
  );
};

export default Item;
