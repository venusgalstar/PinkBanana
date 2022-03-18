import React, { useState } from "react";
import cn from "classnames";
import styles from "./PutSale.module.sass";
import Icon from "../../../../components/Icon";
import Switch from "../../../../components/Switch";

const items = [
  // {
  //   title: "Enter your price",
  //   value: "AVAX",
  // },
];


const PutSale = ({ className, onOk, onCancel }) => {
  const [instant, setInstant] = useState(false); 
  const [period, setPeriod] = useState(7);

  const onContinue = () => {
    var price  = document.getElementById("priceInput").value;
    if(isNaN(price) || Number(price) < 0.00001)
    {
      document.getElementById("priceInput").value = 0.00001;
      return;
    }
    onOk(price, instant, period);
  }
  
  return (
    <div className={cn(className, styles.sale)}>
      <div className={cn("h4", styles.title)}>Put on sale</div>
      <div className={styles.line}>
        <div className={styles.icon}>
          <Icon name="coin" size="24" />
        </div>
        <div className={styles.details}>
          <div className={styles.info}>{instant ? "Instant sale" : "Auction Sale"}</div>
          <div className={styles.text}>
            Enter the price for which the item will be sold
          </div>
        </div>
        <Switch className={styles.switch} value={instant} setValue={setInstant} />
      </div>
      <div className={styles.table}>
        <div className={styles.row}>
          <input className={styles.input} type="text"  id="priceInput" placeholder="Enter your price" />
          <div className={styles.col} style={{ display: "flex", alignItems: "center" }}>AVAX</div>
        </div>
        { //for test we chaged the value 30 to 0.005 , 0.005 days equals with 432 second, with 7.2 min
          !instant ?
            <div className={styles.row}>
              <select className={styles.select} value={period} onChange={(event) => { setPeriod(event.target.value) }} placeholder="Please select auction time">
                <option value={0.000694}>1min</option>
                <option value={0.00347}>5min</option>
                <option value={0.00694}>10min</option>
                <option value={7}>7 days</option>
                <option value={10}>10 days</option>
                <option value={30}>1 month</option>
              </select>
            </div>
            : <></>
        }
        {
        (items && items.length>0) &&  
        items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{x.value}</div>
          </div>
        ))}
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={onContinue}>Continue</button>
        <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default PutSale;
