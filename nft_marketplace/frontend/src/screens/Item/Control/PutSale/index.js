import React, { useState } from "react";
import cn from "classnames";
import styles from "./PutSale.module.sass";
import Icon from "../../../../components/Icon";
import Switch from "../../../../components/Switch";
import { putSale } from "../../../../store/actions/user.action";
import { useDispatch } from "react-redux";


const items = [
  // {
  //   title: "Enter your price",
  //   value: "AVAX",
  // },
  {
    title: "Service fee",
    value: "1.5%",
  },
  {
    title: "Total bid amount",
    value: "0 AVAX",
  },
];

const PutSale = ({ className, onOk, onCancel }) => {
  const [instant, setInstant] = useState(false);
  const [price, setPrice] = useState();
  const [period, setPeriod] = useState(7);

  const setNftPrice = (event) => {
    setPrice(event.target.value);
  }
  const onContinue = () => {
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
          <div className={styles.info}>{instant ? "Instant sale price" : "Auction Sale"}</div>
          <div className={styles.text}>
            Enter the price for which the item will be instanly sold
          </div>
        </div>
        <Switch className={styles.switch} value={instant} setValue={setInstant} />
      </div>
      <div className={styles.table}>
        <div className={styles.row}>
          <input className={styles.input} value={price || ""} onChange={(e) => { setNftPrice(e) }} placeholder="Enter your price" />
          <div className={styles.col} style={{ display: "flex", alignItems: "center" }}>AVAX</div>
        </div>
        {
          !instant ?
            <div className={styles.row}>
              <select className={styles.select} value={period} onChange={(event) => { setPeriod(event.target.value) }} placeholder="Please select auction time">
                <option value={7}>7days</option>
                <option value={10}>10days</option>
                <option value={30}>1month</option>
              </select>
            </div>
            : <></>
        }
        {items.map((x, index) => (
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
