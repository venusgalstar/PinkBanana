import { AUTH_LOGOUT, AUTH_SUCCESS, GET_USER_DETAIL, SET_WALLET_ADDR, CURRENT_USER} from "./action.types"
import axios from "axios";
import config from "../../config";

export const authSet = (payload) => dispatch => {
    dispatch({
        type: AUTH_SUCCESS,
        payload: payload
    })
}

export const authLogout = () => dispatch => {
    dispatch({
        type: AUTH_LOGOUT,
        payload: {}
    })
}

export const getCurrentUser = () => dispatch =>
{
    console.log("getCurrentUser action !!")
    dispatch({
        type: CURRENT_USER,
        payload: {}
    })
}

export const getDetailedUserInfo = (userId) => dispatch =>
{    
    axios.get(`${config.baseUrl}users/findOne/${userId}`, {}, {
        headers:
        {
            "x-access-token": sessionStorage.getItem("jwtToken")
        }
    }).then((result) => {
       
        dispatch({
            type: GET_USER_DETAIL,
            payload: result.data.data
        })
    }).catch(() => {
        console.log("Get detailed userInfo failed.");
    });
}

export const setConnectedWalletAddress = (address) => dispatch =>
{
    console.log("[ACTION] address  = ", address);
    dispatch({
        type: SET_WALLET_ADDR,
        payload: address
    })
}
