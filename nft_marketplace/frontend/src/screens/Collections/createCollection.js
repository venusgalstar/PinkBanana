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
import MultipleInput from "../../components/MultipleInput";

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
  const [metaFieldInput, setMetaFieldInput] = useState("");
  const [metaFields, setMetaFields] = useState([]);
  const [metaFieldDatas, setMetaFieldDatas] = useState([]);
  const [metaString, setMetaSting] = useState("");
  const [removeField, setRemoveField] = useState(false);
  const [consideringField, setConsideringField] = useState("");
  const [consideringFieldIndex, setConsideringFieldIndex] = useState(0);

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
      newCollectionId = response.data._id;      

      let isCreatingNewItem = localStorage.getItem("isNewItemCreating");
      if(isCreatingNewItem) localStorage.setItem("newCollectionId", newCollectionId); 
      
      dispatch(setConsideringCollectionId(newCollectionId));
      setCreateState(0);      
    })
    .catch(function (error) {
      console.log(error);
      //setCreateState(2);
    });  
  }

  const navigate2Next = () =>
  { 

    let isCreatingNewItem = localStorage.getItem("isNewItemCreating");
    if(isCreatingNewItem === "true")
    {
      let previoueLink = localStorage.getItem("previousPageURL");
      history.push(previoueLink);
    }
    else{
      history.push("/");
    }
  }

  const createCollection = async () => {
    setVisibleModal(true);
    if( currentUsr  == null || currentUsr == undefined || selectedAvatarFile == null)
    {
      setCreateState(3);
      console.log("Invalid user :  currentUsr = ", currentUsr);
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
        params.metaData = metaString;   
        saveCollection(params);
      })
      .catch(function (error) {
        console.log(error);
        setCreateState(2);
      });
  }

  const setAddMetaField  = () =>
  {
    let mfs = metaFields;
    mfs.push(metaFieldInput);
    setMetaFields(mfs);
    setMetaFieldInput("");

  }

  const onRemoveMetaFieldInput = (index) =>
  {
    let socs1 = [];
    socs1 = metaFields;
    socs1.splice(index, 1);
    setMetaFields(socs1);

    let socs2 = [];
    socs2 = metaFieldDatas;
    socs2.splice(index, 1);
    setMetaFieldDatas(socs2);

    let i; let metaStr = "{";
    for(i=0; i<socs1.length; i++) 
    {
      if(i === socs1.length - 1) metaStr += "\""+socs1[i] + "\" : " + socs2[i]+"}";
      else metaStr += "\""+socs1[i] + "\" : " + socs2[i] + ", ";
    }
    setMetaSting(metaStr);

    console.log("metaStr = ", metaStr);
  } 

  const onChangeMetaFieldValue = (data, metaIndex) =>
  {
    // console.log(metaIndex+" : "+data);
    if(data !=="" && data !== undefined)
    {
      let mfds = metaFieldDatas;
      mfds[metaIndex] = JSON.stringify(data);
      setMetaFieldDatas(mfds);
            
      let socs1 = [];
      socs1 = metaFields;
      let socs2 = [];
      socs2 = metaFieldDatas;

      let i; let metaStr = "{";
      for(i=0; i<socs1.length; i++) 
      {
        if(i === socs1.length - 1) metaStr += "\""+socs1[i] + "\" : " + socs2[i]+"}";
        else metaStr += "\""+socs1[i] + "\" : " + socs2[i] + ", ";
      }
      setMetaSting(metaStr);

      console.log("metaStr = ", metaStr);
    }
  }

  const onClickRemoveField = (index) =>
  {
    setRemoveField(false);
    onRemoveMetaFieldInput(index);
  }

  const doRemovingModal = (index, field) => 
  {
    setConsideringFieldIndex(index);
    setConsideringField(field);
    setRemoveField(true);
  }
  
  // console.log("metaFields = ", metaFields);

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
          <div className="row">     
            <div style={{
              width: "80%",
              display: "inline-block"
            }}>
              <TextInput
                className={styles.field}
                label="Input new name of metadata"
                // key={index}
                name={metaFieldInput}
                type="text"
                value={metaFieldInput}
                onChange={(e) => setMetaFieldInput(e.target.value)}
              />                  
            </div>
            <div 
              style={{
                width: "10%",
                display: "inline",
                paddingLeft: "5px"
              }}
            >         
             <button
              className={cn("button-stroke button-small", styles.button)}
              onClick = {() => setAddMetaField()}
            >
              <Icon name="plus-circle" size="16" />
              <span>Add field</span>
            </button>         
            </div>          
          </div>
          {
            metaFields && metaFields.length > 0 && 
            metaFields.map((field, index) =>(
              <div className="row" key={index}>     
                <div style={{
                  width: "70%",
                  display: "inline-block"
                }}> 
                  <MultipleInput label={field} metaIndex={index} onChange={onChangeMetaFieldValue}/>           
                </div>
                <div 
                  style={{
                    width: "20%",
                    display: "inline",
                    paddingLeft: "5px"
                  }}
                >         
                  <button
                  className={cn("button-stroke button-small", styles.button)}
                  onClick = {() => doRemovingModal(index, field)}
                >
                  <Icon name="close-circle" size="16" />
                  <span>Remove field</span>
                </button>         
                </div>          
              </div>
            ))
          }
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
      <Modal visible={removeField} onClose={() => setRemoveField(false)} >               
        <div className={styles.field}>
          Are you going to delete {consideringField} field?
        </div>
        <button  className={cn("button", styles.button)} 
          style={{
            width: "-webkit-fill-available",
            marginTop: "1rem"
          }} 
          onClick={()=>onClickRemoveField(consideringFieldIndex)}>
          Add
        </button>
      </Modal>
    </div>
  );
};

export default CreateCollection;
