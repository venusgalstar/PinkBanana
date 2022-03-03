import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./User.module.sass";
import Icon from "../../Icon";
import Theme from "../../Theme";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../config";
import { authLogout } from "../../../store/actions/auth.actions";
import { useHistory } from "react-router-dom";
import { getCurrentWallet } from "../../../InteractWithSmartContract/interact";

const User = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const currentUsr  = useSelector(state=>state.auth.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [balance, setBalance] = useState(0);

  useEffect( async () =>
  {
    if(currentUsr && currentUsr.address !== undefined && currentUsr.address !== "")
    {
      let bal = 0;
      bal  = await getCurrentWallet();
      setBalance(bal.balance);
    }
  }, [currentUsr]);

  console.log("balance = ", balance);

  const items = [
    {
      title: "My profile",
      icon: "user",
      url: "/profile/"+currentUsr._id,
    },
    {
      title: "My Collections",
      icon: "image",
      url: "/collectionList",
    },
    {
      title: "Dark theme",
      icon: "bulb",
    },
    {
      title: "Disconnect",
      icon: "exit"
    },
  ];
  
  const onDisconnect = () =>
  {
    dispatch(authLogout({}));
    history.push("/");
  }

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(styles.user, className)}>
        <div className={styles.head} onClick={() => setVisible(!visible)}>
          <div className={styles.avatar}>
            {
              currentUsr && currentUsr.avatar?              
              <img src={`${config.imgUrl}${currentUsr.avatar}`} alt="avatar" />
              :
              <img src="/images/content/avatar-user.jpg" alt="Avatar" />
            }
          </div>
          <div className={styles.wallet}>
            {balance ?  Number(balance).toFixed(5) : "0.00000"} <span className={styles.currency}>AVAX</span>
          </div>
        </div>
        {visible && (
          <div className={styles.body}>
            <div className={styles.name}>{currentUsr.username}</div>
            <div className={styles.code}>
              <div className={styles.number}>{currentUsr && currentUsr.address}</div>
              <button className={styles.copy}>
                <Icon name="copy" size="16" />
              </button>
            </div>
            <div className={styles.wrap}>
              <div className={styles.line}>
                <div className={styles.preview}>
                  <img
                    src="/images/content/etherium-circle.jpg"
                    alt="Etherium"
                  />
                </div>
                <div className={styles.details}>
                  <div className={styles.info}>Balance</div>
                  <div className={styles.price}>{balance ? Number(balance).toFixed(5) : "0.00000"} AVAX</div>
                </div>
              </div>
              <button
                className={cn("button-stroke button-small", styles.button)}
              >
                Manage fun on Coinbase
              </button>
            </div>
            <div className={styles.menu}>
              {items.map((x, index) =>
                x.url ? (
                  x.url.startsWith("http") ? (
                    <a
                      className={styles.item}
                      href={x.url}
                      rel="noopener noreferrer"
                      key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size="20" />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </a>
                  ) : (
                    <Link
                      className={styles.item}
                      to={x.url}
                      onClick={() => setVisible(!visible)}
                      key={index}
                    >
                      <div className={styles.icon}>
                        <Icon name={x.icon} size="20" />
                      </div>
                      <div className={styles.text}>{x.title}</div>
                    </Link>
                  )
                ) 
                : x.title=="Disconnect"?
                (
                  <div className={styles.item} key={index}>
                    <div className={styles.icon}>
                      <Icon name={x.icon} size="20" />
                    </div>
                    <div className={styles.text} onClick={() => onDisconnect()}>{x.title}</div>
                  </div>
                )
                :(
                  <div className={styles.item} key={index}>
                    <div className={styles.icon}>
                      <Icon name={x.icon} size="20" />
                    </div>
                    <div className={styles.text}>{x.title}</div>
                    <Theme className={styles.theme} />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
};

export default User;
