import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./UploadDetails.module.sass";
import Dropdown from "../../components/Dropdown";
import Icon from "../../components/Icon";
import TextInput from "../../components/TextInput";
import Switch from "../../components/Switch";
import Preview from "./Preview";
import Modal from "../../components/Modal";
import axios from 'axios';
import config from "../../config";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCollections } from "../../store/actions/collection.actions";
import { getValidWallet, singleMintOnSale } from "../../InteractWithSmartContract/interact";
import Checkbox from '@mui/material/Checkbox';
import Alert from "../../components/Alert";
import FolowSteps from "./FolowSteps";
import { emptyNFTTradingResult } from "../../store/actions/nft.actions";
import isEmpty from "../../utilities/isEmpty";


// const royaltiesOptions = [{ value: 10, text: "10%" }, { value: 20, text: "20%" }, { value: 30, text: "30%" }];

const Upload = ({ asset_id = null }) => {
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [sale, setSale] = useState(true);
  const [price, setPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [visibleModal, setVisibleModal] = useState(false);
  const [visiblePreview, setVisiblePreview] = useState(false);
  const [logoImg, setLogoImg] = useState("");
  const [selectedColl, setSelectedColl] = useState({});
  let history = useHistory(); let dispatch = useDispatch();
  const [collectionId, setCollectionId] = useState("");
  const [colls, setColls] = useState([]);
  const [instant, setInstant] = useState(false);
  const [period, setPeriod] = useState(7);
  const [collectionName, setCollectionName] = useState("");
  const [metaTemplateFields, setMetaTemplateFields] = useState([]);
  const [metaTemplateValues, setMetaTemplateValues] = useState([]);
  const [checkedFields, setCheckedFields] = useState([]);
  const [metaStr, setMetaStr] = useState("");
  const [alertParam, setAlertParam] = useState({});
  const [creatingStep, setCreatingStep] = useState(0);
  const [visibleStepModal, setVisibleStepModal] = useState(false);
  const regularInputTestRegExp = /^([0-9]+([.][0-9]*)?|[.][0-9]+)$/gm;
  
  const currentUsr = useSelector(state => state.auth.user);
  const collections = useSelector(state => state.collection.list);
  const getConsideringCollectionId = useSelector(state => state.collection.consideringId);
  const tradingResult = useSelector(state => state.nft.tradingResult);
  const walletStatus = useSelector(state => state.auth.walletStatus);
  const detailedUserInfo = useSelector(state => state.auth.detail);

  useEffect(() =>{
    //check the current user, if ther user is not exists or not verified, go back to the home
    if(isEmpty(currentUsr) || (!isEmpty(detailedUserInfo) && !isEmpty(detailedUserInfo.verified) &&  detailedUserInfo.verified === false) ) history.push("/")
  }, [])

  useEffect(() => {
    if (collections && collections.length > 0) {
      let tempOptions = [];
      collections.map((coll, index) => (
        tempOptions.push({
          value: coll._id,
          text: coll.name
        })
      ))
      setColls(tempOptions);
    }
  }, [collections]);

  console.log("currentUsr._id = ", currentUsr._id);

  useEffect(() => {
    dispatch(getCollections(90, currentUsr._id))
  }, [dispatch, currentUsr._id]);

  useEffect(() => {
    if (asset_id === 0 || asset_id === null) return;
    console.log("[useEffect] asset_id = ", asset_id);
    axios({
      method: "get",
      url: `${config.baseUrl}item/${asset_id}`,
    })
      .then(function (response) {
        console.log("get", response);
        var item = response.data.data;
        // setItemId(item._id);
        setTextName(item.name);
        setTextDescription(item.description);
        // setTextProperty(item.royalty);
        // setRoyalties(item.royalty);
        setLogoImg(`${config.baseUrl}utils/view_file/${item.logoURL}`);
      })
      .catch(function (error) {
        console.log(error);
      });

  }, [asset_id]);

  const onSelectCollection = (collId) => {
    if (collId !== null && collId !== "") {
      if (collId === 0) {
        //create new collection
        localStorage.setItem("isNewItemCreating", true);
        localStorage.setItem("previousPageURL", "/upload-details/0");
        setVisibleModal(false);
        history.push("/createCollection")
      }
      else {
        //add this new item to selected collection
        setCollectionId(collId);
      }
    }
  }

  useEffect(() => {
    setCollectionId(selectedColl.value);
    setCollectionName(selectedColl.text);
  }, [selectedColl])

  useEffect(() => {
    if (collectionId !== undefined && collections && collections.length > 0) {
      // console.log("collections = ", collections);
      var index = collections.findIndex((element) => {
        return element._id.toString() === collectionId.toString()
      });

      if (collections[index] && collections[index].metaData) {
        let MetaTemplateArry = collections[index].metaData;
        // console.log("MetaTemplateArry = ", MetaTemplateArry);

        let templateFds = []; let i = 0;
        let vals = []; let tempVals = [], tempChecks = [];

        for (i = 0; i < MetaTemplateArry.length; i++) {
          var subValues = MetaTemplateArry[i].value;
          // console.log("typeof subValues = ", typeof subValues);
          let j;
          for (j = 0; j < subValues.length; j++) vals.push({ value: subValues[j], text: subValues[j] });
          templateFds.push({ index: i, key: MetaTemplateArry[i].key, values: vals });
          vals = [];
          tempVals.push("");
          tempChecks.push(true);
        }

        // console.log("templateFds = ", templateFds);

        setMetaTemplateFields(templateFds);
        setMetaTemplateValues(tempVals);
        setCheckedFields(tempChecks);
      }
    }
  }, [collectionId, collections]);

  useEffect(() => {
    let flag = "";
    flag = localStorage.getItem("isNewItemCreating");
    console.log("flag : ", flag)
    if (flag) {
      setCollectionId(getConsideringCollectionId);
      localStorage.removeItem("isNewItemCreating");
    }
  }, [getConsideringCollectionId])

  const changeFile = (event) => {
    var file = event.target.files[0];
    if (file == null) return;
    console.log(file);
    setSelectedFile(file);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setLogoImg(reader.result);
    };
    reader.onerror = function (error) {
    }
  }

  useEffect(() =>
  {
    if(tradingResult)
    {
      switch(tradingResult.function)
      {
        default : 
          break;
        case "singleMintOnSale":
          dispatch(emptyNFTTradingResult());
          break;
      }
    }
  }, [tradingResult, dispatch])

  const saveItem = (params) => {
    setCreatingStep(4);
    axios({
      method: "post",
      url: `${config.baseUrl}item/create`,
      data: params
    })
      .then(async function (response) {
        console.log("response = ", response);
        if (response.status === 200) 
        {
          setCreatingStep(5);
          if (sale > 0) 
          {
            var aucperiod = (instant === true ? 0 : response.data.auctionPeriod);
            var price = response.data.price;
            setCreatingStep(7);
            try {
              let ret = await singleMintOnSale(
                currentUsr.address,
                response.data._id,
                aucperiod * 24 * 3600,
                price,
                0);
              if (ret.success === true) {
                console.log("succeed in put on sale");
                setCreatingStep(8);
              }
              else {
                setCreatingStep(9);
                console.log("failed in put on sale : ", ret.message);
                return;
              }
            } catch (err) {              
              setCreatingStep(9);
              console.log("multiple uploading error : ", err.message);
            }
          }
        }else { 
          setCreatingStep(6);
          if(sale>0) setCreatingStep(9);
        }
      })
      .catch(function (error) {
        console.log(error);
          setCreatingStep(6);
          if(sale>0) setCreatingStep(9);
      });

  }

  // console.log("getConsideringCollectionId = ", getConsideringCollectionId);

  const createItem = async () => {
    if(sale)
    {      
      if (Number(price) < 0.00001 || isNaN(price)) {
        setAlertParam({ state: "error", title: "Error", content: "Invalid price. Price must be equal or higher than 0.00001" });
        setVisibleModal(true);
        return;
      }else{
        setPrice(Number(price))
      }
    }
    if(instant === true)
    {    
      if(walletStatus === false )
      {
        setAlertParam( {state: "warning", title:"Warning", content: "Please connect and unlock your wallet." } );      
        setVisibleModal( true );
        return;
      }
    }
    if (Object.keys(currentUsr).length === 0) {
      console.log("Invalid account.");
      setAlertParam({ state: "warning", title: "Warning", content: "You have to sign in before doing a trading." });
      setVisibleModal(true);
      return;
    }
    if (collectionId === 0 || collectionId === undefined || collectionId === null) {
      console.log("Invalid collection id.");
      setAlertParam({ state: "warning", title: "Warning", content: "You have to select a collection." });
      setVisibleModal(true);
      return;
    }
    if (selectedFile == null) {
      console.log("Invalid file.");
      setAlertParam({ state: "warning", title: "Warning", content: "Image is not selected." });
      setVisibleModal(true);
      return;
    }
    if (textName === "") {
      setAlertParam({ state: "error", title: "Error", content: "Item name cannot be empty." });
      setVisibleModal(true);
      return;
    }
    setVisibleStepModal(true);
    setCreatingStep(1);
    const formData = new FormData();
    formData.append("itemFile", selectedFile);
    formData.append("authorId", "hch");
    formData.append("collectionName", collectionName);
    console.log(selectedFile);

    axios({
      method: "post",
      url: `${config.baseUrl}utils/upload_file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        setCreatingStep(2);
        // console.log(response);
        const params = {};
        params.itemName = textName;
        params.itemLogoURL = response.data.path;
        params.itemDescription = textDescription;
        // params.itemProperty = textProperty;
        // params.itemSize = textSize;
        // params.itemRoyalty = royalties.value;
        params.collectionId = collectionId;
        params.creator = currentUsr._id;
        params.owner = currentUsr._id;
        params.isSale = 0;
        params.price = !sale ? 0 : Number(price);
        params.auctionPeriod = !sale ? 0 : period;
        params.metaData = metaStr;

        saveItem(params);
      })
      .catch(function (error) {
        // console.log("single creation, file uploading error : ", error);
        // setAlertParam({ state: "error", title: "Error", content: "Uploading failed." });
        // setVisibleModal(true);
        setCreatingStep(3); 
        setCreatingStep(6); 
      });
  }

  const clearAll = () => {
    document.getElementById("fileInput1").value = "";
    setSelectedFile(null);
    setTextName("");
    setPrice(0);
    setLogoImg("");
  }

  const setSelectedMetaValue = (x, index) => {
    let valsforDisplay = metaTemplateValues;
    valsforDisplay[index] = x;
    setMetaTemplateValues(valsforDisplay);

    var list = [];
    for (var i = 0; i < checkedFields.length; i++) {
      if (checkedFields[i] === true) {
        var temp = {}
        temp[metaTemplateFields[i].key] = valsforDisplay[i].value;
        list.push(JSON.stringify(temp));
      }
    }
    setMetaStr(list.toString());
  }

  const handleCheckFieldChange = (event, index) => {

    // console.log(event.target.checked)

    let chFields = checkedFields;
    chFields[index] = event.target.checked;
    setCheckedFields(chFields);

    var list = [];
    for (var i = 0; i < chFields.length; i++) {
      if (chFields[i] === true) {
        var temp = {}
        temp[metaTemplateFields[i].key] = metaTemplateValues[i].value;
        list.push(JSON.stringify(temp));
      }
    }
    setMetaStr(list.toString());
  };

  const go2Collection = () =>
  {
    setVisibleStepModal(false);
    history.push(`/collectionItems/${collectionId}`)
  }

  const onOk = () => {
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
    setVisibleStepModal(false);
  }

  const onChangePrice = (e) =>
  {
    var inputedPrice = e.target.value;    
    if(inputedPrice !== "") 
    {
      let m; let correct = false;
      while ((m = regularInputTestRegExp.exec(inputedPrice)) !== null) 
      {
        if (m.index === regularInputTestRegExp.lastIndex) {
          regularInputTestRegExp.lastIndex++;
        }
        if(m[0] === inputedPrice) 
        {
          correct = true;
        }         
      }      
      if(!correct)         
      {
        return;
      }
    }        
    if(isNaN(inputedPrice))
    {
      return;
    }
    setPrice(inputedPrice);
  }

  return (
    <>
      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.wrapper}>
            <div className={styles.head}>
              <div className={cn("h2", styles.title)}>
                Create single item
              </div>
              <button
                className={cn("button-stroke button-small", styles.button)}
                onClick={() => history.push("/upload-multiple/0")}
              >
                Switch to Multiple
              </button>
            </div>
            <form className={styles.form} action="">
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>Upload file</div>
                  <div className={styles.note}>
                    Drag or choose your file to upload
                  </div>
                  <div className={styles.file}>
                    <div className={styles.icon}>
                      <Icon name="upload-file" size="24" />
                    </div>
                    <div className={styles.format}>
                      {
                        !selectedFile ?
                          "PNG, GIF, JPEG, WEBP. Max 100MB."
                          :
                          selectedFile.name
                      }
                    </div>
                    <input className={styles.load} type="file" id="fileInput1" onChange={changeFile}
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.category}>Item Details</div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      label="Item name"
                      name="Item"
                      type="text"
                      value={textName}
                      onChange={(event) => {
                        setTextName(event.target.value);
                      }}
                      placeholder='e. g. Redeemable Bitcoin Card with logo"'
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Description"
                      name="Description"
                      type="text"
                      placeholder="e. g. “After purchasing you will able to recived the logo...”"
                      value={textDescription}
                      onChange={(event) => {
                        setTextDescription(event.target.value);
                      }}
                      required
                    />
                    {/* <div className={styles.row}>
                      <div className={styles.col}>
                        <div className={styles.field}>
                          <div className={styles.label} style={{ marginTop: "12px" }}>Royalties</div>
                          <Dropdown
                            className={styles.dropdown}
                            value={royalties}
                            setValue={setRoyalties}
                            options={royaltiesOptions}
                          />
                        </div>
                      </div>
                      <div className={styles.col}>
                        <TextInput
                          className={styles.field}
                          label="Size"
                          name="Size"
                          type="number"
                          value={textSize}
                          onChange={(event) => {
                            setTextSize(event.target.value);
                          }}
                          placeholder="e. g. Size"
                          required
                        />
                      </div>
                      <div className={styles.col}>
                        <TextInput
                          className={styles.field}
                          label="Propertie"
                          name="Propertie"
                          type="text"
                          value={textProperty}
                          onChange={(event) => {
                            setTextProperty(event.target.value);
                          }}
                          placeholder="e. g. Propertie"
                          required
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className={styles.options}>
                <div className={styles.category}>Choose collection</div>
                <div className={styles.text}>
                  Choose an exiting collection or create a new one
                </div>
                <div className="row" style={{ display: "flex" }}>
                  <div style={{ flex: 1 }}>
                    <Dropdown
                      className={styles.dropdown}
                      value={selectedColl}
                      setValue={setSelectedColl}
                      options={colls}
                    />
                  </div>
                  <button
                    className={cn("button-stroke", styles.button)}
                    onClick={() => onSelectCollection(0)}
                  >
                    New Collection
                  </button>
                </div>
                {
                  metaTemplateFields && metaTemplateFields.length > 0 &&
                  metaTemplateFields.map((metaField, index) => (
                    <div className="row" key={index} style={{ marginTop: "1rem" }} >
                      <div >
                        <Checkbox
                          checked={checkedFields[index]}
                          onChange={(e) => handleCheckFieldChange(e, index)}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                        {metaField.key}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Dropdown
                          className={styles.dropdown}
                          value={metaTemplateValues[index]}
                          setValue={(x) => { setSelectedMetaValue(x, index) }}
                          options={metaTemplateFields[index].values}
                        />
                      </div>
                    </div>
                  ))
                }
                <div className={styles.option} style={{ marginTop: "2rem" }}>
                  <div className={styles.box}>
                    <div className={styles.category}>Put on sale</div>
                    <div className={styles.text}>
                      You'll receive bids on this item
                    </div>
                  </div>
                  <Switch value={sale} setValue={setSale} />
                </div>
                {
                  sale &&
                  <>
                    <div className={styles.line}>
                      <div className={styles.iconForPutSale}>
                        <Icon name="coin" size="24" />
                      </div>
                      <div className={styles.details}>
                        <div className={styles.info}>{instant ? "Instant sale" : "Auction Sale"}</div>
                        <div className={styles.textForPutSale}>
                          Enter the price for which the item will be sold
                        </div>
                      </div>
                      <Switch className={styles.switch} value={instant} setValue={setInstant} />
                    </div>
                    <div className={styles.table}>
                      <div className={styles.rowForSale}>
                        <input className={styles.inputForSale}
                          type="text" value={price || ""} onChange={(e) => onChangePrice(e)} placeholder="Enter your price" />
                        <div className={styles.colForSale} style={{ display: "flex", alignItems: "center" }}>AVAX</div>
                      </div>
                      {
                        !instant ?
                          <div className={styles.rowForSale}>
                            <select className={styles.selectForSale} value={period} onChange={(event) => { setPeriod(event.target.value) }} placeholder="Please select auction time">
                              <option calssName={styles.inputForSale} value={0.000694}>1min</option>
                              <option value={0.00347}>5min</option>
                              <option value={0.00694}>10min</option>
                              <option value={7}>7 days</option>
                              <option value={10}>10 days</option>
                              <option value={30}>1 month</option>
                            </select>
                          </div>
                          :
                          <></>
                      }
                      {/* <div className={styles.row} >
                        <div className={styles.col}>Service fee</div>
                        <div className={styles.col}>1.5%</div>
                      </div> */}
                    </div>
                  </>
                }
                {/* <div className={styles.option}>
                  <div className={styles.box}>
                    <div className={styles.category}>Unlock once purchased</div>
                    <div className={styles.text}>
                      Content will be unlocked after successful transaction
                    </div>
                  </div>
                  <Switch value={locking} setValue={setLocking} />
                </div> */}
                {/* <Cards items={collections} onSelectCollection={onSelectCollection}/> */}
              </div>
              <div className={styles.foot}>
                <button
                  className={cn("button-stroke tablet-show", styles.button)}
                  onClick={() => setVisiblePreview(true)}
                  type="button"
                >
                  Preview
                </button>
                <button
                  className={cn("button", styles.button)}
                  onClick={() => createItem()}
                  // type="button" hide after form customization
                  type="button"
                >
                  <span>Create item</span>
                  <Icon name="arrow-next" size="10" />
                </button>
              </div>
            </form>
          </div>
          <Preview
            className={cn(styles.preview, { [styles.active]: visiblePreview })}
            onClose={() => setVisiblePreview(false)}
            imgSrc={logoImg ? logoImg : "/images/content/blank.png"}
            itemTitle={textName}
            itemPrice={price}
            clearAll={clearAll}
          />
        </div>
      </div>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="OK" onOk={onOk} onCancel={onCancel} />
      </Modal>
      <Modal visible={visibleStepModal} onClose={() => {} } showClose={false} >
        <FolowSteps className={styles.steps} state={creatingStep} sale={sale} navigate2Next={go2Collection} onClose={onCancel}/>
      </Modal>
    </>
  );
};

export default Upload;
