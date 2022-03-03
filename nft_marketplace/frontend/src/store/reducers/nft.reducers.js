import { UPDATE_NFT_BANNER_LIST, GET_NFT_DETAIL, UPDATE_ITEMS_OF_USER_BY_CONDITION, UPDATE_ITEMS_OF_COLLECTION, BUY_NFT_SUCCESS } from "../actions/action.types";
/// UPDATE_HOT_BID_LIST
export default function Nft(state, action) {
    switch(action.type) {
        case UPDATE_NFT_BANNER_LIST:
            return {...state, ...action.payload};
        case GET_NFT_DETAIL:
            return {...state, ...action.payload};
        case BUY_NFT_SUCCESS:
            return {...state, buy_result: action.payload};
        case UPDATE_ITEMS_OF_COLLECTION:
            return {...state, list: action.payload}
        case UPDATE_ITEMS_OF_USER_BY_CONDITION:
            // console.log("reducer UPDATE_ITEMS_OF_USER_BY_CONDITION", "action.payload : ", action.payload)
            return {...state, list: action.payload}
        default:
            return {...state};
    }
}
