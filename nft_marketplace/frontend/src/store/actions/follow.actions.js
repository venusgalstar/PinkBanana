import { FOLLOW_SUCCESS, FOLLOW_FAILED, IS_FOLLOWING_EXISTS, UPDATE_FOLLOW_LIST, UPDATE_FOLLOWING_LIST } from "./action.types";
import config from '../../config';
import axios from 'axios';

export const toggleFollow = (my_id, target_id) => dispatch => {

    axios.post(`${config.baseUrl}follow/toggle_follow`, { my_id, target_id }, {
        headers:
        {
            "x-access-token": localStorage.getItem("jwtToken")
        }
    }).then((result) => {
        dispatch({
            type: FOLLOW_SUCCESS,
            payload: { follow_status: true }
        })
    }).catch(() => {
        dispatch({
            type: FOLLOW_FAILED,
            payload: { follow_status: false }
        })
    });
}

export const getFollowList = (user_id, limit) => dispatch => {
    axios.post(`${config.baseUrl}follow/get_follows`,
        { limit: limit, my_id: user_id}, {
            headers:
            {
                "x-access-token": localStorage.getItem("jwtToken")
            }
        })
        .then((result) => {
            console.log("UPDATE_FOLLOW_LIST : ", result.data.data );
            dispatch({
                type: UPDATE_FOLLOW_LIST,
                payload: result.data.data
            });
        }).catch(() => {

    });
}

export const getFollowingList = (user_id, limit) => dispatch => {
    axios.post(`${config.baseUrl}follow/get_followings`,
        { limit: limit , my_id: user_id}, {
            headers:
            {
                "x-access-token": localStorage.getItem("jwtToken")
            }
        })
        .then((result) => {
            console.log("UPDATE_FOLLOWING_LIST : ", result.data.data );
            dispatch({
                type: UPDATE_FOLLOWING_LIST,
                payload: result.data.data
            });
        }).catch(() => {

        });
}

export const getIsExists = (user_id, target_id) => dispatch =>
{
    axios.post(`${config.baseUrl}follow/get_isExists`,
        { user_id, target_id}, {
            headers:
            {
                "x-access-token": localStorage.getItem("jwtToken")
            }
        })
        .then((result) => {
            console.log("IS_FOLLOWING_EXISTS : ", result.data.data );
            dispatch({
                type: IS_FOLLOWING_EXISTS,
                payload: result.data.data
            });
        }).catch(() => {

        });    
}
