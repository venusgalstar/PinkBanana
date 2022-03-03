import { BID_SUCCESS, UPDATE_HOT_BID_LIST } from "../actions/action.types";
/// BID_FAILED
export default function Bid(state, action) {
    switch(action.type) {
        case BID_SUCCESS:
            return {...state, bid: action.payload};
        case UPDATE_HOT_BID_LIST:
            return {...state, bid: action.payload};
        default:
            return {...state};
    }
}