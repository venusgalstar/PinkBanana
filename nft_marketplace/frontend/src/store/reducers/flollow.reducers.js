import { FOLLOW_SUCCESS, UPDATE_FOLLOW_LIST, IS_FOLLOWING_EXISTS, UPDATE_FOLLOWING_LIST } from "../actions/action.types";
/// BID_FAILED
const init = {
    isExists: false
}

export default function Follow(state = init, action) {
    switch(action.type) {
        case FOLLOW_SUCCESS:
            return {...state, follow: action.payload};
        case UPDATE_FOLLOW_LIST:
            console.log("[UPDATE_FOLLOW_LIST REDUCER] action.payload = ", action.payload);
            return {...state, followlist: action.payload};
        case UPDATE_FOLLOWING_LIST:
            return {...state, followinglist: action.payload};
        case IS_FOLLOWING_EXISTS:
            return {
                ...state, isExists: action.payload
            }
        default:
            return {...state};
    }
}