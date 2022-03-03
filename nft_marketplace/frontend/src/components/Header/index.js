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
  const currentUsr  = useSelector(state=>state.auth.user);
  const [createState, setCreateState] = useState(1);
  const history = useHistory();

  const handleSubmit = (e) => {
    
  };
// function makeid(length) {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//       result += characters.charAt(Math.floor(Math.random() * 
//  charactersLength));
//    }
//    return result;
// }

  const dispatch = useDispatch();

  const onClickSign = async () =>
  {    
    if(currentUsr.address === undefined || currentUsr.password === undefined)
    {
      let connection = await connectWallet();    
      if(connection.success === true)
      {
        dispatch(setConnectedWalletAddress(connection.address));   
        let signedString = "";   
        signedString =  await signString(connection.address);
        if(signedString !== "")
        {     
          const params = {};
          params.address= connection.address;
          params.password = signedString;
          setCreateState(1);
          Login(params);
        }
      }
      return;
    }
    const params = {};
    params.address= currentUsr.address;
    params.password= currentUsr.password;
    setCreateState(1);
    Login(params);
  }
  
  const Login = (params) =>
  {
    axios({
      method: "post",
      url: `${config.baseUrl}users/login`,
      data: params
    })
    .then(function (response) {
      if(response.data.success === true)
      { 
        //set the token to sessionStroage   
        const token = response.data.token;   
        sessionStorage.setItem("jwtToken", response.data.token);
        const decoded = jwt_decode(token);
        console.log(decoded);
        dispatch(authSet(decoded._doc));
        setCreateState(0);      
      }
    })
    .catch(function (error) {
      console.log(error);
      setCreateState(2);
    });
  }

  const onClickSignUp = async () =>
  {
    let connection = await connectWallet();    
    if(connection.success === true)
    {
      dispatch(setConnectedWalletAddress(connection.address));
      history.push("/profile-edit");
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
            {nav.map((x, index) => (
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
          <form
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
          </form>
          {
            (currentUsr && currentUsr._id !== undefined) &&
            <Link
              className={cn("button-small", styles.button)}
              to="/upload-variants"
            >
              Upload
            </Link>
          }
        </div>
        <Notification className={styles.notification} />
        {
          (currentUsr && currentUsr._id !== undefined) &&
          <Link
            className={cn("button-small", styles.button)}
            to="/upload-variants"
          >
            Upload
          </Link>
        }
        {/* <Link
          className={cn("button-stroke button-small", styles.button)}
          to="/connect-wallet"
        >
          Connect Wallet
        </Link> */}
        {
          (currentUsr && currentUsr._id === undefined)?          
          <>
            <button
              className={cn("button-small", styles.button)}
              to="/upload-variants"
              onClick={() => onClickSign()}
            >
              Sign in
            </button>
            <button
              className={cn("button-small", styles.button)}
              to="/upload-variants"
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
    </header>
  );
};

export default Headers;
