import React from "react";
import cn from "classnames";
import styles from "./Accept.module.sass";

const items = [
  {
    title: "Service fee",
    value: "0 AVAX",
  },
  {
    title: "Total bid amount",
    value: "1.46 AVAX",
  },
];

const Accept = ({ className, onOk, onCancel }) => 
{
  return (
    <div className={cn(className, styles.accept)}>
      <div className={styles.line}>
        <div className={styles.icon}></div>
        <div className={styles.text}>
          You are about to accept a bid for <strong>C O I N Z</strong> from{" "}
          <strong>UI8</strong>
        </div>
      </div>
      <div className={styles.stage}>1.46 AVAX for 1 edition</div>
      <div className={styles.table}>
        {items && items.length>0 && items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{x.value}</div>
          </div>
        ))}
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={onOk}>Accept bid</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default Accept;
