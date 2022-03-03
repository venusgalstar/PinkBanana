import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Discover.module.sass";
import { Range, getTrackBackground } from "react-range";
import Slider from "react-slick";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";

// data
import { bids } from "../../../mocks/bids";
import axios from "axios";
import config from "../../../config";
import RangeSlider from "../../../components/Slider";
import { useSelector } from "react-redux";



const navLinks = [{ value: 0, text: "All items" },
{ value: 1, text: "Art" },
{ value: 2, text: "Game" },
{ value: 3, text: "Photography" },
{ value: 4, text: "Music" },
{ value: 5, text: "Video" }];

const dateOptions = [{ value: 0, text: "Recently added" }, { value: 1, text: "Long added" }];
const priceOptions = [{ value: 0, text: "Highest price" }, { value: 1, text: "The lowest price" }];
const likesOptions = [{ value: 0, text: "Most liked" }, { value: 1, text: "Least liked" }];
const creatorOptions = [{ value: 0, text: "All" }, { value: 1, text: "Verified only" }];
const sortingOptions = [];
navLinks.map((x) => sortingOptions.push(x));

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Discover = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [date, setDate] = useState(dateOptions[0]);
  const [price, setPrice] = useState(priceOptions[0]);
  const [likes, setLikes] = useState(likesOptions[0]);
  const [creator, setCreator] = useState(creatorOptions[0]);
  const [sorting, setSorting] = useState(sortingOptions[0]);
  const [range, setRange] = useState([]);

  const [values, setValues] = useState([5]);
  const [visible, setVisible] = useState(false);

  const user = useSelector(state => state.auth);

  const STEP = 0.1;
  const MIN = 0.01;
  const MAX = 10;

  useEffect(() => {
    console.log("user state:", user);
  }, [user]);


  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 2,
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
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 100000,
        settings: "unslick",
      },
    ],
  };


  const [collections, setCollections] = useState([]);
  const [start, setStart] = useState(0);
  const [last, setLast] = useState(8);

  useEffect(() => {
    setStart(0);
    setLast(start + 8);
    getCollectionList();
  }, [date, activeIndex, price, likes, creator, range])

  const getCollectionList = () => {
    var param = { start: start, last: last, date: date.value, category: navLinks[activeIndex].value };
    if (visible) {
      param.price = price.value;
      param.likes = likes.value;
      param.creator = creator.value;
      param.range = range;
    }

    axios.post(`${config.baseUrl}collection/get_collection_list`, param)
      .then((result) => {
        var list = [];
        for (var i = 0; i < result.data.list.length; i++) {
          var item = result.data.list[i].item_info;
          item.users = [{avatar: result.data.list[i].creator_info.avatar}];
          console.log("users:", item);
          list.push(item);
        }
        if (start == 0) {
          setCollections(list);
        } else {
          setCollections((collections) => {
            return collections.concat(list);
          });
        }
      }).catch(() => {
      });
  }

  const onLoadMore = () => {
    setStart(last);
    setLast(last + 8);
    getCollectionList();
  }


  useEffect(() => {
    console.log("collection list", collections);
  }, [collections]);

  return (
    <div className={cn("section", styles.section)}>
      <div className={cn("container", styles.container)}>
        <h3 className={cn("h3", styles.title)}>Discover</h3>
        <div className={styles.top}>
          <div className={styles.dropdown}>
            <Dropdown
              className={styles.dropdown}
              value={date}
              setValue={setDate}
              options={dateOptions}
            />
          </div>
          <div className={styles.nav}>
            {navLinks.map((x, index) => (
              <button
                className={cn(styles.link, {
                  [styles.active]: index === activeIndex,
                })}
                onClick={() => setActiveIndex(index)}
                key={index}
              >
                {x.text}
              </button>
            ))}
          </div>
          {/* <div className={cn("tablet-show", styles.dropdown)}>
            <Dropdown
              className={styles.dropdown}
              value={sorting}
              setValue={setSorting}
              options={sortingOptions}
            />
          </div> */}
          <button
            className={cn(styles.filter, { [styles.active]: visible })}
            onClick={() => setVisible(!visible)}
          >
            <div className={styles.text}>Filter</div>
            <div className={styles.toggle}>
              <Icon name="filter" size="18" />
              <Icon name="close" size="10" />
            </div>
          </button>
        </div>
        <div className={cn(styles.filters, { [styles.active]: visible })}>
          <div className={styles.sorting}>
            <div className={styles.cell}>
              <div className={styles.label}>Price</div>
              <Dropdown
                className={styles.dropdown}
                value={price}
                setValue={setPrice}
                options={priceOptions}
              />
            </div>
            <div className={styles.cell}>
              <div className={styles.label}>likes</div>
              <Dropdown
                className={styles.dropdown}
                value={likes}
                setValue={setLikes}
                options={likesOptions}
              />
            </div>
            <div className={styles.cell}>
              <div className={styles.label}>creator</div>
              <Dropdown
                className={styles.dropdown}
                value={creator}
                setValue={setCreator}
                options={creatorOptions}
              />
            </div>
            <div className={styles.cell}>
              <div className={styles.label}>Price range</div>
              <RangeSlider min={0.01} max={10} step={0.01} setRange={(value) => setRange(value)}></RangeSlider>
              <div className={styles.scale}>
                <div className={styles.number}>0.01 AVAX</div>
                <div className={styles.number}>10 AVAX</div>
              </div>
            </div>
          </div>
        </div>
        <div id="sliderWrapper" className={styles.list}>
          <Slider
            className={cn("discover-slider", styles.slider)}
            {...settings}
          >
            {collections ? collections.map((x, index) => (
              <Card className={styles.card} item={x} key={index} />
            )) : <></>}
          </Slider>
        </div>
        <div className={styles.btns}>
          <button className={cn("button-stroke button-small", styles.button)} onClick={() => { onLoadMore() }}>
            <span>Load more</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Discover;
