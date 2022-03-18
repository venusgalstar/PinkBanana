import { UPDATE_NFT_BANNER_LIST, GET_NFT_DETAIL, UPDATE_ITEMS_OF_USER_BY_CONDITION, SET_NFT_TRADING_RESULT, SET_SERVICE_FEE, UPDATE_ITEMS_OF_COLLECTION, BUY_NFT_SUCCESS } from "../actions/action.types";

const init = {
    serviceFee: 1.5,   //percentage value 1.5 means 1.5%,
    tradingResult: null
}

export default function Nft(state = init, action) {
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
        case SET_SERVICE_FEE:
            return {
                ...state, serviceFee: action.payload
            }
        case SET_NFT_TRADING_RESULT:
            // console.log("[SET_NFT_TRADING_RESULT Reducer ] payload = ", action.payload)
            return {
                ...state, tradingResult: action.payload
            }
        default:
            return {...state};
    }
}
