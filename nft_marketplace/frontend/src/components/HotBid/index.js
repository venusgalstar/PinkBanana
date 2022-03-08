import React, { useEffect, useState } from "react";
import cn from "classnames";
import Slider from "react-slick";
import styles from "./HotBid.module.sass";
import Icon from "../Icon";
import Card from "../Card";


// data
import { bids } from "../../mocks/bids";
import axios from "axios";
import config from "../../config";


const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Hot = ({ classSection }) => {
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 4,
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
        breakpoint: 1179,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
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

  const [items, setItems] = useState([]);

  useEffect(() => {
    getHotBids();
  }, [])

  const getHotBids = () => {
    axios.post(`${config.baseUrl}bid/get_hot_bids`, { limit: 8 }).then((data) => {
      // console.log("data:", data.data.list);
      var list = [];
      for (var i = 0; i < data.data.list.length; i++) {
        list.push(data.data.list[i].info[0]);
      }

      // console.log("list:", list);
      setItems(list);
    })
  };



  return (
    <div className={cn(classSection, styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.wrapper}>
          <h3 className={cn("h3", styles.title)}>Hot bid</h3>
          <div className={styles.inner}>
            <Slider className="bid-slider" {...settings}>
              {/* {bids.map((x, index) => (
                <Card key={index} className={styles.card} item={x} />
              ))} */}
              {
                (items && items.length > 0) && 
              items.map((x, index) => (
                <Card key={index} className={styles.card} item={x} />
              ))}

            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hot;
