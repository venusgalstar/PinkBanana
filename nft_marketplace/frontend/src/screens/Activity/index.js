import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./Activity.module.sass";
import Control from "../../components/Control";
// import Loader from "../../components/Loader";
import Icon from "../../components/Icon";
import Filters from "./Filters";
import {  getNotifiesByLimit } from "../../store/actions/notify.action";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { markAllAsRead } from "../../store/actions/notify.action";
import config from "../../config";
import moment from "moment";
import { useHistory } from "react-router-dom";

// import config from "../../config";

const _breadcrumbs = [
  // {
  //   title: "Profile",
  //   url: "/profile",
  // },
  // {
  //   title: "Activity",
  // },
];

const items = [
  {
    title: "Something went wrong",
    description: "Can't display activity card. Try again later",
    date: "2 days ago",
    image: "/images/content/activity-pic-1.jpg",
    icon: "/images/content/flag.svg",
    color: "#EF466F",
  }
];

const filters = [
  "Sales",
  "Listings",
  "Bids",
  "Burns",
  "Followings",
  "Likes",
  "Purchase",
  "Transfers",
];

const navLinks = ["My activity", "Following", "All activity"];

const Activity = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [visible, setVisible] = useState(0);
  const notifiesList = useSelector(state => state.notify.list);
  const currentUsr = useSelector(state => state.auth.user);

  const [breadcrumbs, setBreadCrumbs] = useState(_breadcrumbs);

  const history = useHistory();

  // useEffect(() => {
  //   var temp = breadcrumbs;
  //   temp[0].url = `/profile/${currentUsr._id}`;
  //   setBreadCrumbs(temp);
  // }, [currentUsr, breadcrumbs])


  const dispatch = useDispatch();

  useEffect(() => {
    if(currentUsr._id) dispatch(getNotifiesByLimit(50, currentUsr._id))
  }, [currentUsr, dispatch]);


  const onClickMarkAllAsRead = () => {
    if (notifiesList && notifiesList.length > 0) {
      let idList = []; let j;
      for (j = 0; j < notifiesList.length; j++) idList.push(notifiesList[j]._id);
      dispatch(markAllAsRead(idList, currentUsr._id));
      dispatch(getNotifiesByLimit(50, currentUsr._id));
    }
  }

  useEffect(() => {
    var reshapedFilters = [];
    if (selectedFilters && selectedFilters.length > 0) {
      for (var j = 0; j < selectedFilters.length; j++) {
        switch (selectedFilters[j]) {
          default: break;
          case "Sales":
            reshapedFilters.push(1);
            break;
          case "Listings":
            reshapedFilters.push(2);
            break;
          case "Bids":
            reshapedFilters.push(3);
            break;
          case "Burns":
            reshapedFilters.push(4);
            break;
          case "Followings":
            reshapedFilters.push(5);
            break;
          case "Likes":
            reshapedFilters.push(6);
            break;
          case "Purchase":
            reshapedFilters.push(7);
            break;
          case "Transfers":
            reshapedFilters.push(8);
            break;
        }
      }
    }
    dispatch(getNotifiesByLimit(50, currentUsr._id, reshapedFilters));
  }, [selectedFilters, currentUsr, dispatch]);

  useEffect(() => {
    if (activeIndex === 1) {
      dispatch(getNotifiesByLimit(50, currentUsr._id, [5]));
    } else {
      dispatch(getNotifiesByLimit(50, currentUsr._id));
    }
  }, [activeIndex, dispatch, currentUsr])

  const goDetail = (url) => {
    history.push(url);
  }


  return (
    <div className={styles.page}>
      <Control className={styles.control} item={breadcrumbs} />
      <div className={cn("section-pt80", styles.body)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.top}>
            <h1 className={cn("h2", styles.title)}>Activity</h1>
            <button
              className={cn(
                "button-stroke button-small mobile-hide",
                styles.button
              )}
              onClick={() => onClickMarkAllAsRead()}
            >
              Mark all as read
            </button>
            <button
              className={cn(
                "button-circle-stroke button-small tablet-show",
                styles.toggle,
                { [styles.active]: visible }
              )}
              onClick={() => setVisible(!visible)}
            >
              <Icon name="filter" size="24" />
              <Icon name="close" size="14" />
            </button>
          </div>
          <div className={styles.row}>
            <div className={styles.wrapper}>
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
                      {x}
                    </button>
                  ))}
              </div>
              <div className={styles.list}>
                {
                  (notifiesList && notifiesList.length > 0) ?
                    notifiesList.map((x, index) => (
                      <div className={styles.item} key={index} onClick={() => { goDetail(x.url) }}>
                        <div className={styles.preview}>
                          <img src={config.imgUrl + x.imgUrl} alt="Notification" />
                          <div
                            className={styles.icon}
                            style={{ backgroundColor: "#000000" }}
                          >
                            <img src={items[0].icon} alt="Icon notification" />
                          </div>
                        </div>
                        <div className={styles.details}>
                          <div className={styles.subtitle}>{x.subTitle}</div>
                          <div className={styles.description}>{x.description}</div>
                          <div className={styles.date}>{x.date ? moment(x.date).format("YYYY-MM-DD HH:mm:ss") : ""}</div>
                        </div>
                      </div>
                    ))
                    :
                    <></>
                }
              </div>
              {/* <Loader className={styles.loader} /> */}
            </div>
            <button
              className={cn(
                "button-stroke button-small mobile-show",
                styles.button
              )}
              onClick={() => onClickMarkAllAsRead()}
            >
              Mark all as read
            </button>
            <Filters
              className={cn(styles.filters, { [styles.active]: visible })}
              filters={filters}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
