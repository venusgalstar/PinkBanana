import { BID_SUCCESS, UPDATE_HOT_BID_LIST, UPDATE_SERVER_TIME } from "../actions/action.types";
/// BID_FAILED
export default function Bid(state, action) {
    switch (action.type) {
        case BID_SUCCESS:
            return { ...state, bid: action.payload };
        case UPDATE_HOT_BID_LIST:
            return { ...state, bid: action.payload };
        case UPDATE_SERVER_TIME:
            return { ...state, system_time: action.payload };
        default:
            return { ...state };
    }
}