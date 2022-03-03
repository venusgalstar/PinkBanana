import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import cn from "classnames";
import styles from "./Item.module.sass";
import Users from "./Users";
import Control from "./Control";
import Options from "./Options";
import { useSelector } from "react-redux";
import config from "../../config";

import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar'



const navLinks = ["Info", "History", "Bids"];

const categories = [
  {
    category: "black",
    content: "art",
  },
  {
    category: "purple",
    content: "unlockable",
  },
];

const users1 = [
  {
    name: "Raquel Will",
    position: "Owner",
    avatar: "/images/content/avatar-2.jpg",
    reward: "/images/content/reward-1.svg",
  },
  {
    name: "Selina Mayert",
    position: "Creator",
    avatar: "/images/content/avatar-1.jpg",
  },
];

const Item = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { id } = useParams();

  const nft = useSelector(state => state.nft);
  const [itemDetail, setItemDetail] = useState();
  const auth = useSelector(state => state.auth);
  const [users, setUsers] = useState();



  useEffect(() => {
    var list = [];
    if (activeIndex == 0) {
      list = [
        {
          name: itemDetail ? itemDetail.owner.username : "",
          position: "Owner",
          avatar: itemDetail ? config.imgUrl + itemDetail.owner.avatar : "",
          reward: "",
        },
        {
          name: itemDetail ? itemDetail.creator.username : "",
          position: "Creator",
          avatar: itemDetail ? config.imgUrl + itemDetail.creator.avatar : "",
        }
      ];
    } else if (activeIndex == 1) {
      if (nft.history) {
        list = [];
        for (var i = 0; i < nft.history.length; i++) {
          list.push({
            name: nft.history[i].owner.username,
            position: "Owner",
            avatar: config.imgUrl + nft.history[i].owner.avatar,
            reward: "",
          })
        }
      }
    } else if (activeIndex == 2) {
      if (itemDetail){
        list = [];
        var bids = itemDetail.bids;
        bids = bids.reverse();
        for (var i = 0; i < itemDetail.bids.length; i++) {
          list.push({
            name: itemDetail.bids[i].username,
            position: itemDetail.bids[i].price + "AVAX",
            avatar: config.imgUrl + itemDetail.bids[i].user_id.avatar,
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




  return (
    <>
      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.bg}>
            <div className={styles.preview}>
              <div className={styles.categories}>
                {categories.map((x, index) => (
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
                ))}
              </div>
              {/* <img
                srcSet="/images/content/item-pic@2x.jpg 2x"
                src="/images/content/item-pic.jpg"
                alt="Item"
              /> */}
              <img
                // srcSet="/images/content/item-pic@2x.jpg 2x"
                src={itemDetail ? config.imgUrl + itemDetail.logoURL : ""}
                alt="Item"
              />
            </div>
            <Options className={styles.options} />
          </div>
          <div className={styles.details}>
            <h1 className={cn("h3", styles.title)}>{itemDetail ? itemDetail.name : ""}</h1>
            <div className={styles.cost}>
              <div className={cn("status-stroke-green", styles.price)}>
                {itemDetail ? itemDetail.price : 0} AVAX
              </div>
              <div className={cn("status-stroke-black", styles.price)}>
                $4,429.87
              </div>
              <div className={styles.counter}>10 in stock</div>
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
            <div className={styles.nav}>
              {navLinks.map((x, index) => (
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
            <PerfectScrollbar style={{minHeight:"250px", maxHeight: "250px" }}>
              <Users className={styles.users} items={users ? users : []} />
            </PerfectScrollbar>
            <Control className={styles.control} id={id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Item;
