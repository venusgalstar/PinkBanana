import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import store from "./store";
import { Provider } from "react-redux";
import jwt_decode from "jwt-decode";
import { authLogout, authSet } from "./store/actions/auth.actions";
import { loadWeb3, getCurrentWalletConnected } from "./InteractWithSmartContract/interact";

loadWeb3();

const checkValidLogin = async () =>
{
  if(sessionStorage.jwtToken !== undefined && 
    sessionStorage.jwtToken !== "" && 
    sessionStorage.jwtToken !== null )
  {
    const decoded = jwt_decode(sessionStorage.jwtToken);
    const currTime = Date.now() / 1000;
    let connection = await getCurrentWalletConnected();
    console.log("connection.address = "+connection.address+"decoded.address = "+decoded.address)
    if(connection.success === true)
    {
      if(decoded.app < currTime || connection.address !== decoded.address)
      {
        // console.log(decoded);
        store.dispatch(authLogout());
        sessionStorage.removeItem("jwtToken");
      }
      else{
        // console.log(decoded);      
        store.dispatch(authSet(decoded._doc));
      }
    }
  }
}

checkValidLogin();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
