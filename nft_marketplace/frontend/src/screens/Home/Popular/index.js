import React, { useEffect, useState } from "react";
import cn from "classnames";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import styles from "./Popular.module.sass";
import Add from "./Add";
import Icon from "../../../components/Icon";
import Dropdown from "../../../components/Dropdown";
import DropdownEmpty from "../../../components/DropdownEmpty";

import { getPopularUserList } from "../../../store/actions/user.action";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../config";
import { Popper } from "@mui/material";

import { toggleFollow } from "../../../store/actions/follow.actions";

import { io } from 'socket.io-client';
const socket = io(`${config.socketUrl}`);



const colors = ["#3772FF", "#9757D7", "#45B26B", "#23262F", "#777E90", "#3772FF", "#9757D7", "#45B26B"];


const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const dateOptions = [{ value: 0, text: "All" }, { value: 1, text: "Last 24 hours" }, { value: 2, text: "Last 7 days" }, { value: 3, text: "Last 30 days" }];
const directionOptions = ["Sellers", "Buyers"];

const Popular = () => {
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 5,
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
    responsive: [
      {
        breakpoint: 1340,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          infinite: true,
        },
      },
    ],
  };

  const [date, setDate] = useState(dateOptions[0]);
  const [direction, setDirection] = useState(directionOptions[0]);
  const [items, setItems] = useState([]);


  const popular = useSelector(state => state.user.popular);
  const auth = useSelector(state => state.auth.user);


  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPopularUserList(date, 20));
  }, [date, dispatch]);

  useEffect(() => {
    socket.on("UpdateStatus", data => {
      console.log("update status:", data);
      dispatch(getPopularUserList(date, 20));
    });
  }, [])


  useEffect(() => {
    setUserList();
  }, [popular, direction]);

  const setUserList = () => {
    if (popular) {
      if (direction === "Sellers") {
        setItems(popular.seller);
      } else {
        setItems(popular.buyer);
      }
    }
  }

  const onToggleFollow = (index) => {
    if (auth && items) {
      dispatch(toggleFollow(auth._id, items[index]._id));
    }
  }

  const isFollowed = (item) => {
    if (!item || !item.follows) {
      return false;
    } else if (auth._id) {
      var index = item.follows.findIndex((element) => {
        return element.toLowerCase() == auth._id.toLowerCase();
      });
      if (index != -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }


  return (
    <div className={cn("section-bg", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.top}>
          <div className={styles.box}>
            <div className={styles.stage}>Popular</div>
            <DropdownEmpty
              className={styles.dropdown}
              value={direction}
              setValue={setDirection}
              options={directionOptions}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>timeframe</div>
            <Dropdown
              className={styles.dropdown}
              value={date}
              setValue={setDate}
              options={dateOptions}
            />
          </div>
        </div>
        <div className={styles.wrapper}>
          <Slider className="popular-slider" {...settings}>
            {
              items && items.length > 0 && items.map((x, index) => (
                <div className={styles.slide} key={index}>
                  <div className={styles.item}>
                    <div className={styles.head}>
                      <div
                        className={styles.rating}
                        style={{ backgroundColor: colors[index] }}
                      >
                        <div className={styles.icon}>
                          <img src={"/images/content/donut.svg"} alt="Rating" />
                        </div>
                        <div className={styles.number}>#{index + 1}</div>
                      </div>
                      <div className={styles.control}>
                        {
                          auth && x._id != auth._id &&
                          <Add className={styles.button} isFollow={isFollowed(x)} onToggle={() => { onToggleFollow(index) }} />
                        }
                        <Link className={styles.button} to={x && x._id && "/profile/" + x._id}>
                          <Icon name="arrow-expand" size="24" />
                        </Link>
                      </div>
                    </div>
                    <div className={styles.body}>
                      <div className={styles.avatar}>
                        <img src={x && x.avatar ? config.imgUrl + x.avatar : ""} alt="Avatar" />
                        <div className={styles.reward}>
                          {/* <img src={x && x.reward? x.reward : ""} alt="Reward" /> */}
                        </div>
                      </div>
                      <div className={styles.name}>{x && x.username ? x.username : ""}</div>
                      <div
                        className={styles.price}
                        dangerouslySetInnerHTML={{ __html: x && x.totalPrice ? Number(x.totalPrice).toFixed(3) + " AVAX" : "0 AVAX" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Popular;
