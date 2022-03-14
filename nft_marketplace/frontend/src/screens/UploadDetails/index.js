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
import { singleMintOnSale } from "../../InteractWithSmartContract/interact";
import Checkbox from '@mui/material/Checkbox';
import Alert from "../../components/Alert";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const royaltiesOptions = [{ value: 10, text: "10%" }, { value: 20, text: "20%" }, { value: 30, text: "30%" }];

// const items = [
//   {
//     id: 0,
//     title: "Create collection",
//     color: "#4BC9F0",
//   },
//   {
//     id: 23,
//     title: "Crypto Legend - Professor",
//     color: "#45B26B",
//   },
//   {
//     id: 245,
//     title: "Crypto Legend - Professor",
//     color: "#EF466F",
//   },
//   {
//     id: 342,
//     title: "Legend Photography",
//     color: "#9757D7",
//   },
// ];

const Upload = ({ asset_id = null }) => {
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [textSize, setTextSize] = useState("");
  const [textProperty, setTextProperty] = useState("");
  const [royalties, setRoyalties] = useState(royaltiesOptions[0]);
  const [sale, setSale] = useState(true);
  const [price, setPrice] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const [visibleModal, setVisibleModal] = useState(false);
  const [visiblePreview, setVisiblePreview] = useState(false);
  const [logoImg, setLogoImg] = useState("");
  const [selectedColl, setSelectedColl] = useState({});
  let history = useHistory(); let dispatch = useDispatch();
  const [collectionId, setCollectionId] = useState("");
  const currentUsr = useSelector(state => state.auth.user);
  const collections = useSelector(state => state.collection.list);
  const [colls, setColls] = useState([]);
  const getConsideringCollectionId = useSelector(state => state.collection.consideringId);
  const [instant, setInstant] = useState(false);
  const [period, setPeriod] = useState(7);
  const [collectionName, setCollectionName] = useState("");
  const [metaTemplateFields, setMetaTemplateFields] = useState([]);
  const [metaTemplateValues, setMetaTemplateValues] = useState([]);
  const [checkedFields, setCheckedFields] = useState([]);
  const [metaStr, setMetaStr] = useState("");
  const [alertParam, setAlertParam] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (collections && collections.length > 0) {
      let tempOptions = [];
      collections.map((coll, index) => {
        tempOptions.push({
          value: coll._id,
          text: coll.name
        })
      })
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
        setTextProperty(item.royalty);
        setRoyalties(item.royalty);
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
        return element._id == collectionId
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
  }, [])

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

  const saveItem = (params) => {
    axios({
      method: "post",
      url: `${config.baseUrl}item/create`,
      data: params
    })
      .then(async function (response) {
        console.log("response = ", response);
        if (response.status === 200 && params.isSale !== 0) {
          var aucperiod = (response.data.isSale === 1 ? 0 : response.data.auctionPeriod);
          var price = (response.data.isSale === 1 ? response.data.price : response.data.auctionPrice)
          setProcessing(true);
          try{
            let ret = await singleMintOnSale(
              currentUsr.address,
              response.data._id,
              aucperiod * 24 * 3600,
              price,
              0);
            if (ret.success === true) {
              setProcessing(false);
              console.log("succeed in put on sale");
              setAlertParam({ state: "success", title: "Success", content: "You 've put a new item on sale." });
              setVisibleModal(true);
              return;
            }
            else {
              setProcessing(false);
              console.log("failed in put on sale : ", ret.status);
              setAlertParam({ state: "error", title: "Error", content: "Failed in put on sale." });
              setVisibleModal(true);
              return;
            }
          }catch(err)
          {
            setProcessing(false);
            console.log("multiple uploading error : ", err.message);
          }
        }
        setAlertParam({ state: "success", title: "Success", content: "Uploading succeed." });
        setVisibleModal(true);
      })
      .catch(function (error) {
        console.log(error);
        setAlertParam({ state: "error", title: "Error", content: "Uploading failed." });
        setVisibleModal(true);
      });

  }

  // console.log("getConsideringCollectionId = ", getConsideringCollectionId);

  const createItem = () => {
    if (Object.keys(currentUsr).length === 0) {
      console.log("Invalid account.");
      setAlertParam({ state: "warning", title: "Warning", content: "You have to sign in before creting a item." });
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
        // console.log(response);
        const params = {};
        params.itemName = textName;
        params.itemLogoURL = response.data.path;
        params.itemDescription = textDescription;
        params.itemProperty = textProperty;
        params.itemSize = textSize;
        params.itemRoyalty = royalties.value;
        params.collectionId = collectionId;
        params.creator = currentUsr._id;
        params.owner = currentUsr._id;
        params.isSale = !sale ? 0 : (instant ? 1 : 2);
        if (instant) {
          params.price = !sale ? 0 : price;
          params.auctionPrice = 0;
        } else {
          params.auctionPrice = !sale ? 0 : price;
          params.price = 0;
        }
        params.auctionPeriod = !sale ? 0 : period;
        params.metaData = metaStr;

        saveItem(params);
      })
      .catch(function (error) {
        // console.log("single creation, file uploading error : ", error);
        setAlertParam({ state: "error", title: "Error", content: "Uploading failed." });
        setVisibleModal(true);
      });
  }

  const clearAll = () => {
    document.getElementById("fileInput1").value = "";
    setSelectedFile(null);
    setTextName("");
    setPrice(0);
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

  const onOk = () => {
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
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
                          "PNG, GIF, WEBP, MP4 or MP3. Max 1Gb."
                          :
                          selectedFile.name
                      }
                    </div>
                    <input className={styles.load} type="file" id="fileInput1" onChange={changeFile}
                      accept="image/*, video/*"
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
                        <div className={styles.info}>{instant ? "Instant sale price" : "Auction Sale"}</div>
                        <div className={styles.textForPutSale}>
                          Enter the price for which the item will be sold
                        </div>
                      </div>
                      <Switch className={styles.switch} value={instant} setValue={setInstant} />
                    </div>
                    <div className={styles.table}>
                      <div className={styles.rowForSale}>
                        <input className={styles.inputForSale}
                          type="number" min="0" step="0.001" defaultValue={0}
                          value={price || ""} onChange={(e) => setPrice(e.target.value)} placeholder="Enter your price" />
                        <div className={styles.colForSale} style={{ display: "flex", alignItems: "center" }}>AVAX</div>
                      </div>
                      {
                        !instant ?
                          <div className={styles.rowForSale}>
                            <select className={styles.selectForSale} value={period} onChange={(event) => { setPeriod(event.target.value) }} placeholder="Please select auction time">
                              <option value={0.000694}>1min</option>
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
                      <div className={styles.row} >
                        <div className={styles.col}>Service fee</div>
                        <div className={styles.col}>1.5%</div>
                      </div>
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
            imgSrc={logoImg}
            itemTitle={textName}
            itemPrice={price}
            clearAll={clearAll}
          />
        </div>
      </div>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="OK" onOk={onOk} onCancel={onCancel} />
      </Modal>
      {<Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={processing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>}
    </>
  );
};

export default Upload;
