import React from "react";
import cn from "classnames";
import styles from "./Options.module.sass";
import Icon from "../../../components/Icon";
import Actions from "../../../components/Actions";
import { useDispatch, useSelector } from "react-redux";
import { setFavItem } from "../../../store/actions/user.action";

const Options = ({ className, setProcessing}) => {
  const nft = useSelector(state => state.nft.detail);
  const auth = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  const toggleFav = () => {
    setFavItem(nft._id, auth._id)(dispatch);
  }

  const isLiked = () => {
    if (nft && auth) {
      if (!nft.likes) {
        return false;
      }

      var index = nft.likes.findIndex((element) => {
        if (element == auth._id) {
          return true;
        } else {
          return false;
        }
      });


      if (index === -1) {
        return false;
      } else {
        return true;
      }
    }
  }

  // useEffect(()=>{
  //   console.log("item info", nft.detail);
  //   console.log("state", state);
  // }, [nft]);


  return (
    <div className={cn(styles.options, className)}>
      {/* <button className={cn("button-circle-stroke", styles.button)}>
        <Icon name="share" size="24" />
      </button> */}
      {/* styles.favorite */}
      <button
        className={cn("button-circle-stroke", styles.button, isLiked() ? styles.favorite : "")}
        onClick={toggleFav}
      >
        <Icon name="heart-fill" size="24" />
      </button>
      {
        nft && auth && auth._id && nft.owner &&
        nft.owner._id.toLowerCase() == auth._id.toLowerCase() &&
        (nft.bids.length === 0) &&
        <Actions className={styles.actions} setProcessing={setProcessing} />
      }

    </div>
  );
};

export default Options;
