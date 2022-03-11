import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import store from "./store";
import { Provider } from "react-redux";
import jwt_decode from "jwt-decode";
import { authLogout, authSet } from "./store/actions/auth.actions";
import { loadWeb3, getValidWallet, getAvaxPrice } from "./InteractWithSmartContract/interact";
import config from "./config";
import { setAvaxPrice } from "./store/actions/user.action";

import { UPDATE_SERVER_TIME } from "./store/actions/action.types";

import { io } from 'socket.io-client';
const socket = io(`${config.socketUrl}`);

socket.on("ServerTime", data => {
  store.dispatch({ type: UPDATE_SERVER_TIME, payload: data });
})



socket.emit("hello", { data: "hello emit" });
socket.emit("event", { event: "hello event" });


loadWeb3();

const checkValidLogin = async () => {
  if (localStorage.jwtToken !== undefined &&
    localStorage.jwtToken !== "" &&
    localStorage.jwtToken !== null) {
    const decoded = jwt_decode(localStorage.jwtToken);
    const currTime = Date.now() / 1000;
    let connection = await getValidWallet();
    console.log("connection.address = " + connection.address + " decoded.address = " + decoded._doc.address)
    console.log("decoded = ", decoded);
    if(connection.address === "")
    {
      // alert("No connected wallet");
    }
    if (connection.success === true) {
      if (decoded.app < currTime ) 
      {
        // console.log(decoded);
        store.dispatch(authLogout());
        localStorage.removeItem("jwtToken");
        alert("Session timeouted. Plese sign in again.")
      }
      else {
        // console.log(decoded);      
        store.dispatch(authSet(decoded._doc));
      }
    }
  }
}

checkValidLogin();

// get avax price and set
const avaxPrice = async () => {
  var result = await getAvaxPrice();
  var r = Number(result._reserve1) / Number(result._reserve0);
  r = r * Math.pow(10, 12);
  store.dispatch(setAvaxPrice(r));
  setTimeout(avaxPrice, 10000);
}

avaxPrice();



ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
