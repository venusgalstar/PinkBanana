import React from "react";
import cn from "classnames";
import styles from "./Bid.module.sass";

const items = [
  // {
  //   title: "Enter bid",
  //   value: "AVAX",
  // },
  {
    title: "Your balance",
    value: "8.498 AVAX",
  },
  {
    title: "Service fee",
    value: "0 AVAX",
  },
  {
    title: "Total bid amount",
    value: "0 AVAX",
  },
];

const Bid = ({ className , onChange, onOk, onCancel}) => {

  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Place a bid</div>
      <div className={styles.info}>
        You are about to purchase <strong>C O I N Z</strong> from{" "}
        <strong>UI8</strong>
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
        {
        (items  && items.length >0) && 
        items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{x.value}</div>
          </div>
        ))}
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={onOk}>Place a bid</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default Bid;
