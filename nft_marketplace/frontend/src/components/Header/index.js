import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./Header.module.sass";
import Icon from "../Icon";
import Image from "../Image";
import Notification from "./Notification";
import User from "./User";
import axios from "axios";
import config from "../../config";
import { authSet } from "../../store/actions/auth.actions";
import { useDispatch, useSelector } from 'react-redux';
import jwt_decode from "jwt-decode";
import { useHistory } from "react-router-dom";
import { connectWallet, signString } from "../../InteractWithSmartContract/interact";
import { setConnectedWalletAddress } from "../../store/actions/auth.actions";
import Modal from "../../components/Modal";
import { useEffect } from "react";
import { getDetailedUserInfo } from "../../store/actions/auth.actions";
import { authLogout } from "../../store/actions/auth.actions";
import { getNotifiesByLimit } from "../../store/actions/notify.action";
import { setLatestUserInfo } from "../../store/actions/auth.actions";
import Alert from "../Alert";

import { io } from "socket.io-client";

var socket = io(`${config.socketUrl}`);

const nav = [
  {
    url: "/search01",
    title: "Discover",
  },
  {
    url: "/faq",
    title: "How it work",
  },
  {
    url: "/item",
    title: "Create item",
  },
  {
    url: "/profile",
    title: "Profile",
  },
];

