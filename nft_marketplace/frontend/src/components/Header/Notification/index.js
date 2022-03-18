import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Notification.module.sass";
import Icon from "../../Icon";
import { useSelector, useDispatch } from "react-redux";
import { getNotifiesByLimit } from "../../../store/actions/notify.action";
import config from "../../../config";
import moment from "moment";

import { io } from "socket.io-client";
var socket = io(`${config.socketUrl}`);

const Notification = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const notifiesList = useSelector(state => state.notify.list);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [hasNew, setHasNew] = useState(false);
  const [randomKey, setRandomKey] = useState(1);

  useEffect(() => {
    if(user._id) dispatch(getNotifiesByLimit(50, user._id))
  }, [user]);

  useEffect(() => {
    if (notifiesList) {
      var temp = false;
      for (var i = 0; i < notifiesList.length; i++) {
        if (notifiesList[i].is_new == true) {
          temp = true;
          break;
        }
      }
      setHasNew(temp);
      setRandomKey(Math.random());
    }
  }, [notifiesList]);



  useEffect(() => {
    socket.on("UpdateStatus", data => {
      if(user._id) {
        console.log("update notifies list");
        dispatch(getNotifiesByLimit(50, user._id))
      }
    })
  }, [])


  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.notification, className)}>


        <button key={randomKey}
          className={cn(styles.head, hasNew ? styles.active : "")}
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
                      <div className={styles.date}>{x.date ? moment(x.date).format("YYYY-MM-DD HH:mm:ss") : ""}</div>
                    </div>
                    <div
                      className={styles.status}
                      style={{ backgroundColor: x.is_new ? "#45B26B" : "#000000" }}
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
