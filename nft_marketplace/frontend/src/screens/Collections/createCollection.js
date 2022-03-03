import React, { useEffect, useState } from "react";
import cn from "classnames";
import Icon from "../../components/Icon";
import styles from "./Profile.module.sass";
import styles1 from "./ProfileEdit.module.sass";
import styles2 from "./UploadDetails.module.sass";
import axios from "axios";
import config from "../../config";
import Modal from "../../components/Modal";
import FolowSteps from "./FolowSteps";
import { useHistory } from "react-router-dom";
import TextInput from "../../components/TextInput";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "../../components/Dropdown";
import { setConsideringCollectionId } from "../../store/actions/collection.actions";

const CreateCollection = () => 
{
  
  const categoriesOptions = [
    {value:1, text: "Art"}, 
    {value:2, text: "Game"}, 
    {value:3, text: "Photograph"},
    {value:4, text: "Music"},
    {value:5, text: "video"}];

  const [visible, setVisible] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [logoImg, setLogoImg] = useState("");
  const [bannerImg, setBannerImg] = useState("");
  const [createState, setCreateState] = useState(1);
  const [visibleModal, setVisibleModal] = useState(false);
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [textCategory, setTextCategory] = useState("");
  const [categories, setCategories] = useState(categoriesOptions[0]);
  let history = useHistory(); let dispatch = useDispatch();
  const currentUsr  = useSelector(state=>state.auth.user);
  const [floorPrice, setFloorPrice] = useState(0);

  const changeBanner = (event) => 
  {
    var file = event.target.files[0];
    if(file == null) return;
    console.log(file);
    setSelectedBannerFile(file);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setBannerImg(reader.result);
    };
    reader.onerror = function (error) {
    }
  }

  const changeAvatar = (event) => 
  {
    var file = event.target.files[0];
    if(file == null) return;
    console.log(file);
    setSelectedAvatarFile(file);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setLogoImg(reader.result);
    };
    reader.onerror = function (error) {
    }
    document.getElementById("preSelectSentence").style.display = "none";
  }
  
  const saveCollection = (params) => {
    let newCollectionId = 0;
    axios({
      method: "post",
      url: `${config.baseUrl}collection/`,
      data: params
    })
    .then(function (response) {
      console.log("response.data._id : ", response.data._id);  
      newCollectionId = response.data._id.toString();      

      let isCreatingNewItem = sessionStorage.getItem("isNewItemCreating");
      if(isCreatingNewItem) sessionStorage.setItem("newCollectionId", newCollectionId); 
      
      dispatch(setConsideringCollectionId(newCollectionId));
      setCreateState(0);      
    })
    .catch(function (error) {
      console.log(error);
      setCreateState(2);
    });  
  }

  const navigate2Next = () =>
  { 

    let isCreatingNewItem = sessionStorage.getItem("isNewItemCreating");
    if(isCreatingNewItem === "true")
    {
      let previoueLink = sessionStorage.getItem("previousPageURL");
      history.push(previoueLink);
    }
    else{
      history.push("/");
    }
  }

  const createCollection = async () => {
    setVisibleModal(true);
    if( currentUsr  == null || currentUsr == undefined)
    {
      setCreateState(3);
      console.log("Invalid user :  currentUsr = ", currentUsr);
      return;
    }
    if(selectedAvatarFile == null) 
    {
      const params = {};
      params.collectionName = textName;
      params.collectionLogoURL = logoImg;
      params.collectionBannerURL = bannerImg;
      params.collectionDescription = textDescription;
      params.collectionCategory = categories.value;
      params.price = floorPrice;
      params.owner = currentUsr._id;   
      console.log("collectionCategory = ", categories.value);  
      saveCollection(params);
      return;
    }
    var formData = new FormData();
    formData.append("itemFile", selectedAvatarFile);
    formData.append("authorId", "hch");
    
    const params = {};
    await axios({
      method: "post",
      url: `${config.baseUrl}utils/upload_file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(function (response) {
      params.collectionLogoURL = response.data.path;
    })
    .catch(function (error) {
      console.log(error);
      setCreateState(2);
    });
    
    formData = new FormData();
    formData.append("itemFile", selectedBannerFile);
    formData.append("authorId", "hch");
    await axios({
        method: "post",
        url: `${config.baseUrl}utils/upload_file`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(function (response) {
        params.collectionBannerURL = response.data.path;
        params.collectionName = textName;
        params.collectionDescription = textDescription;
        params.collectionCategory = categories.value;
        params.price = floorPrice;
        params.owner = currentUsr._id;      
        saveCollection(params);
      })
      .catch(function (error) {
        console.log(error);
        setCreateState(2);
      });
  }

  return (
    <div className="container">
      <div style={{paddingTop: "3rem", paddingRight: "3rem"}}>
        <h1>Create a collection</h1>
      </div>
      <div className={styles1.user} style={{
          marginTop:"1rem"
        }}>
        <div className={styles1.details}>
          <div className={styles1.stage}>Logo image</div>
          <div className={styles1.text}>
            This image will also be used for navigation. 350x350 recommend
          </div>
          <div className={styles2.file} style={{border:"3px dashed rgb(204, 204, 204)", borderRadius:"50%", width:"160px", height:"160px"}}>
            <div id="preSelectSentence" style={{position: "absolute"}}>
              <div className={styles2.icon}>
                <Icon name="upload-file" size="24px" />
              </div>
            </div>
            <input className={styles1.load} type="file" onChange={changeAvatar} />
            <div className={styles1.avatar } >
              {logoImg !=="" &&<img id="avatarImg" src={logoImg} alt="Avatar" /> }
            </div>
          </div>      
        </div>    
      </div>      
        <div className={styles1.user} style={{
          marginTop:"1rem"
        }}>
        <div className={styles1.details}>
          <div className={styles1.stage}>Banner image</div>
          <div className={styles1.text}>
            This image will be appear at the top of your collection page. Avoid including too much text 
            in this banner image, as the dimensions change on different devices. 1400x400 recommend.
          </div>
        </div>    
      </div>
      <div className={styles2.item} style={{border:"3px dashed rgb(204, 204, 204)", height:"200px"}}>
        <div className={styles2.file}>
          <div className={styles2.icon}>
            <Icon name="upload-file" size="48px" />
          </div>
          <input className={styles2.load} type="file" onChange={changeBanner}/>
          <div >
            {bannerImg !== "" && <img id="BannerImg" src={bannerImg} alt="Banner" /> }
          </div>
        </div>
      </div>      
      <div className={styles.item}>
        <div className={styles1.stage}>Collection Details</div>
        <div className={styles.fieldset}>
          <TextInput
            className={styles.field}
            label="Name"
            name="name"
            type="text"
            value={textName}
            onChange={(event)=>{
              setTextName(event.target.value);
            }}
            required
          />
          <TextInput
            className={styles.field}
            label="Description"
            name="Description"
            type="text"
            value={textDescription}
            onChange={(event)=>{
              setTextDescription(event.target.value);
            }}
            required
          />                
              <TextInput
                className={styles.field}
                label="Floor price (AVAX)"
                name="price"
                type="number"
                min="0"
                step="0.001"
                value={floorPrice}
                onChange={(event) => {
                  setFloorPrice(event.target.value);
                }}
                placeholder="e. g. 0.01"
                required
              />
          <div  className={styles.field}>
          <div style={{
                marginTop: "12px",
                marginBottom: "12px",
                fontSize: "12px",
                lineHeight: 1,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#B1B5C3"
          }}>Category</div>
            <Dropdown
              className={styles.dropdown}
              value={categories}
              setValue={setCategories}
              options={categoriesOptions}
            />
          </div>
        </div>        
        <div className={styles2.foot} style={{
          marginTop:"1rem",
          marginBottom:"5rem"
        }}>               
          <button
            className={cn("button", styles2.button)}
            onClick={() => createCollection()}
            // type="button" hide after form customization
            type="button"
          >
            <span>Create Collection</span>
            <Icon name="arrow-next" size="10" />
          </button>
        </div>
      </div>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <FolowSteps className={styles2.steps} state={createState} navigate2Next={navigate2Next}/>
      </Modal>
    </div>
  );
};

export default CreateCollection;
