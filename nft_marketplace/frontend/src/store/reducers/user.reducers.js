import { SET_AVAX_PRICE, UPDATE_POPULAR_USERS } from "../actions/action.types";

export default function Nft(state, action) {
    switch(action.type) {
        case UPDATE_POPULAR_USERS:
            return {...state, ...action.payload};
        case SET_AVAX_PRICE:
            return {...state, ...action.payload};
        default:
            return {...state};
    }
}