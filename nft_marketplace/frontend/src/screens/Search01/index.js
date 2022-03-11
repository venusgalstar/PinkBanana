import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Search01.module.sass";
import Icon from "../../components/Icon";
import Card from "../../components/Card";
import Dropdown from "../../components/Dropdown";

import RangeSlider from "../../components/Slider";
import config from "../../config";
import axios from "axios";

import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useMediaQuery } from "@mui/material";

// data
// import { bids } from "../../mocks/bids";
import CollectionSelect from "../../components/CollectionSelect/CollectionSelect";
import { useSelector } from "react-redux";

const navLinks = [{ value: 0, text: "All items" }, { value: 1, text: "Art" }, { value: 2, text: "Game" }, { value: 3, text: "Photography" }, { value: 4, text: "Music" }, { value: 5, text: "Video" }];

const dateOptions = [{ value: 0, text: "Newest" }, { value: 1, text: "Oldest" }];

const colorOptions = [{ value: 0, text: "All colors" }, { value: 1, text: "Black" }, { value: 2, text: "Green" }, { value: 3, text: "Pink" }, { value: 4, text: "Purple" }];
const priceOptions = [{ value: 0, text: "Highest price" }, { value: 1, text: "The lowest price" }];
const likesOptions = [{ value: 0, text: "Most liked" }, { value: 1, text: "Least liked" }];
const creatorOptions = [{ value: 0, text: "All" }, { value: 1, text: "Verified only" }];

const ColorModeContext = React.createContext({ Search: () => { } });

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

  const [selectedCollection, setSelectedCollection] = useState({});

  const [metadatas, setMetaDatas] = useState([]);
  const [checked, setChecked] = React.useState([]);
  const [collections, setCollections] = useState([]);
  const [start, setStart] = useState(0);
  const [last, setLast] = useState(8);
  const [mode, setMode] = React.useState('light');
  const colorMode = React.useContext(ColorModeContext);
  const globalThemeMode = useSelector(state => state.user.themeMode);

  useEffect(() =>
  {
    setMode(globalThemeMode);
  }, [globalThemeMode])

  useEffect(() =>
  {
    let thmode = localStorage.getItem("darkMode");
    if(thmode === "true") setMode('dark');
    else setMode('light');
  }, [])

  useEffect(() => {
    setStart(0);
    setLast(start + 8);
    getCollectionList();
  }, [date, activeIndex, price, likes, creator, range, reSearch, selectedCollection, checked])

  const onSearch = () => {
    setResearch(!reSearch);
  }

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  useEffect(() => {
    if (selectedCollection) {
      axios.post(`${config.baseUrl}collection/get_collection_metadatas`, { id: selectedCollection._id })
        .then((result) => {
          console.log("result:", result.data.data[0].metaData);
          if (result.data.data[0].metaData) {
            setMetaDatas(result.data.data[0].metaData);
          } else {
            setMetaDatas([]);
          }
        }).catch(() => {
        });
    } else {
      setMetaDatas([]);
    }

  }, [selectedCollection])

  useEffect(() => {
    console.log("checked:", checked);
  }, [checked])

  const getCollectionList = () => {
    var param = { start: start, last: last, date: date.value, category: navLinks[activeIndex].value };
    // if (visible) {
    param.price = price.value;
    param.likes = likes.value;
    param.creator = creator.value;
    param.range = range;
    param.search = search;
    // }
    if (selectedCollection) {
      param.collection_id = selectedCollection._id;
      param.metadata = checked;
    }

    axios.post(`${config.baseUrl}collection/get_collection_list`, param)
      .then((result) => {
        var list = [];
        for (var i = 0; i < result.data.list.length; i++) {
          var item = result.data.list[i].item_info;
          item.users = [{ avatar: result.data.list[i].creator_info.avatar }];
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


  const handleToggle = (object) => () => {
    const currentIndex = checked.indexOf(object);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(object);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

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
              <RangeSlider min={0} max={10} step={0.01} setRange={(value) => setRange(value)}></RangeSlider>
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
              {/* <div className={styles.item}>
                <div className={styles.label}>Color</div>
                <Dropdown
                  className={styles.dropdown}
                  value={color}
                  setValue={setColor}
                  options={colorOptions}
                />
              </div> */}
              <div className={styles.item}>
                <div className={styles.label}>Creator</div>
                <Dropdown
                  className={styles.dropdown}
                  value={creator}
                  setValue={setCreator}
                  options={creatorOptions}
                />
              </div>
              <div className={styles.item}>
                <div className={styles.label}>Collections</div>
                <CollectionSelect className={styles.collectionlist} selected={setSelectedCollection}>
                </CollectionSelect>
              </div>
              <div>
                {
                  metadatas && metadatas.map((item, index) => (

                    <div key={index}>
                      <ColorModeContext.Provider value={colorMode}>
                        <ThemeProvider theme={theme}>
                          <Accordion>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                            >
                              <div className={styles.label}>
                                {item.key}

                              </div>
                            </AccordionSummary>
                            <AccordionDetails>
                              {
                                item.value && item.value.map((subitem, subIndex) => {

                                  const labelId = `checkbox-list-label-${subitem}`;
                                  var object = {};
                                  object[item.key] = subitem;
                                  object = JSON.stringify(object);
                                  return (
                                    <ListItem
                                      key={subIndex}
                                      // secondaryAction={
                                      // <IconButton edge="end" aria-label="comments">
                                      //   <CommentIcon />
                                      // </IconButton>
                                      // }
                                      disablePadding
                                    >
                                      <ListItemButton role={undefined} onClick={handleToggle(object)} dense>
                                        <ListItemIcon>
                                          <Checkbox
                                            edge="start"
                                            checked={checked.indexOf(object) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': labelId }}
                                          />
                                        </ListItemIcon>
                                        <ListItemText id={labelId} primary={subitem} />
                                      </ListItemButton>
                                    </ListItem>

                                  )
                                })
                              }
                            </AccordionDetails>
                          </Accordion>
                        </ThemeProvider>
                      </ColorModeContext.Provider>
                    </div>
                  ))
                }
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
