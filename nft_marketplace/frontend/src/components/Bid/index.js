import React from "react";
import cn from "classnames";
import styles from "./Bid.module.sass";

const Bid = ({ className , onChange, onOk, onCancel, nft, balance }) => {

  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Place a bid</div>
      <div className={styles.info}>
        You are about to purchase <strong>{nft && nft.name}</strong>
      </div>
      <div className={styles.stage}>Your bid</div>
      <div className={styles.table}>
        <div className={styles.field}>
          <input
            className={styles.input}
            type="text"
            name="price"
            // value={price || ""}
            placeholder="Please input price"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>       
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={onOk}>Place a bid</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default Bid;
