import React, { useState } from "react";
import cn from "classnames";
import styles from "./Add.module.sass";
import Icon from "../../../../components/Icon";
import Alert from "../../../../components/Alert";
import Modal from "../../../../components/Modal";
import isEmpty from "../../../../utilities/isEmpty"
import {  useSelector } from "react-redux";

const Add = ({ className, isFollow, onToggle }) => {
  const [visible, setVisible] = useState(isFollow);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);
  const currentUsr  =  useSelector(state=>state.auth.user);  //user_id in making follow

  return (

    <>
      <button
        className={cn(className, styles.add, {
          [styles.active]: visible,
        })}
        onClick={() => {
          if (isEmpty(currentUsr)) {
            setAlertParam({ state: "warning", title: "Warning", content: "You have to sign in to do it." });
            setVisibleModal(true);
            return;
          } else {
            setVisible(!visible); 
            onToggle();
          }
        }}
      >
        {/* <button
      className={cn(className, styles.add, {
        [styles.active]: visible,
      })}
      onClick={() => setVisible(!visible)}
    > */}
        <Icon name="add-square" size="24" />
        <Icon name="minus-square" size="24" />
      </button>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="Yes" onOk={() => { setVisibleModal(false) }} onCancel={() => { setVisibleModal(false) }} />
      </Modal>
    </>
  );
};

export default Add;
