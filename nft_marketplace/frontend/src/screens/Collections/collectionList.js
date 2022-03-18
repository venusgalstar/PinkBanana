import React, { useEffect } from "react";
import styles from "./Profile.module.sass";
import { useDispatch, useSelector } from "react-redux";
import Cards from "./CollectionCards";
import { getCollections } from "../../store/actions/collection.actions";
import { setConsideringCollectionId } from "../../store/actions/collection.actions";
import { useHistory } from "react-router-dom";
import Slider from "react-slick";
import Icon from "../../components/Icon";
import cn from "classnames";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const CollectionList = () => 
{  
  let dispatch = useDispatch();
  const currentUsr  = useSelector(state=>state.auth.user);
  const collections = useSelector(state => state.collection.list);
  const history = useHistory();

    useEffect(() =>
    {
        dispatch(getCollections(90, currentUsr._id))
    }, [dispatch, currentUsr._id]);
  
  const onSelectCollection = (id) =>
  {
    // go to the item list of this collection
    dispatch(setConsideringCollectionId(id));
    localStorage.setItem("collectionId", id);
    history.push("/collectionItems/"+id);
  }

  const createNewCollection = () =>
  {
    history.push("/createCollection");
  }

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
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
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 100000,
        settings: "unslick",
      },
    ],
  };     

  return (
    <div className="container">
      <div style={{paddingTop: "3rem", paddingRight: "5rem"}}>
        <h1>My Collections</h1>
      </div>   
      <div style={{
        margin: "1rem"
      }}>
      <button className={cn("button-stroke button-small", styles.btns)} onClick={() => createNewCollection() }>
          <span>Create a collection</span>
      </button>
      </div>   
        {
            (collections !== undefined && collections !== null) &&
            
            <div id="sliderWrapper" className={styles.list}>
            <Slider
                className={cn("discover-slider", styles.slider)}
                {...settings}
            >
                {
                  (collections && collections.length >0 ) ? collections.map((x, index) => (
                    <Cards className={styles.card} collection={x} key={index} onSelectCollection={onSelectCollection}/>
                  )): <></>}                           
            </Slider>
            </div>
        }
        <div style={{marginBottom:"5rem"}}><span>&nbsp;&nbsp;</span></div>
    </div>
  );
};

export default CollectionList;
