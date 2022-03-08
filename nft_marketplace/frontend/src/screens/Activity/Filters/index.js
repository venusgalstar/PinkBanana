import React from "react";
import cn from "classnames";
import styles from "./Filters.module.sass";
import Checkbox from "../../../components/Checkbox";
import config from "../../../config";

const Filters = ({
  className,
  filters,
  selectedFilters,
  setSelectedFilters,
}) => {

  const handleChange = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((x) => x !== filter));
    } else {
      setSelectedFilters((selectedFilters) => [...selectedFilters, filter]);
    }
  };

  const onClickSellectAll = () =>
  {
    setSelectedFilters(filters);
  }

  const onClickUnselectAll = () =>
  {
    setSelectedFilters([]);
  }

  return (
    <div className={cn(styles.filters, className)}>
      <div className={styles.info}>Filters</div>
      <div className={styles.group}>
        {
          (filters && filters.length> 0) && 
          filters.map((x, index) => (
          <Checkbox
            className={styles.checkbox}
            content={x}
            value={selectedFilters.includes(x)}
            onChange={() => handleChange(x)}
            key={index}
          />
        ))}
      </div>
      <div className={styles.btns}>
        <button className={cn("button-stroke button-small", styles.button)} 
          onClick = {() => onClickSellectAll()}  
        >
          Select all
        </button>
        <button className={cn("button-stroke button-small", styles.button)}
          onClick={() => onClickUnselectAll()}
        >
          Unselect all
        </button>
      </div>
    </div>
  );
};

export default Filters;
