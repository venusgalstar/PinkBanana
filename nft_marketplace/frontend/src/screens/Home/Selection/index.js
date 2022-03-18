import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Selection.module.sass";
import Icon from "../../../components/Icon";
import axios from "axios";
import config from "../../../config";
import { io } from 'socket.io-client';

var socket = io(`${config.socketUrl}`);


const Selection = () => {

  const [itemList, setItemList] = useState();
  const [userList, setUserList] = useState();

  useEffect(() => {
    getData();
  }, [])

  useEffect(() => {
    socket.on("UpdateStatus", data=>{
      console.log("update status", data);
      getData();
    })
  }, [])

  const getData = () => {
    axios.post(`${config.baseUrl}collection/get_new_collection_list`)
      .then((result) => {
        setItemList(result.data.data);
      }).catch(() => {

      });

    axios.post(`${config.baseUrl}users/get_upload_user`, { limit: 4 })
      .then((result) => {
        var temp = [];
        var list = result.data.list;
        for (var i = 0; i < list.length; i++) {
          if (list[i].uploader) {
            var item = list[i].uploader;
            item.count = list[i].count;
            temp.push(item);
          }
        }
        setUserList(temp);
      }).catch(() => {
      });
  };

  return (
    <div className={cn("section-pb", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.row}>
          <div className={styles.col}>
            {/* {items.map( */}
            {itemList && itemList.length > 0 && itemList.map(
              (x, index) =>
                index === 0 && (
                  // <Link className={styles.card} to={x.url} key={index}>
                  <Link className={styles.card} to={`/collectionItems/${x._id}`} key={index}>
                    <div className={styles.preview}>
                      <img
                        // srcSet={`${x.image2x} 2x`}
                        src={x.bannerURL ? config.imgUrl + x.bannerURL : ""}
                        // src={x.image}
                        style={{height: "400px"}}
                        alt="Selection"
                      />
                    </div>
                    <div className={styles.head}>
                      <div className={styles.line}>
                        <div className={styles.avatar}>
                          <img src={x.owner ? config.imgUrl + x.owner.avatar : ""} alt="Avatar" />
                        </div>
                        <div className={styles.description}>
                          <div className={styles.title}>{x.name}</div>
                          <div className={styles.counter}>{x.counter}</div>
                        </div>
                      </div>
                      <div className={styles.box}>
                        {/* <div className={styles.content}>{x.content}</div> */}
                        <div className={styles.content}>Floor Price</div>
                        <div className={styles.price}>{x.price}AVAX</div>
                      </div>
                    </div>
                  </Link>
                )
            )}
          </div>
          <div className={styles.col}>
            {/* {items.map( */}
            {itemList && itemList.length > 0 && itemList.map(
              (x, index) =>
                index > 0 && (
                  // <Link className={styles.item} to={x.url} key={index}>
                  <Link className={styles.item} to={`/collectionItems/${x._id}`} key={index}>
                    <div className={styles.preview}>
                      <img
                        srcSet={`${x.image2x} 2x`}
                        src={x.bannerURL ? config.imgUrl + x.bannerURL : ""}
                        style={{height: "100px"}}
                        alt="Selection"
                      />
                    </div>
                    <div className={styles.description}>
                      <div className={styles.title}>{x.title}</div>
                      <div className={styles.line}>
                        <div className={styles.avatar}>
                          <img src={x.owner ? config.imgUrl + x.owner.avatar : ""} alt="Avatar" />
                        </div>
                        <div className={styles.price}>{x.price}AVAX</div>
                        {/* <div className={styles.content}>{x.content}</div> */}
                        <div className={styles.content}>floor price</div>
                      </div>
                      {/* <button
                        className={cn(
                          "button-stroke button-small",
                          styles.button
                        )}
                      >
                        Place a bid
                      </button> */}
                    </div>
                  </Link>
                )
            )}
          </div>
        </div>
        <div className={styles.sidebar}>
          <div className={styles.info}>
            Latest upload from creators{" "}
            <span className={styles.smile} role="img" aria-label="fire">
              🔥
            </span>
          </div>
          <div className={styles.list}>
            {/* {users.map((x, index) => ( */}
            {userList && userList.length > 0 && userList.map((x, index) => (

              <Link key={index} to={"/profile/" + x._id}>
                <div className={styles.user} key={index}>
                  <div className={styles.avatar}>
                    <img src={x.avatar ? config.imgUrl + x.avatar : ""} alt="Avatar" />
                    <div className={styles.number}>{x.count ? x.count : 1}</div>
                  </div>
                  <div className={styles.description}>
                    <div className={styles.name}>{x.username}</div>
                    <div
                      className={styles.money}
                      dangerouslySetInnerHTML={{ __html: x.price }}
                    />
                  </div>
                </div>
              </Link>


            ))}
          </div>
          <Link
            className={cn("button-stroke button-small", styles.button)}
            to="/search01"
          >
            <span>Discover more</span>
            <Icon name="arrow-next" size="10" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Selection;
