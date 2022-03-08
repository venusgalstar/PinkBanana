import React, { useState , useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Notification.module.sass";
import Icon from "../../Icon";
import {useSelector, useDispatch} from "react-redux";
import {getNotifiesByLimt} from "../../../store/actions/notify.action";
import config from "../../../config";

const items = [
  {
    title: "AVAX received",
    price: "0.08 AVAX recived",
    date: "2 days ago",
    color: "#3772FF",
    image: "/images/content/notification-pic-1.jpg",
    url: "/activity",
  },
  {
    title: "C O I N Z",
    price: "New bid 0.2 AVAX",
    date: "3 days ago",
    color: "#3772FF",
    image: "/images/content/notification-pic-2.jpg",
    url: "/activity",
  },
  {
    title: "AVAX received",
    price: "0.08 AVAX recived",
    date: "4 days ago",
    color: "#3772FF",
    image: "/images/content/notification-pic-3.jpg",
    url: "/activity",
  },
  {
    title: "AVAX received",
    price: "0.08 AVAX recived",
    date: "5 days ago",
    color: "#3772FF",
    image: "/images/content/notification-pic-4.jpg",
    url: "/activity",
  },
];

const Notification = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const notifiesList = useSelector(state => state.notify.list);
  const dispatch = useDispatch();

  useEffect(() => 
  {
    dispatch(getNotifiesByLimt(4))
  }, []);

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.notification, className)}>
        <button
          className={cn(styles.head, styles.active)}
          onClick={() => setVisible(!visible)}
        >
          <Icon name="notification" size="24" />
        </button>
        {visible && (
          <div className={styles.body}>
            <div className={cn("h4", styles.title)}>Notification</div>
            <div className={styles.list}>
              {
                (notifiesList && notifiesList.length > 0) && 
                notifiesList.slice(0, 4).map((x, index) => (
                <Link
                  className={styles.item}
                  to="/activity"
                  onClick={() => setVisible(!visible)}
                  key={index}
                >
                  <div className={styles.preview}>
                    <img src={config.imgUrl + x.imgUrl} alt="Notification" />
                  </div>
                  <div className={styles.details}>
                    <div className={styles.subtitle}>{x.subTitle}</div>
                    <div className={styles.description}>{x.description}</div>
                    <div className={styles.date}>{x.date}</div>
                  </div>
                  <div
                    className={styles.status}
                    style={{ backgroundColor: "#000000" }}
                  ></div>
                </Link>
              ))}
            </div>
            <Link
              className={cn("button-small", styles.button)}
              to="/activity"
              onClick={() => setVisible(!visible)}
            >
              See all
            </Link>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default Notification;
