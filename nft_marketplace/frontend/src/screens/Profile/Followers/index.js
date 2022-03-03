import React from "react";
import cn from "classnames";
import styles from "./Followers.module.sass";
import Loader from "../../../components/Loader";
import config from "../../../config";
import { useDispatch } from "react-redux";
import { toggleFollow } from "../../../store/actions/follow.actions";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const Followers = ({ className, items }) => {
  
  const currentUsr  =  useSelector(state=>state.auth.user);  //user_id in making follow
  const {userId} = useParams();  //taget_id in making follow
  const dispatch = useDispatch();

  const onFollow = () =>
  {
    dispatch(toggleFollow(currentUsr._id, userId ));
  }

  return (
    <div className={cn(styles.followers, className)}>
      <div className={styles.list}>
        {
          (items && items.length > 0) &&
        items.map((x, index) => (
          <div className={styles.item} key={index}>
            <div className={styles.follower}>
              <div className={styles.avatar}>
                <img src={config.imgUrl+x.avatar} alt="Avatar" />
              </div>
              <div className={styles.details}>
                <div className={styles.title}>{x.name}</div>
                <div className={styles.counter}>{x.counter}</div>
                <button 
                  className={cn(
                    { "button-small": x.buttonClass === "blue" },
                    {
                      "button-stroke button-small": x.buttonClass === "stroke",
                    },
                    styles.button
                  )}
                  onClick={() =>onFollow()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {x.buttonContent}
                </button>
              </div>
            </div>
            <div className={styles.wrap}>
              <div className={styles.gallery}>
                {
                  (x.gallery && x.gallery.length>0) &&
                x.gallery.map((x, index) => (
                  <div className={styles.preview} key={index}>
                    <img src={config.imgUrl+x} alt="Follower" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Loader className={styles.loader} />
    </div>
  );
};

export default Followers;
