import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Discover.module.sass";
import Slider from "react-slick";
import Icon from "../../../components/Icon";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import isEmpty from "../../../utilities/isEmpty";

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

const dateOptions = [
  { value: 0, text: "Newest" },
  { value: 1, text: "Oldest" },
  { value: 2, text: "Price: Low to High" },
  { value: 3, text: "Price: High to Low" },
  { value: 4, text: "Most Like" },
  { value: 5, text: "Least Like" }
];


const priceOptions = [{ value: 0, text: "Highest price" }, { value: 1, text: "The lowest price" }];
const creatorOptions = [{ value: 0, text: "All" }, { value: 1, text: "Verified only" }];
const likesOptions = [{ value: 0, text: "Most liked" }, { value: 1, text: "Least liked" }];
const sortingOptions = [];
const statusOptions = [{ value: 0, text: "All" }, { value: 1, text: "On Sale" }, { value: 2, text: "On Auction" }];

if (navLinks && navLinks.length > 0) navLinks.map((x) => sortingOptions.push(x));

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Discover = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [date, setDate] = useState(dateOptions[0]);
  const [price, setPrice] = useState(priceOptions[0]);
  const [likes, setLikes] = useState(likesOptions[0]);
  const [creator, setCreator] = useState(creatorOptions[0]);
  const [range, setRange] = useState([]);
  const [visible, setVisible] = useState(false);
  const user = useSelector(state => state.auth);
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState(statusOptions[0]);
  const [viewNoMore, setViewNoMore] = useState(false);

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");



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

  useEffect(() => {
    getCollectionList(true);
  }, [date, activeIndex, price, likes, creator, range, status, priceMin, priceMax])

  const getCollectionList = (reStart) => {
    var param = {
      start: reStart ? 0 : collections.length,
      last: reStart ? 8 : collections.length + 8,
      // date: date.value,
      sortmode: date.value,
      category: navLinks[activeIndex].value
    };
    if (visible) {
      param.price = price.value;
      param.likes = likes.value;
      param.creator = creator.value;
      // param.range = range;
      param.range = [priceMin, priceMax];
      param.status = status.value
    }
    axios.post(`${config.baseUrl}collection/get_collection_list`, param)
      .then((result) => {
        var list = [];
        for (var i = 0; i < result.data.list.length; i++) {
          var item = result.data.list[i].item_info;
          item.users = [{ avatar: result.data.list[i].creator_info.avatar }];
          list.push(item);
        } 
        if(isEmpty(list))
        {
          setViewNoMore(true);
          setTimeout(() => {
            setViewNoMore(false)
          }, 2500);              
        }
        if (reStart) {
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
    getCollectionList();
  }


  const handlePrice = (type, event) => {
    var pattern = /[^0-9.]/g;
    var result = event.target.value.match(pattern);
    if (!result && !isNaN(event.target.value)) {
      if (type == "min") {
        setPriceMin(event.target.value);
      } else if (type == "max") {
        setPriceMax(event.target.value);
      }
    }
  }



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
            {
              (navLinks && navLinks.length > 0) &&
              navLinks.map((x, index) => (
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
            {/* <div className={styles.cell}>
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
            </div> */}
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
              <div className={styles.range}>
                <div className={styles.label}>Price range</div>
                <div style={{ display: "flex" }}>
                  <input className={styles.input} value={priceMin} onChange={(e) => { handlePrice("min", e) }} />
                  <div style={{ width: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ~
                  </div>
                  <input className={styles.input} value={priceMax} onChange={(e) => { handlePrice("max", e) }} />
                </div>

                <div className={styles.scale}>
                  <div className={styles.number}>Min</div>
                  <div className={styles.number}>Max</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="sliderWrapper" className={styles.list}>
          <Slider
            className={cn("discover-slider", styles.slider)}
            {...settings}
          >
            {(collections && collections.length > 0) ? collections.map((x, index) => (
              <Card className={styles.card} item={x} key={index} />
            )) : <></>}
          </Slider>
        </div>
        <div align="center"  style={{ marginTop : "2rem"}}>
          <span >&nbsp;{viewNoMore === true && "No more items"}&nbsp;</span>
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
