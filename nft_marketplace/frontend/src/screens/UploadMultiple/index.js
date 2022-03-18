import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./UploadDetails.module.sass";
import Dropdown from "../../components/Dropdown";
import Icon from "../../components/Icon";
import TextInput from "../../components/TextInput";
import Switch from "../../components/Switch";
import Modal from "../../components/Modal";
import Preview from "./Preview";
import axios from 'axios';
import config from "../../config";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCollections } from "../../store/actions/collection.actions";
import { batchMintOnSale, getValidWallet } from "../../InteractWithSmartContract/interact";
import Checkbox from '@mui/material/Checkbox';
import Alert from "../../components/Alert";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

// const royaltiesOptions = [{ value: 10, text: "10%" }, { value: 20, text: "20%" }, { value: 30, text: "30%" }];

const Upload = ({ asset_id = null }) => {
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  // const [textSize, setTextSize] = useState("");
  // const [textProperty, setTextProperty] = useState("");
  // const [royalties, setRoyalties] = useState(royaltiesOptions[0]);
  const [sale, setSale] = useState(true);
  const [price, setPrice] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const [visibleModal, setVisibleModal] = useState(false);
  const [visiblePreview, setVisiblePreview] = useState(false);
  const [logoImg, setLogoImg] = useState("");
  const [sel_files, setSelFiles] = useState([]);
  const [collectionId, setCollectionId] = useState("");
  const [selectedColl, setSelectedColl] = useState({});
  let history = useHistory(); let dispatch = useDispatch();
  const currentUsr = useSelector(state => state.auth.user);
  const collections = useSelector(state => state.collection.list);
  const getConsideringCollectionId = useSelector(state => state.collection.consideringId);
  const [instant, setInstant] = useState(false);
  const [period, setPeriod] = useState(7);
  const [colls, setColls] = useState([]);
  const [collectionName, setCollectionName] = useState("");
  const [metaTemplateFields, setMetaTemplateFields] = useState([]);
  const [metaTemplateValues, setMetaTemplateValues] = useState([]);
  const [checkedFields, setCheckedFields] = useState([]);
  const [metaStr, setMetaStr] = useState("");
  const [alertParam, setAlertParam] = useState({});
  const [processing, setProcessing] = useState(false);
  const MAXMUM_UPLOAD = 100;

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
        localStorage.setItem("isNewItemCreating", "true");
        localStorage.setItem("previousPageURL", "/upload-multiple/0");
        setVisibleModal(false)
        history.push("/createCollection")
      }
      else if (collId > 0) {
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
        // console.log("meataDataTemplate = ", strMetaTemplate);

        let templateFds = []; let i = 0;
        let vals = []; let tempVals = [], tempChecks = [];

        for (i = 0; i < MetaTemplateArry.length; i++) {
          var subValues = MetaTemplateArry[i].value;
          let j;
          for (j = 0; j < subValues.length; j++) vals.push({ value: subValues[j], text: subValues[j] });
          templateFds.push({ index: i, key: MetaTemplateArry[i].key, values: vals });
          vals = [];
          tempVals.push("");
          tempChecks.push(true);
        }

        console.log("templateFds = ", templateFds);

        setMetaTemplateFields(templateFds);
        setMetaTemplateValues(tempVals);
        setCheckedFields(tempChecks);
      }
    }
  }, [collectionId, collections]);

  useEffect(() => {
    let flag = "";
    flag = localStorage.getItem("isNewItemCreating");
    if (flag) {
      setCollectionId(getConsideringCollectionId);
      localStorage.removeItem("isNewItemCreating");
    }
  }, [getConsideringCollectionId])

  const changeFile = (event) => {
    var file = event.target.files[0];
    if (file == null) return;
    console.log(file);
    if (event.target.files.length > MAXMUM_UPLOAD) {
      setAlertParam({ state: "warning", title: "Warning", content: `You can not upload more than ${MAXMUM_UPLOAD} files at once.` });
      setVisibleModal(true);
      return;
    }
    setSelFiles([...event.target.files]);
    setSelectedFile(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setLogoImg(reader.result);
    };
    reader.onerror = function (error) {
    }
  }

  const saveMultipleItem = (params, paths) => {
    let names = []; let i;
    for (i = 0; i < paths.length; i++)
      names.push(textName + " #" + `${i + 1}`.padStart(3, 0));
    axios({
      method: "post",
      url: `${config.baseUrl}item/multiple_create`,
      data: { params, names, paths }
    })
      .then(async function (response) {
        console.log("response = ", response);
        if (response.status === 200) 
        {
          if (params.isSale !== 0) 
          {
            var aucperiod = (params.isSale === 1 ? 0 : params.auctionPeriod);
            var price = (params.isSale === 1 ? params.price : params.auctionPrice);
            setProcessing(true);
            try {
              let ret = await batchMintOnSale(
                currentUsr.address,
                response.data,
                aucperiod * 24 * 3600,
                price,
                0);
              if (ret.success === true) {
                setProcessing(false);
                console.log("succeed in put on sale");
                // setAlertParam({ state: "success", title: "Success", content: "You 've put new items on sale." });
                setVisibleModal(false);
                history.push(`/collectionItems/${params.collectionId}`)
                return;
              }
              else {
                setProcessing(false);
                setAlertParam({ state: "error", title: "Error", content: "You've succed on creting items, but failed in put on sale." });
                setVisibleModal(true);
                console.log("failed in put on sale : ", ret.status);
                return;
              }
            } catch (err) {
              setProcessing(false);
              console.log("multiple uploading error : ", err.message);
            }
          } else {
            setAlertParam({ state: "success", title: "Success", content: "You 've created multiple items." });
            setVisibleModal(true);
            history.push(`/collectionItems/${params.collectionId}`)
          }
        }
      })
      .catch(function (error) {
        console.log("multiple uploading error : ", error);
        setAlertParam({ state: "error", title: "Error", content: "Uploading failed." });
        setVisibleModal(true);
      });
  }

  const createItem = async () => {
    if(sale)
    {      
      if (price <= 0) {
        setAlertParam({ state: "error", title: "Error", content: "Invalid price." });
        setVisibleModal(true);
        return;
      }
    }
    if(instant === true)
    {    
      let connection = await getValidWallet();
      if(connection.address === "")
      {
        setAlertParam( {state: "info", title:"Information", content:"No connected wallet. You should consider trying MetaMask!"} );      
        setVisibleModal( true );
        return;
      }
    }
    // console.log("currentUser = ", currentUsr);
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
    if (selectedFile === null) {
      console.log("Invalid file.");
      setAlertParam({ state: "warning", title: "Warning", content: "Image is not selected." });
      setVisibleModal(true);
      return;
    }

    if (sel_files.length > 0 && sel_files.length <= MAXMUM_UPLOAD) {
      console.log("sel_files = ", sel_files);
      var formData = new FormData();

      for (var i = 0; i < sel_files.length; i++) {
        formData.append("fileItem" + i.toString(), sel_files[i]);
      }

      formData.append("fileArryLength", sel_files.length);
      formData.append("collectionName", collectionName);
      console.log("uploading multiple files...:", formData);

      axios({
        method: "post",
        url: `${config.baseUrl}utils/upload_multiple_file`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(function (response) {
          console.log("Mutiple upload response : ", response.data.paths);
          let params = {};
          if (textName === "") {
            setAlertParam({ state: "error", title: "Error", content: "Item name cannot be empty." });
            setVisibleModal(true);
            return;
          }
          params.itemLogoURL = response.data.path;
          params.itemDescription = textDescription;
          // params.itemProperty = textProperty;
          // params.itemSize = textSize;
          // params.itemRoyalty = royalties.value;
          params.collectionId = collectionId;
          params.creator = currentUsr._id;
          params.owner = currentUsr._id;
          params.isSale = !sale ? 0 : (instant ? 1 : 2);
          if (instant) {
            params.price = !sale ? 0 : Number(price);
            params.auctionPrice = 0;
          } else {
            params.auctionPrice = !sale ? 0 : Number(price);
            params.price = 0;
          }
          params.auctionPeriod = !sale ? 0 : period;
          params.metaData = metaStr;
          saveMultipleItem(params, response.data.paths);
        })
        .catch((err) => {
          // console.log("mutiple creation, file uploading error : ", err);
          setAlertParam({ state: "error", title: "Error", content: "Uploading failed." });
          setVisibleModal(true);
        });
    }
  }

  const clearAll = () => {
    setSelectedFile(null);
    setTextName("");
    setPrice(0);
    setSelFiles([]);
    setLogoImg("");
    document.getElementById("fileInput1").value = "";
  }

  const setSelectedMetaValue = (x, index) => {
    // console.log(x);

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
                Create multiple items
              </div>
              <button
                className={cn("button-stroke button-small", styles.button)}
                onClick={() => history.push("/upload-details/0")}
              >
                "Switch to Single"
              </button>
            </div>
            <form className={styles.form} action="">
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>Upload files</div>
                  <div className={styles.note}>
                    Drag or choose your file to upload
                  </div>
                  <div className={styles.file}>
                    <div className={styles.icon}>
                      <Icon name="upload-file" size="24" />
                    </div>
                    <div className={styles.format}>
                      {
                        sel_files.length > 0 ?
                          `You selected ${sel_files.length} files.`
                          :
                          "PNG, GIF, JPEG, WEBP. Max 100MB."
                      }
                    </div>
                    <input className={styles.load} type="file" id="fileInput1" name="file[]" onChange={changeFile}
                      accept="image/*" multiple
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
                <div className={styles.category} >Choose collection</div>
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
                          type="number" min="0" step="0.001"
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
                          : <></>
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
