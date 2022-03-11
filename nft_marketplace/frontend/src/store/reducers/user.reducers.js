import { SET_AVAX_PRICE, UPDATE_POPULAR_USERS, SET_THEME_THEME } from "../actions/action.types";

const init = {
    themeMode : "light"
}

export default function User(state = init, action) {
    switch(action.type) {
        case UPDATE_POPULAR_USERS:
            return {...state, ...action.payload};
        case SET_AVAX_PRICE:
            return {...state, ...action.payload};
        case SET_THEME_THEME:
            return {...state, ...action.payload};
        default:
            return {...state};
    }
}