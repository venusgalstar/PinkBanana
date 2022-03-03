import React, { useState } from "react";
import cn from "classnames";
import styles from "./Transfer.module.sass";

const ChangePrice = ({ className, onOk , onCancel}) => {
  
  const [price, setPrice] = useState();

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn("h4", styles.title)}>Change Nft Price</div>
      <div className={styles.text}>
        You can change nft price now.
      </div>
      <div className={styles.info}>Price</div>
      <div className={styles.field}>
        <input
          className={styles.input}
          type="text"
          name="price"
          value={price || ""}
          placeholder="Please input new price"
          onChange={(e)=>setPrice(e.target.value)}
        />
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={()=>{onOk(price)}}>Setting</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ChangePrice;
