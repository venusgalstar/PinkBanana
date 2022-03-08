import React, { useState } from "react";
import cn from "classnames";
import styles from "./alert.module.sass";

const Alert = ({ className, param, onOk, onCancel }) => {

    return (
        <div className={cn(className, styles.transfer)}>
            <div className={cn("h4", styles.title)}>{param.title ? param.title : ""}</div>
            <div className={styles.text}>
                {param.content}
            </div>
            <div className={styles.btns}>
                <button className={cn("button", styles.button)} onClick={onOk}>Setting</button>
                <button className={cn("button-stroke", styles.button)} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default Alert;
