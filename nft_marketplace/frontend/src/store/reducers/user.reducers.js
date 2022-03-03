import { UPDATE_POPULAR_USERS } from "../actions/action.types";

export default function Nft(state, action) {
    switch(action.type) {
        case UPDATE_POPULAR_USERS:
            console.log("action.payload:", action.payload);
            return {...state, ...action.payload};
        default:
            return {...state};
    }
}