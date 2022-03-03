import React from "react";
// import cn from "classnames";
import styles from "./Cards.module.sass";
import Icon from "../../../components/Icon";
import Slider from "react-slick";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Cards = ({ className, items, onSelectCollection}) => {
  const settings = {
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    infinite: false,
    vertical : false,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const onSelectCard = (id) =>
  {
    document.getElementById(`${id}`).style.border = "2px solid rgba(200,200,200, 1)";
    document.getElementById(`${id}`).style.background = "rgba(170, 170, 170, 0.3)";
    items.forEach(element => {
      if(element._id !== id) {
        document.getElementById(`${element._id}`).style.border = "none";
        document.getElementById(`${element._id}`).style.background = "none";
      }
    }
    );
    onSelectCollection(id);
  }

  function stringToColorCode(str) {
      return '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
  }

  return (        
  <Slider
    className={styles.slider}
    {...settings}
  >   
    <div className={(className, styles.cards)}>
      <div className={styles.card} id={0} onClick={() =>onSelectCard(0)}>
          <div className={styles.plus} style={{ backgroundColor: "#00ff00" }}>
            <Icon name="plus" size="24" />
          </div>
          <div className={styles.subtitle}>New collection</div>
        </div>
      { 
      (items !== undefined && items !== null && items.length>0) &&
      items.map((x, index) => (
        <div className={styles.card} key={index} id={x._id} onClick={() =>onSelectCard(x._id)}>
          <div className={styles.plus} style={{ backgroundColor: stringToColorCode(x.name) }}>
            <Icon name="plus" size="24" />
          </div>
          <div className={styles.subtitle}>{x.name}</div>
        </div>
      ))}
    </div>
    </Slider>
  );
};

export default Cards;
