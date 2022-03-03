import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./User.module.sass";
import Icon from "../../../components/Icon";
import Report from "../../../components/Report";
import Modal from "../../../components/Modal";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../config";
import { useParams } from "react-router-dom";
import {toggleFollow, getIsExists} from "../../../store/actions/follow.actions";
import { getDetailedUserInfo } from "../../../store/actions/auth.actions";

// import { isStepDivisible } from "react-range/lib/utils";

const shareUrlFacebook = "https://ui8.net";
const shareUrlTwitter = "https://ui8.net";

const User = ({ className, item }) => {
  const [visible, setVisible] = useState(false);
  const [visibleShare, setVisibleShare] = useState(false);
  const [visibleModalReport, setVisibleModalReport] = useState(false);
  const currentUsr  =  useSelector(state=>state.auth.user);  //user_id in making follow
  const {userId} = useParams();  //taget_id in making follow
  const dispatch = useDispatch();
  const detailedUserInfo = useSelector(state => state.auth.detail);
  const isFollowPairExists = useSelector(state => state.follow.isExists);

  const onClickFollow = () =>
  {
    dispatch(toggleFollow(currentUsr._id, userId ));
  }

  const onClickUnfollow = () =>
  {
    dispatch(toggleFollow(currentUsr._id, userId ));
  }

  useEffect(() => 
  {
    dispatch(getDetailedUserInfo(userId));
    dispatch(getIsExists(currentUsr._id, userId));
  }, [userId])

  console.log("isFollowPairExists = ", isFollowPairExists);
  
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
              detailedUserInfo && 
              detailedUserInfo.address !== "" && 
              detailedUserInfo.address            
            }
          </div>
          <button className={styles.copy}>
            <Icon name="copy" size="16" />
          </button>
        </div>
        <div className={styles.info}>
          {detailedUserInfo && detailedUserInfo.userBio}
        </div>
        <a
          className={styles.site}
          href={detailedUserInfo && detailedUserInfo.customURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="globe" size="16" />
          <span>{detailedUserInfo && detailedUserInfo.customURL}</span>
        </a>
        <div className={styles.control}>
          <div className={styles.btns}>
            {
              currentUsr._id !== userId &&
              isFollowPairExists === false && 
              <button
                className={cn(
                  "button button-small",
                  { [styles.active]: visible },
                  styles.button
                )}
                onClick={() => setVisible(!visible)}
              >                           
                  <span onClick={() => onClickFollow() }>Follow</span>
                  <span onClick={() => onClickUnfollow() }>Unfollow</span>              
              </button>
            }
            <button
              className={cn(
                "button-circle-stroke button-small",
                { [styles.active]: visibleShare },
                styles.button
              )}
              onClick={() => setVisibleShare(!visibleShare)}
            >
              <Icon name="share" size="20" />
            </button>
            <button
              className={cn("button-circle-stroke button-small", styles.button)}
              onClick={() => setVisibleModalReport(true)}
            >
              <Icon name="report" size="20" />
            </button>
          </div>
          <div className={cn(styles.box, { [styles.active]: visibleShare })}>
            <div className={styles.stage}>Share link to this page</div>
            <div className={styles.share}>
              <TwitterShareButton
                className={styles.direction}
                url={shareUrlTwitter}
              >
                <span>
                  <Icon name="twitter" size="20" />
                </span>
              </TwitterShareButton>
              <FacebookShareButton
                className={styles.direction}
                url={shareUrlFacebook}
              >
                <span>
                  <Icon name="facebook" size="20" />
                </span>
              </FacebookShareButton>
            </div>
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
        <div className={styles.note}>Member since {detailedUserInfo && detailedUserInfo.createdAt}</div>
      </div>
      <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report />
      </Modal>
    </>
  );
};

export default User;
