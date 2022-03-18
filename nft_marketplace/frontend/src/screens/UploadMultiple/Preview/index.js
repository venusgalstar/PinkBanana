import React from "react";
import cn from "classnames";
import styles from "./Preview.module.sass";
import Icon from "../../../components/Icon";

const Preview = ({ className, onClose, imgSrc, itemTitle, itemPrice, clearAll}) => {

  const clearPreviewCard = () =>
  {
    // document.getElementById("previewImg").src = "";
    clearAll();
  }

  return (
    <div className={cn(className, styles.wrap)}>
      <div className={styles.inner}>
        <button className={styles.close} onClick={onClose}>
          <Icon name="close" size="14" />
        </button>
        <div className={styles.info}>Preview</div>
        <div className={styles.card}>
          <div className={styles.preview}>
            <img
              id="previewImg"
              src={imgSrc}
              alt="Card"
            />
          </div>
          <div className={styles.link}>
            <div className={styles.body}>
              <div className={styles.line}>
                <div className={styles.title}>{itemTitle}</div>
                <div className={styles.price}>{itemPrice} AVAX</div>
              </div>
            </div>
          </div>
        </div>
        <button className={styles.clear} onClick={() => clearPreviewCard()}>
          <Icon name="circle-close" size="24" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default Preview;
