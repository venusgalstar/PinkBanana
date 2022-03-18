import { UPDATE_NOTIFY_LIST , GET_NOTIFIES_BY_FILTERS, MARK_ALL_NOTIFIES_AS_READ} from "./action.types";
import config from '../../config';
import axios from 'axios';

export const getNotifiesByLimit = (limit, userId, filter=[]) => dispatch => 
{    
    axios.post(`${config.baseUrl}notify/getlist`, {limit, userId, filter}, {
        headers:
        {
            "x-access-token": localStorage.getItem("jwtToken")
        }
    }).then((result) => {
        // console.log("[UPDATE_NOTIFY_LIST action ] result.data.data  = ", result.data.data );
        dispatch({
            type: UPDATE_NOTIFY_LIST,
            payload: result.data.data 
        })
    }).catch(() => {
    });
}

export const markAllAsRead = (notifyIds, userId) => dispatch =>
{
    axios.post(`${config.baseUrl}notify/markAllAsRead`, {notifyIds, userId }, {
        headers:
        {
            "x-access-token": localStorage.getItem("jwtToken")
        }
    }).then((result) => {
        dispatch({
            type: MARK_ALL_NOTIFIES_AS_READ,
            payload: result.data.success 
        })
    }).catch(() => {
    });    
}

export const getNotifiesByFilter = (filters, userId) => dispatch => 
{
    axios.post(`${config.baseUrl}notify/filtering`, {filters, userId}, {
        headers:
        {
            "x-access-token": localStorage.getItem("jwtToken")
        }
    }).then((result) => {
        
        console.log("[GET_NOTIFIES_BY_FILTERS action ] result.data.data  = ", 
            result.data.data );

        dispatch({
            type: GET_NOTIFIES_BY_FILTERS,
            payload: result.data.data 
        })
    }).catch(() => {
    });        
}
