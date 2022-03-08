import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Search01.module.sass";
import { Range, getTrackBackground } from "react-range";
import Icon from "../../components/Icon";
import Card from "../../components/Card";
import Dropdown from "../../components/Dropdown";

import RangeSlider from "../../components/Slider";
import config from "../../config";
import { useSelector } from "react-redux";
import axios from "axios";

// data
import { bids } from "../../mocks/bids";

const navLinks = [{ value: 0, text: "All items" }, { value: 1, text: "Art" }, { value: 2, text: "Game" }, { value: 3, text: "Photography" }, { value: 4, text: "Music" }, { value: 5, text: "Video" }];

const dateOptions = [{ value: 0, text: "Newest" }, { value: 1, text: "Oldest" }];

const colorOptions = [{ value: 0, text: "All colors" }, { value: 1, text: "Black" }, { value: 2, text: "Green" }, { value: 3, text: "Pink" }, { value: 4, text: "Purple" }];
const priceOptions = [{ value: 0, text: "Highest price" }, { value: 1, text: "The lowest price" }];
const likesOptions = [{ value: 0, text: "Most liked" }, { value: 1, text: "Least liked" }];
const creatorOptions = [{ value: 0, text: "All" }, { value: 1, text: "Verified only" }];


const Search = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [date, setDate] = useState(dateOptions[0]);
  const [likes, setLikes] = useState(likesOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [creator, setCreator] = useState(creatorOptions[0]);
  const [search, setSearch] = useState("");
  const [price, setPrice] = useState(priceOptions[0]);

  const [values, setValues] = useState([5]);
  const [range, setRange] = useState([]);

  const [reSearch, setResearch] = useState(false);


  const handleSubmit = (e) => {

  };

  const STEP = 0.1;
  const MIN = 0.01;
  const MAX = 10;

  const [collections, setCollections] = useState([]);
  const [start, setStart] = useState(0);
  const [last, setLast] = useState(8);


  useEffect(() => {
    setStart(0);
    setLast(start + 8);
    getCollectionList();
  }, [date, activeIndex, price, likes, creator, range, reSearch])


  const onSearch = () => {
    setResearch(!reSearch);
  }



  const getCollectionList = () => {
    var param = { start: start, last: last, date: date.value, category: navLinks[activeIndex].value };
    // if (visible) {
    param.price = price.value;
    param.likes = likes.value;
    param.creator = creator.value;
    param.range = range;
    param.search = search;
    // }

    axios.post(`${config.baseUrl}collection/get_collection_list`, param)
      .then((result) => {
        var list = [];
        for (var i = 0; i < result.data.list.length; i++) {
          var item = result.data.list[i].item_info;
          item.users = [{ avatar: result.data.list[i].creator_info.avatar }];
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


  return (
    <div className={cn("section-pt80", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.top}>
          <div className={styles.title}>Type your keywords</div>
          {/* <form
            className={styles.search}
            action=""
          > */}
          <div className={styles.search}>
            <input
              className={styles.input}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              name="search"
              placeholder="Search ..."
              required
            />
            <button className={styles.result} onClick={onSearch}>
              <Icon name="search" size="16" />
            </button>
          </div>
          {/* </form> */}
        </div>
        <div className={styles.sorting}>
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
        </div>
        <div className={styles.row}>
          <div className={styles.filters}>
            <div className={styles.range}>
              <div className={styles.label}>Price range</div>
              <RangeSlider min={0.01} max={10} step={0.01} setRange={(value) => setRange(value)}></RangeSlider>
              <div className={styles.scale}>
                <div className={styles.number}>0.01 AVAX</div>
                <div className={styles.number}>10 AVAX</div>
              </div>
            </div>
            <div className={styles.group}>
              <div className={styles.item}>
                <div className={styles.label}>Price</div>
                <Dropdown
                  className={styles.dropdown}
                  value={price}
                  setValue={setPrice}
                  options={priceOptions}
                />
              </div>
              <div className={styles.item}>
                <div className={styles.label}>Color</div>
                <Dropdown
                  className={styles.dropdown}
                  value={color}
                  setValue={setColor}
                  options={colorOptions}
                />
              </div>
              <div className={styles.item}>
                <div className={styles.label}>Creator</div>
                <Dropdown
                  className={styles.dropdown}
                  value={creator}
                  setValue={setCreator}
                  options={creatorOptions}
                />
              </div>
            </div>
            <div className={styles.reset}>
              <Icon name="close-circle-fill" size="24" />
              <span>Reset filter</span>
            </div>
          </div>
          <div className={styles.wrapper}>
            <div className={styles.list}>
              {collections && collections.map((x, index) => (
                <Card className={styles.card} item={x} key={index} />
              ))}
            </div>
            <div className={styles.btns}>
              <button className={cn("button-stroke", styles.button)} onClick={onLoadMore}>
                <span>Load more</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
