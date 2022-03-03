import { combineReducers } from "redux";
import {Auth} from "./auth.reducers";
import Bid from "./bid.reducers";
import Nft from "./nft.reducers";
import User from "./user.reducers";
import Collection from "./collection.reducers";
import Follow from "./flollow.reducers";
import Notify from "./notify.reducers";

const reducers = combineReducers({
    auth: Auth,
    nft: Nft,
    bid: Bid, 
    user: User,
    collection: Collection,
    follow: Follow,
    notify: Notify
})

export default reducers;