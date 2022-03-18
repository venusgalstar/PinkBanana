import React, { useEffect, useState } from "react";
import cn from "classnames";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import styles from "./Collections.module.sass";
import Icon from "../../../components/Icon";

import { getHotCollections } from "../../../store/actions/collection.actions";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../config";

import { io } from 'socket.io-client';
var socket = io(`${config.socketUrl}`);

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Collections = () => {
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
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
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const dispatch = useDispatch();

  const collection = useSelector(state => state.collection);
  const [hots, setHots] = useState([]);


  useEffect(() => {
    getHotCollections(5)(dispatch);
  }, []);

  useEffect(()=>{
    socket.on("UpdateStatus", data=>{
      console.log('update status', data);
      getHotCollections(5)(dispatch);
    })
  }, [])



  useEffect(() => {
    // console.log("hots state: ", collection.hots);
    if (collection.hots !== undefined) {

      var hots = collection.hots;
      var list = [];
      for (var i = 0; i < hots.length; i++) {

        var gallery = [];
        gallery.push(config.imgUrl + hots[i].collection_info.bannerURL);
        var items_list = hots[i].items_list;
        if (items_list.length > 0) {
          gallery.push(config.imgUrl + items_list[0].logoURL);
        }
        if (items_list.length > 1) {
          gallery.push(config.imgUrl + items_list[1].logoURL);
        }
        if (items_list.length > 2) {
          gallery.push(config.imgUrl + items_list[2].logoURL);
        }
        list.push(
          {
            title: hots[i].collection_info.name,
            author: hots[i].creator_info.username,
            counter: items_list.length,
            avatar: config.imgUrl + hots[i].creator_info.avatar,
            gallery: gallery,
            url: "/collectionItems/" + hots[i]._id
          }
        );
      }
      setHots(list);
    }
  }, [collection]);

  // useEffect(() => {
  //   console.log("hots: ", hots);
  // }, [hots])



  return (
    <div className={cn("section-bg", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.wrapper}>
          <h3 className={cn("h3", styles.title)}>Hot collections</h3>
          <div className={styles.inner}>
            <Slider className="collection-slider" {...settings}>
              {hots && hots.map((x, index) => (
                <Link className={styles.item} to={x.url} key={index}>
                  <div className={styles.gallery}>
                    {
                      (x && x.gallery && x.gallery.length > 0) && 
                      x.gallery.map((x, index) => (
                      <div className={styles.preview} key={index}>
                        <img src={x} alt="Collection" />
                      </div>
                    ))}
                  </div>
                  <div className={styles.subtitle}>{x.title}</div>
                  <div className={styles.line}>
                    <div className={styles.user}>
                      <div className={styles.avatar}>
                        <img src={x.avatar} alt="Avatar"/>
                      </div>
                      <div className={styles.author}>
                        By <span>{x.author}</span>
                      </div>
                    </div>
                    <div className={cn("status-stroke-black", styles.counter)}>
                      <span>{x.counter}</span> items
                    </div>
                  </div>
                </Link>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;
