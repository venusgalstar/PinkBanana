import React, { useEffect, useState } from "react";
import cn from "classnames";
import { useDispatch, useSelector } from "react-redux";
// import { getItemsOfCollection } from "../../store/actions/nft.actions";
import { getCollectionDetail } from "../../store/actions/collection.actions";
import Icon from "../../components/Icon";
import styles from "./Profile.module.sass";
import Card from "../../components/Card";
import Slider from "react-slick";
import config from "../../config";
import axios from "axios";
import { useParams } from "react-router-dom";
import isEmpty from "../../utilities/isEmpty";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
    <button {...props}>{children}</button>
  );
  
const ItemsOfCollection = () =>
{       
    const collection = useSelector(state => state.collection.detail);
    const [items, setItems] = useState([]);
    const dispatch = useDispatch();
    const [start, setStart] = useState(0);
    const [last, setLast] = useState(8);
    // const collectionId = useSelector(state => state.collection.consideringId);
  const {collectionId} = useParams();
  const [viewNoMore, setViewNoMore] = useState(false);
 
  console.log("collectionId = ", collectionId);

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

    useEffect(() =>
    {   
      console.log("[useEffect] collectionId = ", collectionId)    ;         
      dispatch(getCollectionDetail(collectionId));        
      
    }, [dispatch, collectionId]);
    

    useEffect(() => {
      setStart(0);
      setLast(8);
      itemsOfCollectionList();
    }, [])

    const onLoadMore = () => {
      itemsOfCollectionList();                   
    }

    useEffect(() => 
    {
      setItems(items)
    }, [last, start])

    const itemsOfCollectionList = () =>
    {      
      var params = { start: start, last: last, date: 0, colId : collectionId };
     
      console.log( "start:", start, "last:", last );

      axios.post(`${config.baseUrl}item/get_items_of_collection`, params).then((result) => {
        console.log( "result.data.data = ", result.data.data );
        if(isEmpty(result.data.data))
        {
          setViewNoMore(true);
          setTimeout(() => {
            setViewNoMore(false)
          }, 2500);              
        }
        if (start === 0) {
          setItems(result.data.data);
        } else {
          let curItems = items;
          let moreItems =[], i;
          moreItems  = result.data.data;
          if(moreItems.length > 0)
            for(i=0; i<moreItems.length; i++) curItems.push(moreItems[i]);
          setItems(curItems);
        }   
        setStart(last);
        setLast(last + 8);
      }).catch(() => {

      });
    }

    return(
        <>
        <div 
          style={{
            width:"100%",
            marginLeft : "0",
            marginBottom: "2rem"
          }}
        >          
            <div style={{
                width : "100%",
                position : "relative",
                height : "300px"
            }}>
                {collection && collection.bannerURL !== "" && <img style={{
                position: "absolute",
                width:"100%",
                height:"100%",
                }}
                id="BannerImg" src={`${config.imgUrl}${collection.bannerURL}`} alt="Banner" /> }
                    <div className={styles.logoImg} style={{
                        border:"2px solid rgb(204, 204, 204)", 
                        borderRadius:"50%",
                        width : "10rem",
                        height : "10rem",
                        position: "absolute",
                        left : "50%",
                        top : "100%",
                        marginLeft: "-5rem",
                        marginTop : "-5rem"                
                        }}>
                    <div className={styles.logoImg } >
                        {collection && collection.logoURL !=="" && 
                        <img id="avatarImg"  src={`${config.imgUrl}${collection.logoURL}`} alt="Avatar" /> }
                    </div>
                </div>   
            </div> 
        </div>         
        <div className="container" >
            <div className={styles.collectionName} style={{marginTop: "5rem", textAlign:"center"}}>{collection && collection.name}</div>           
            <div className={styles.createdBy} style={{textAlign:"center"}}>
                {
                    collection && collection.owner &&
                    <>
                        <span>Created by </span>
                        <a href={`/profile/${collection.owner._id}`}>{`${collection.owner.username}`}</a>
                    </>
                }
            </div>           
            <div className={styles.collectionFloorPrice} style={{textAlign:"center"}} >
              {(collection && collection.price) ? 
                 "floor price : "+collection.price+" AVAX" :
                 "floor price : 0 AVAX"
                }
            </div>
            <div className={styles.collectionDescription} style={{textAlign:"center"}} >
              {collection && collection.description}
            </div>
            {
                (items !== undefined && items !== null && items.length>0) ?
                <div align="center">
                    <div id="sliderWrapper" className={styles.list}>
                        <Slider
                            className={cn("discover-slider", styles.slider)}
                            {...settings}
                        >
                            {
                              (items && items.length >0 ) && 
                            items ? items.map((x, index) => (
                            <Card className={styles.card} item={x} key={index} />
                            )) : <></>}                           
                        </Slider>
                    </div>
                    <span style={{ marginTop : "2rem"}} >&nbsp;{viewNoMore === true && "No more items"}&nbsp;</span>
                    <div className={styles.btns} align="center" style={{
                      marginTop : "1rem",
                      marginBottom : "5rem"
                    }}>
                      <button className={cn("button-stroke button-small", styles.btns)} onClick={() => { onLoadMore() }}>
                          <span>Load more</span>
                      </button>
                    </div>
                </div>
                :
                <h3>No items</h3>
            }
        </div>
        </>
    );
}

export default ItemsOfCollection;