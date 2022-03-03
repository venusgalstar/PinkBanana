import { UPDATE_COLLECTION_BANNER_LIST, GET_COLLECTION_DETAIL,SET_CONSIDERING_COLLECTION_ID,  UPDATE_COLLECTION_LIST, BUY_COLLECTION_SUCCESS, GET_HOT_COLLECTION } from "../actions/action.types";
/// UPDATE_HOT_BID_LIST
export default function Collection(state, action) {
    
    // console.log("action = ", action);
    switch(action.type) {
        case UPDATE_COLLECTION_BANNER_LIST:
            return {...state, collection: action.payload};
        case GET_COLLECTION_DETAIL:
            return {...state, detail: action.payload.data};
        case BUY_COLLECTION_SUCCESS:
            return {...state, collection: action.payload};
        case UPDATE_COLLECTION_LIST:
            return {...state, list : action.payload.data}
        case SET_CONSIDERING_COLLECTION_ID:
            return {...state, consideringId: action.payload}
        case GET_HOT_COLLECTION:
            return {...state, ...action.payload}
        default:
            return {...state};
    }
}