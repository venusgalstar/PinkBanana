import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./UploadVariants.module.sass";
import Control from "../../components/Control";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import isEmpty from "../../utilities/isEmpty";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Upload Item",
  },
];

const items = [
  {
    url: "/upload-details/0",
    buttonText: "Create Single",
    image: "/images/content/upload-pic-1.jpg",
    image2x: "/images/content/upload-pic-1@2x.jpg",
    flag : 0
  },
  {
    url: "/upload-multiple/0",
    buttonText: "Create Multiple",
    image: "/images/content/upload-pic-2.jpg",
    image2x: "/images/content/upload-pic-2@2x.jpg",
    flag : 1
  },
];

const Upload = () => {

  const currentUsr = useSelector(state => state.auth.user);
  const detailedUserInfo = useSelector(state => state.auth.detail);
  const history = useHistory();

  useEffect(() =>{
    //check the current user, if ther user is not exists or not verified, go back to the home
    if(isEmpty(currentUsr) || (!isEmpty(detailedUserInfo) && !isEmpty(detailedUserInfo.verified) &&  detailedUserInfo.verified === false) ) history.push("/")
  }, [])

  return (
    <div className={styles.page}>
      <Control className={styles.control} item={breadcrumbs} />
      <div className={cn("section-pt80", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.top}>
            <h1 className={cn("h2", styles.title)}>Upload item</h1>
            <div className={styles.info}>
              Choose <span>“Single”</span> if you want your collectible to be
              one of a kind or <span>“Multiple”</span> if you want to sell one
              collectible multiple times
            </div>
          </div>
          <div className={styles.list}>
            {
              (items && items.length> 0) && 
            items.map((x, index) => (
              <div className={styles.item} key={index}>
                <div className={styles.preview}>
                  <img srcSet={`${x.image2x} 2x`} src={x.image} alt="Upload" />
                </div>
                <Link className={cn("button-stroke", styles.button)} to={x.url} >
                  {x.buttonText}
                </Link>
              </div>
            ))}
          </div>
          <div className={styles.note}>
            We do not own your private keys and cannot access your funds without
            your confirmation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
