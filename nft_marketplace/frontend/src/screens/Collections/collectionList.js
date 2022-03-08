import React, { useEffect } from "react";
import styles from "./Profile.module.sass";
import { useDispatch, useSelector } from "react-redux";
import Cards from "./CollectionCards";
import { getCollections } from "../../store/actions/collection.actions";
import { setConsideringCollectionId } from "../../store/actions/collection.actions";
import { useHistory } from "react-router-dom";
import cn from "classnames";

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
            <Cards className={styles.cards} items={collections} onSelectCollection={onSelectCollection}/>
        }
        <div style={{marginBottom:"5rem"}}><span>&nbsp;&nbsp;</span></div>
    </div>
  );
};

export default CollectionList;
