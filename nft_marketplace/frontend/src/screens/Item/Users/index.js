import React from "react";
import cn from "classnames";
import styles from "./Users.module.sass";
import { Link } from "react-router-dom";

const Users = ({ className, items }) => {
  return (
    <div className={cn(styles.users, className)}>
      <div className={styles.list}>
        {
          (items && items.length > 0) &&
          items.map((x, index) => (
            <div className={styles.item} key={index}>
              <div className={styles.avatar}>
                <img src={x.avatar} alt="Avatar" />
                {x.reward && (
                  <div className={styles.reward}>
                    <img src={x.reward} alt="Reward" />
                  </div>
                )}
              </div>
              <div className={styles.details}>
                <div className={styles.position}>{x.position}</div>
                <Link to={`/profile/${x.id}`}>
                  <div className={styles.name}>{x.name}</div>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Users;
