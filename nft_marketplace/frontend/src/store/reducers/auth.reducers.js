import { AUTH_LOGOUT, AUTH_SUCCESS, GET_USER_DETAIL, SET_WALLET_ADDR, CURRENT_USER } from "../actions/action.types";

const auth = {
    user: {}
}

export function Auth(state = auth, action) 
{
    switch(action.type) {
        case AUTH_SUCCESS:
            return {...state, user: action.payload};
        case AUTH_LOGOUT:
            sessionStorage.removeItem("jwtToken");
            return {...state, user: action.payload};
        case GET_USER_DETAIL:
            return {
                ...state, detail: action.payload
            }
        case SET_WALLET_ADDR:
            console.log("[REDUCER]caddress  = ", action.payload);
            let updatedUser = state.user;
            updatedUser.address = action.payload;
            return{
                ...state, user: updatedUser
            }
        default:
            return {...state};
    }
}

export function GetCurrentUser(state, action)
{
    if(action.type === CURRENT_USER)
    {
        console.log("GetCurrentUser !!")
        return state.user;
    }
}
