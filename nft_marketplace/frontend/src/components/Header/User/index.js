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
import { getBalanceOfAccount } from "../../../InteractWithSmartContract/interact";
import { getDetailedUserInfo } from "../../../store/actions/auth.actions";

import { io } from 'socket.io-client';
var socket = io(`${config.socketUrl}`);

const User = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const currentUsr  = useSelector(state=>state.auth.detail);
  const dispatch = useDispatch();
  const history = useHistory();
  const [balance, setBalance] = useState(0);
  const [compressedAddress, setCompressedAddress] = useState("");
  const currentBalanceOfUser = useSelector(state => state.auth.balance)
  const [items, setItems] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    
    socket.on("UpdateStatus", data => 
    {
      console.log("status updated!:", data);      
      setTimeout( () => {
        if(currentUsr && currentUsr.address )
        {
          getBalanceOfAccount(currentUsr.address);
        }
      }, 100);
    });
    if(currentUsr && currentUsr._id)
    {
      setItems( [
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
    ])
  }
  }, [currentUsr])

  useEffect(() =>
  {
    if(currentUsr && currentUsr.address)
    {
      let address = currentUsr.address;
      address = address.toString();
      address = address.substring(0, 10)+"..."+address.substring(36, 42);
      setCompressedAddress(address);    
    }
  }, [currentUsr])

  useEffect(() =>
  {
    if(currentUsr && currentUsr.address )
    {
      getBalanceOfAccount(currentUsr.address);
    }
  }, [currentUsr]);

  useEffect(() =>
  {
    if(currentBalanceOfUser) setBalance(currentBalanceOfUser);
  }, [currentBalanceOfUser])
  
  const onDisconnect = () =>
  {
    dispatch(authLogout({}));
    localStorage.removeItem("jwtToken");
    history.push("/");
  }

  const onCopyAddress = () => 
  {
    document.getElementById("hiddenAddressInput").select();
    document.execCommand("copy");
    setCopied(true);
    setTimeout(() => {
      setCopied(false)
    }, 2000);    
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
            <div className={styles.name}>{currentUsr && currentUsr.username && currentUsr.username}</div>
            <div className={styles.code}>
              <div className={styles.number}>{compressedAddress && compressedAddress}</div>
              <div style={{ position:"relative" }}>
                <button className={styles.copy}  onClick={() => onCopyAddress()} >
                  <Icon name="copy" size="16" />
                </button>
                {
                  copied && 
                  <div className={styles.copiedDiv} >copied</div>
                }
              </div>
            </div>
            <input type="text" id="hiddenAddressInput" 
              style={{ height:"0px", opacity:"0"}} 
              value={currentUsr && currentUsr.address && currentUsr.address} />
            <div className={styles.wrap}>
              <div className={styles.line}>
                <div className={styles.preview}>
                  <img
                    src="/images/content/AVAX_logo.png"
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
              {
                (items && items.length > 0) && 
                items.map((x, index) =>
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
                : x.title === "Disconnect"?
                (
                  <div className={styles.item}  style={{cursor:"pointer"}} key={index}>
                    <div className={styles.icon}>
                      <Icon name={x.icon} size="20" />
                    </div>
                    <div className={styles.text} onClick={() => onDisconnect()}>{x.title}</div>
                  </div>
                )
                :(
                  <div className={styles.item} style={{cursor:"pointer"}} key={index}>
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
