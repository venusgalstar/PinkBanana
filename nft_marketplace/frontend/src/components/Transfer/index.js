import React, { useState } from "react";
import cn from "classnames";
import styles from "./Transfer.module.sass";
import Modal from "../../components/Modal";
import Alert from "../../components/Alert";

const Transfer = ({ className, onOk = null }) => 
{
  const regexForWallet = /^(0x[a-fA-F0-9]{40})$/gm;
  const [toAddr, setToAddr] = useState("");
  const [processing, setProcessing] = useState(false);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);

  const onContinue =  () =>
  {    
    if(toAddr !== "") 
    {
      let m; let correct = false;
      while ((m = regexForWallet.exec(toAddr)) !== null) 
      {
        if (m.index === regexForWallet.lastIndex) {
          regexForWallet.lastIndex++;
        }
        console.log("matched :"+m[0]);
        if(m[0] === toAddr) 
        {
          correct = true;
        }         
      }      
      if(!correct)         
      {
        setAlertParam({state:"warning", title:"Warning", content:"Invalid wallet address."});
        setVisibleModal(true);
        setToAddr("");
        return;
      }
    }        
    else { setToAddr(""); return; }
    onOk(toAddr);
  }

  const onYes = () => { 
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  return (
    <div className={cn(className, styles.transfer)}>
      <div className={cn("h4", styles.title)}>Transfer token</div>
      <div className={styles.text}>
        You can transfer tokens from your address to another
      </div>
      <div className={styles.info}>Receiver address</div>
      <div className={styles.field}>
        <input
          className={styles.input}
          type="text"
          name="address"
          value = {toAddr}
          onChange = {(e) => setToAddr(e.target.value)}
          placeholder="Paste address"
        />
      </div>
      <div className={styles.btns}>
        <button className={cn("button", styles.button)} onClick={() => onContinue() }>Continue</button>
        <button className={cn("button-stroke", styles.button)}>Cancel</button>
      </div>
      
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="Yes" onOk={onYes} onCancel={onCancel}/>
      </Modal>
    </div>
  );
};

export default Transfer;
