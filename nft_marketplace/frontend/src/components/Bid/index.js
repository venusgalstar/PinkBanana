import React, { useState } from "react";
import cn from "classnames";
import styles from "./Bid.module.sass";
import isEmpty from "../../utilities/isEmpty";

const Bid = ({ className , onChange, onOk, onCancel, nft, balance }) => {

  const [price, setPrice]  = useState(0);
  const [priceIsInvalid, setPriceIsInvalid] = useState(false);  
  const [warningStr, setWarningStr] = useState("");  
  const regularInputTestRegExp = /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/gm;

  const onChangePrice = (e) =>
  {
    var inputedPrice = e.target.value;    
    if(inputedPrice !== "") 
    {
      setPriceIsInvalid(false);
      let m; let correct = false;
      while ((m = regularInputTestRegExp.exec(inputedPrice)) !== null) 
      {
        if (m.index === regularInputTestRegExp.lastIndex) {
          regularInputTestRegExp.lastIndex++;
        }
        console.log("matched :"+m[0]);
        if(m[0] === inputedPrice) 
        {
          correct = true;
        }         
      }      
      if(!correct)         
      {
        setPriceIsInvalid(true);
        setWarningStr("Price must be a number.");
        return;
      }
    }        
    if(isNaN(inputedPrice))
    {
      setPriceIsInvalid(true);
      setWarningStr("Bidding price must be a valid number.");
      return;
    }
    setPriceIsInvalid(false); 
    setWarningStr("");   
    setPrice(inputedPrice);
  } 

  const onContinue = () => {
    if(isNaN(price))
    {
      setPriceIsInvalid(true);
      setWarningStr("Bidding price must be a valid number.");
      return;
    }
    if(nft && nft.bids && nft.bids.length > 0)
    {
      if( Number(price) <= Number(nft.bids[nft.bids.length - 1].price) )
      {
        setWarningStr("Bidding price must be bigger than crrent max bid.");
        setPriceIsInvalid(true);
        return;
      }
    }
    if(nft && nft.bids && isEmpty(nft.bids.length))
    {
      if( Number(price) <= Number(nft.price) )
      {
        setWarningStr("Bidding price must be bigger than auction staring price.");
        setPriceIsInvalid(true);
        return;
      }
    }
    setWarningStr("");
    setPriceIsInvalid(false);
    setTimeout(() => 
    {
      onOk(Number(price));
    }, 1000)
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
            value={price || ""}
            onChange = {(e) => onChangePrice(e)}
            placeholder="Must be bigger than current max bid."
          />
        </div>       
        {
          priceIsInvalid === true ? 
          <span style={{ color: "red" }}>{warningStr}</span>
          :
          <span style={{ color: "greeb" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
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
