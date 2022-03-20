import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./User.module.sass";
import Icon from "../../../components/Icon";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../config";
import { useParams } from "react-router-dom";
import {toggleFollow, getIsExists} from "../../../store/actions/follow.actions";
import { getDetailedUserInfo } from "../../../store/actions/auth.actions";
import moment from "moment";
import isEmpty from "../../../utilities/isEmpty"
import Alert from "../../../components/Alert";
import Modal from "../../../components/Modal";


const User = ({ className, item }) => {
  const [visible, setVisible] = useState(false);
  const currentUsr  =  useSelector(state=>state.auth.user);  //user_id in making follow
  const {userId} = useParams();  //taget_id in making follow
  const dispatch = useDispatch();
  const detailedUserInfo = useSelector(state => state.auth.otherUser);
  const isFollowPairExists = useSelector(state => state.follow.isExists);
  const [compressedAddress, setCompressedAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);

  const onClickFollow = () =>
  {
    if(isEmpty(currentUsr))
    {
      setAlertParam({ state: "warning", title: "Warning", content: "You have to sign in to do it." });
      setVisibleModal(true);
      return;
    }
    dispatch(toggleFollow(currentUsr._id, userId ));
    setTimeout(() => {      
      dispatch(getIsExists(currentUsr._id, userId));
    }, 1000)
  }

  const onClickUnfollow = () =>
  {
    if(isEmpty(currentUsr))
    {
      setAlertParam({ state: "warning", title: "Warning", content: "You have to sign in to do it." });
      setVisibleModal(true);
      return;
    }
    dispatch(toggleFollow(currentUsr._id, userId ));
    setTimeout(() => {      
      dispatch(getIsExists(currentUsr._id, userId));
    }, 1000)
  }

  useEffect(() => 
  {
    dispatch(getDetailedUserInfo(userId, false));
    dispatch(getIsExists(currentUsr._id, userId));
  }, [userId, currentUsr, dispatch])

  useEffect(() =>
  {
    if(detailedUserInfo && detailedUserInfo.address)
    {
      let address = detailedUserInfo.address;
      address = address.toString();
      address = address.substring(0, 7)+"..."+address.substring(38, 42);
      setCompressedAddress(address);
    }
  }, [detailedUserInfo])
  
  const onCopyAddress = () =>
  {
    document.getElementById("hiddenAddressInput").select();
    document.execCommand("copy");
    setCopied(true);
    setTimeout(() => {
      setCopied(false)
    }, 2000);
  }

  return (
    <>
      <div className={cn(styles.user, className)}>
        <div className={styles.avatar}>
          {
              detailedUserInfo && detailedUserInfo.avatar?              
              <img src={`${config.imgUrl}${detailedUserInfo.avatar}`} alt="avatar" />
              :
              <img src="/images/content/avatar-user.jpg" alt="Avatar" />
            }
        </div>
        <div className={styles.name}>{detailedUserInfo && detailedUserInfo.username}</div>
        <div className={styles.code}>
          <div className={styles.number}>
            {
              compressedAddress && 
              compressedAddress           
            }
          </div>
          <div style={{ position:"relative" }}>
            <button className={styles.copy}  onClick={() => onCopyAddress()} >
              <Icon name="copy" size="16"  />
            </button> 
            {
              copied && 
              <div className={styles.copiedDiv} >copied</div>
            }
          </div>         
        </div>        
        <input type="text" id="hiddenAddressInput" 
          style={{ height:"0px", opacity:"0"}} 
          value={detailedUserInfo && detailedUserInfo.address && detailedUserInfo.address} />
        <div className={styles.info}>
          {detailedUserInfo && detailedUserInfo.userBio}
        </div>
        <a
          className={styles.site}
          href={detailedUserInfo && "https://"+detailedUserInfo.customURL}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Icon name="globe" size="16" />
          <span>{detailedUserInfo && detailedUserInfo.customURL}</span>
        </a>
        <br></br>
        <div className={styles.control}>
          <div className={styles.btns}>
            {
              currentUsr._id !== userId &&
              isFollowPairExists === true &&  
              <button
                className={cn(
                  "button button-small",
                  styles.button
                )}
                onClick={() => setVisible(!visible)}
              >                           
                  <span onClick={() => onClickUnfollow() }>Unfollow</span>              
              </button>
            }            
          </div>         
          <div className={styles.btns}>
            {
              currentUsr._id !== userId &&
              isFollowPairExists === false &&              
              <button
                className={cn(
                  "button button-small",
                  styles.button
                )}
                onClick={() => setVisible(!visible)}
              >                           
                  <span onClick={() => onClickFollow() }>Follow</span>              
              </button>
            }            
          </div>
        </div>
        <div className={styles.socials}>
          {item.map((x, index) => (
            <a
              className={styles.social}
              href={x.url}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
            >
              <Icon name={x.title} size="20" />
            </a>
          ))}
        </div>
        <div className={styles.note}>Member since {detailedUserInfo && moment(detailedUserInfo.createdAt).format("YYYY-MM-DD")}</div>
      </div>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="Yes" onOk={() => {setVisibleModal(false)}} onCancel={() => {setVisibleModal(false)}} />
      </Modal>
      {/* <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report />
      </Modal> */}
    </>
  );
};

export default User;
