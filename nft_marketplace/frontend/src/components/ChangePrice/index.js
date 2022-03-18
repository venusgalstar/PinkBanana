import React, { useState } from "react";
import cn from "classnames";
import styles from "./Transfer.module.sass";

const ChangePrice = ({ className, onOk , onCancel}) => {
  
  const onContinue = () => {
    var price  = document.getElementById("priceInput").value;
    if(isNaN(price) || Number(price) < 0.00001)
    {
      document.getElementById("priceInput").value = 0.00001;
      return;
    }
    onOk(price);
  }

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
          id="priceInput"
          placeholder="Please input new price"
        />
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={()=>{onContinue()}}>Apply</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ChangePrice;
