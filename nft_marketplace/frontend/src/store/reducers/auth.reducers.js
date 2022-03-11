import { AUTH_LOGOUT, AUTH_SUCCESS, GET_USER_DETAIL, SET_WALLET_ADDR, SET_CHAIN_ID, CURRENT_USER } from "../actions/action.types";

const auth = {
    user: {},
    currentWallet : "",
    currentChainId : ""
}

export function Auth(state = auth, action) 
{
    switch(action.type) {
        case AUTH_SUCCESS:
            return {...state, user: action.payload};
        case AUTH_LOGOUT:
            // localStorage.removeItem("jwtToken");
            return {...state, user: action.payload};
        case GET_USER_DETAIL:
            return {
                ...state, detail: action.payload
            }
        case SET_WALLET_ADDR:
            console.log("[REDUCER] address  = ", action.payload);
            return{
                ...state, currentWallet: action.payload
            }
        case SET_CHAIN_ID:
            console.log("[REDUCER] chainId  = ", action.payload);
            return{
                ...state, currentChainId : action.payload
            }
        default:
            return {...state};
    }
}

export function GetCurrentUser(state, action)
{
    if(action.type === CURRENT_USER)
    {
        return state.user;
    }
}
