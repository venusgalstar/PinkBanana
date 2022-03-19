import React, { useState } from "react";
import cn from "classnames";
import styles from "./Bid.module.sass";

const Bid = ({ className , onChange, onOk, onCancel, nft, balance }) => {
  
  const [priceIsInvalid, setPriceIsInvalid] = useState(false);

  const onContinue = () => {
    var price  = document.getElementById("priceInput").value;
    if(isNaN(price))
    {
      setPriceIsInvalid(true);
      return;
    }
    if(nft && nft.bids && nft.bids.length > 0)
    {
      if( Number(price) <= Number(nft.bids[nft.bids.length - 1].price) )
      {
        //  price = Number(nft.bids[nft.bids.length - 1].price + 0.00001).toFixed(5);
        //  document.getElementById("priceInput").value = price;
        setPriceIsInvalid(true);
        return;
      }
    }
    if(nft && nft.bids && nft.bids.length === 0)
    {
      if( Number(price) <= Number(nft.auctionPrice) )
      {
        // price = Number(nft.auctionPrice + 0.00001).toFixed(5);
        // document.getElementById("priceInput").value = price;
        setPriceIsInvalid(true);
        return;
      }
    }
    setPriceIsInvalid(false);
    onOk(Number(price));
  }

  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Place a bid</div>
      <div className={styles.info}>
        You are about to purchase <strong>{nft && nft.name}</strong>
      </div>
      <div className={styles.stage}>Your bid </div>
      <div className={styles.stageBid}>{nft && nft.bids.length > 0 && "( Current Max bid : "+Number(nft.bids[nft.bids.length - 1].price)+" AVAX )"}</div>
      <div className={styles.table}>
        <div className={styles.field}>
          <input
            className={styles.input}
            type="text"
            name="price"
            id="priceInput"
            // value={price || ""}
            placeholder="Must be bigger than current max bid."
          />
        </div>       
        {
          priceIsInvalid === true ? 
          <span style={{ color: "red" }}>Price is invalid.</span>
          :
          <></>
        }
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={onContinue}>Place a bid</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default Bid;