const Headers = () => {
  const [visibleNav, setVisibleNav] = useState(false);
  const [search, setSearch] = useState("");
  const currentUsr = useSelector(state => state.auth.user);
  const history = useHistory();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const currentAddr = useSelector(state => state.auth.currentWallet);
  const user = useSelector(state => state.auth.user);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);
  const walletStatus = useSelector(state => state.auth.walletStatus);

  useEffect(() => {
    function init() {
      //login with this wallet
      if (currentAddr === 0 || currentAddr === undefined) {
        //do logout      
        dispatch(authLogout({}));
      }
      else if (currentAddr !== "") {
        if (localStorage.jwtToken !== undefined &&
          localStorage.jwtToken !== "" &&
          localStorage.jwtToken !== null) {
          const decoded = jwt_decode(localStorage.jwtToken);
          const currTime = Date.now() / 1000;
          console.log(currentAddr, decoded._doc.address);
          if (currentAddr && currentAddr.toString() === decoded._doc.address.toString().toLowerCase()) {
            if (decoded.app < currTime) {
              dispatch(authLogout());
              localStorage.removeItem("jwtToken");
              setAlertParam({ state: "info", title: "Info", content: "Session timeouted. Plese sign in again." });
              setVisibleModal(true);
            }
            else {
              console.log("decoded = ", decoded);
              dispatch(authSet(decoded._doc));
              dispatch(setLatestUserInfo(decoded._doc._id));
              history.push("/");
              return;
            }
          } else {
            console.log("differnt addr");
            dispatch(authLogout({}))
          }
        } else dispatch(authLogout({}))
      }
    }
    init();
  }, [currentAddr])

  useEffect(() => {
    if (currentUsr && currentUsr._id) dispatch(getDetailedUserInfo(currentUsr._id));
  }, [currentUsr])

  const onOk = () => {
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  useEffect(() => {
    socket.on("UpdateStatus", data => {
      if (user._id) dispatch(getNotifiesByLimit(50, user._id))
      if (data.type === "UPDATE_USER_AUTH") {
        if (currentUsr && currentUsr._id) dispatch(getDetailedUserInfo(currentUsr._id));
      }
    });
  }, [])

  const handleSubmit = (e) => {

  };

  const dispatch = useDispatch();

  const onClickSignIn = async () => {
    // dispatch(setConnectedWalletAddress(connection.address));
      let connection = await connectWallet();
      if (connection.success === true) {
      let signedString = "";
      // console.log("connection address", connection.address);
      signedString = await signString(connection.address);
      if (signedString.success === true) {
        const params = {};
        params.address = connection.address;
        params.password = signedString.message;
        Login(params);
      }
      else {
        setAlertParam({ state: "warning", title: "Warning", content: signedString.message });
        setVisibleModal(true);
      }
    }else{      
      setAlertParam({state: "warning", title:"Warning", content: "Please connect and unlock your wallet." });      
      setVisibleModal(true);
    }
  }

  const Login = (params) => {
    axios({
      method: "post",
      url: `${config.baseUrl}users/login`,
      data: params
    })
      .then(function (response) {
        if (response.data.success === true) {
          //set the token to sessionStroage   
          const token = response.data.token;
          localStorage.setItem("jwtToken", response.data.token);
          const decoded = jwt_decode(token);
          console.log(decoded);
          dispatch(authSet(decoded._doc));
          history.push("/");
        }
      })
      .catch(function (error) {
        // console.log(error);
        setAlertParam({ state: "info", title: "Info", content: "Please sign up. You don't have an account with this wallet address : "+params.address});
        setVisibleModal(true);
      });
  }
  
  const onClickSignUp = async () => {
    let connection = await connectWallet();
    if (connection.success === true) {
      dispatch(setConnectedWalletAddress(connection.address));
      // history.push("/profile-edit/new");
      history.push({ pathname: "/profile-edit/new" });
    }else{     
        setAlertParam({state: "info", title:"Info", content: "Please connect and unlock your wallet." });      
        setVisibleModal(true);
    }
  }

  const onClickUpload = () => {
    if (currentUsr && currentUsr.verified === true)
      history.push({ pathname: "/upload-variants" });
    else {
      //show warning modal      
      setShowVerifyModal(true);
    }
  }

  return (
    <header className={styles.header}>
      <div className={cn("container", styles.container)}>
        <Link className={styles.logo} to="/">
          <Image
            className={styles.pic}
            src="/images/logo-dark.png"
            srcDark="/images/logo-light.png"
            alt="Fitness Pro"
          />
        </Link>
        <div className={cn(styles.wrapper, { [styles.active]: visibleNav })}>
          <nav className={styles.nav}>
            {
              (nav && nav.length > 0) &&
              nav.map((x, index) => (
                <Link
                  className={styles.link}
                  // activeClassName={styles.active}
                  to={x.url}
                  key={index}
                >
                  {x.title}
                </Link>
              ))}
          </nav>
          {/* <form
            className={styles.search}
            action=""
            onSubmit={() => handleSubmit()}
          >
            <input
              className={styles.input}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              name="search"
              placeholder="Search"
              required
            />
            <button className={styles.result}>
              <Icon name="search" size="20" />
            </button>
          </form> */}
          {
            (currentUsr && currentUsr._id !== undefined) &&
            <button
              className={cn("button-small", styles.button)}
              onClick={() => onClickUpload()}
            >
              Upload
            </button>
          }
        </div>
        <Notification className={styles.notification} />
        {
          (currentUsr && currentUsr._id !== undefined) &&
          <button
            className={cn("button-small", styles.button)}
            onClick={() => onClickUpload()}
          >
            Upload
          </button>
        }
        {
          (currentUsr && currentUsr._id === undefined) ?
            <>
              <button
                className={cn("button-small", styles.button)}
                onClick={() => onClickSignIn()}
              >
                Sign in
              </button>
              <button
                className={cn("button-small", styles.button)}
                onClick={() => onClickSignUp()}
              >
                Sign up
              </button>
            </>
            :
            <User className={styles.user} />
        }

        <button
          className={cn(styles.burger, { [styles.active]: visibleNav })}
          onClick={() => setVisibleNav(!visibleNav)}
        ></button>
      </div>

      <Modal visible={showVerifyModal} onClose={() => setShowVerifyModal(false)} >
        <div className={styles.field}>
          <h3>You are not verified. Please contact the manager.</h3>
        </div>
        <button className={cn("button", styles.button)}
          style={{
            width: "-webkit-fill-available",
            marginTop: "1rem"
          }}
          onClick={() => setShowVerifyModal(false)}>
          Yes
        </button>
      </Modal>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="OK" onOk={onOk} onCancel={onCancel} />
      </Modal>
    </header>
  );
};

export default Headers;
