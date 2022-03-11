import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import store from "./store";
import { Provider } from "react-redux";
import { loadWeb3, getAvaxPrice } from "./InteractWithSmartContract/interact";
import config from "./config";
import { setAvaxPrice } from "./store/actions/user.action";

import { UPDATE_SERVER_TIME } from "./store/actions/action.types";

import { io } from 'socket.io-client';

var socket = io(`${config.socketUrl}`);
socket.on("disconnect", () =>
{
  console.log("disconnected");
  setTimeout(() =>
  {
    socket.connect();
  }, 1000)
})

socket.on("ServerTime", data => {
  store.dispatch({ type: UPDATE_SERVER_TIME, payload: data });
})
socket.on("UpdateStatus", data => {
  console.log("notification status is updated", data);
  // dispatch(getNotifiesByLimit(50, user._id))
})




socket.emit("hello", { data: "hello emit" });
socket.emit("event", { event: "hello event" });

loadWeb3();

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
