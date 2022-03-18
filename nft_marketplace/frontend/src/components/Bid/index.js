import React from "react";
import cn from "classnames";
import styles from "./Bid.module.sass";

const Bid = ({ className , onChange, onOk, onCancel, nft, balance }) => {
  
  const onContinue = () => {
    var price  = document.getElementById("priceInput").value;
    if(isNaN(price))
    {
      price = 0.00001;
    }
    if(nft && nft.bids && nft.bids.length > 0)
    {
      if( Number(price) <= Number(nft.bids[nft.bids.length - 1].price) )
      {
         price = Number(nft.bids[nft.bids.length - 1].price + 0.00001).toFixed(5);
         document.getElementById("priceInput").value = price;
        return;
      }
    }
    if(nft && nft.bids && nft.bids.length === 0)
    {
      if( Number(price) <= Number(nft.auctionPrice) )
      {
        price = Number(nft.auctionPrice + 0.00001).toFixed(5);
        document.getElementById("priceInput").value = price;
        return;
      }
    }
    onOk(Number(price));
  }

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
            id="priceInput"
            // value={price || ""}
            placeholder="Your bidding price must be bigger than current max bid price."
          />
        </div>       
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={onContinue}>Place a bid</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default Bid;
