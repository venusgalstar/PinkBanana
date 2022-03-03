import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import Transfer from "../Transfer";
import RemoveSale from "../RemoveSale";
import Burn from "../Burn";
import Report from "../Report";
import Icon from "../Icon";
import Modal from "../../components/Modal";
import ChangePrice from "../ChangePrice";
import { removeSale } from "../../store/actions/user.action";
import { useDispatch, useSelector } from "react-redux";

const Actions = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const [visibleModalTransfer, setVisibleModalTransfer] = useState(false);
  const [visibleModalRemoveSale, setVisibleModalRemoveSale] = useState(false);
  const [visibleModalBurn, setVisibleModalBurn] = useState(false);
  const [visibleModalReport, setVisibleModalReport] = useState(false);
  const [visibleModalChange, setVisibleModalChange] = useState(false);

  const auth = useSelector(state => state.auth);
  const nft = useSelector(state => state.nft);
  const dispatch = useDispatch();




  const items = [
    {
      title: "Change price",
      icon: "coin",
      action: () => setVisibleModalChange(true),
    },
    {
      title: "Transfer token",
      icon: "arrow-right-square",
      action: () => setVisibleModalTransfer(true),
    },
    {
      title: "Remove from sale",
      icon: "close-circle",
      action: () => setVisibleModalRemoveSale(true),
    },
    {
      title: "Burn token",
      icon: "close-circle",
      action: () => setVisibleModalBurn(true),
    },
    {
      title: "Report",
      icon: "info-circle",
      action: () => setVisibleModalReport(true),
    },
  ];

  const setNewPrice = (param) => {
    
    console.log("price:", param);
    setVisibleModalChange(false);
  }


  const removeSale = () => {
    console.log("remove");
    removeSale(nft.detail._id)(dispatch);
    setVisibleModalRemoveSale(false);
  }


  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
        <div
          className={cn(styles.actions, className, {
            [styles.active]: visible,
          })}
        >
          <button
            className={cn("button-circle-stroke", styles.button)}
            onClick={() => setVisible(!visible)}
          >
            <Icon name="more" size="24" />
          </button>
          <div className={styles.body}>
            {items.map((x, index) => (
              <div className={styles.item} key={index} onClick={x.action}>
                <Icon name={x.icon} size="20" />
                <span>{x.title}</span>
              </div>
            ))}
          </div>
        </div>
      </OutsideClickHandler>
      <Modal
        visible={visibleModalTransfer}
        onClose={() => setVisibleModalTransfer(false)}
      >
        <Transfer />
      </Modal>
      <Modal
        visible={visibleModalRemoveSale}
        onClose={() => setVisibleModalRemoveSale(false)}
      >
        <RemoveSale onOk={()=>{removeSale()}} onCancel={()=>setVisibleModalRemoveSale(false)}/>
      </Modal>
      <Modal
        visible={visibleModalBurn}
        onClose={() => setVisibleModalBurn(false)}
      >
        <Burn />
      </Modal>
      <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report />
      </Modal>      
      <Modal
        visible={visibleModalChange}
        onClose={() => setVisibleModalChange(false)}
      >
        <ChangePrice onOk={setNewPrice} onCancel={()=>setVisibleModalChange(false)}/>
      </Modal>
            


    </>
  );
};

export default Actions;
