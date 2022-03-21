import React, { useState, useEffect } from "react";
import cn from "classnames";
import Icon from "../../components/Icon";
import styles from "./Profile.module.sass";
import styles1 from "./ProfileEdit.module.sass";
import styles2 from "./UploadDetails.module.sass";
import axios from "axios";
import config from "../../config";
import Modal from "../../components/Modal";
import { useHistory } from "react-router-dom";
import TextInput from "../../components/TextInput";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "../../components/Dropdown";
import { setConsideringCollectionId } from "../../store/actions/collection.actions";
import MultipleInput from "../../components/MultipleInput";
import Alert from "../../components/Alert";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getValidWallet } from "../../InteractWithSmartContract/interact";

const ColorModeContext = React.createContext({ CollectionSelect: () => { } });

const CreateCollection = () => {
  const categoriesOptions = [
    { value: 1, text: "Art" },
    { value: 2, text: "Game" },
    { value: 3, text: "Photograph" },
    { value: 4, text: "Music" },
    { value: 5, text: "video" }];

  // const [visible, setVisible] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [logoImg, setLogoImg] = useState("");
  const [bannerImg, setBannerImg] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  // const [textCategory, setTextCategory] = useState("");
  const [categories, setCategories] = useState(categoriesOptions[0]);
  let history = useHistory(); let dispatch = useDispatch();
  const currentUsr = useSelector(state => state.auth.user);
  const [floorPrice, setFloorPrice] = useState(0);
  const [metaFieldInput, setMetaFieldInput] = useState("");
  const [metaFields, setMetaFields] = useState([]);
  const [metaFieldDatas, setMetaFieldDatas] = useState([]);
  const [metaArry, setMetaArray] = useState([]);
  const [removeField, setRemoveField] = useState(false);
  const [consideringField, setConsideringField] = useState("");
  const [consideringFieldIndex, setConsideringFieldIndex] = useState(0);
  const [alertParam, setAlertParam] = useState({});

  const [mode, setMode] = React.useState('light');
  const colorMode = React.useContext(ColorModeContext);
  const globalThemeMode = useSelector(state => state.user.themeMode);

  useEffect(() => {
    setMode(globalThemeMode);
  }, [globalThemeMode])

  useEffect(() => {
    let thmode = localStorage.getItem("darkMode");
    if (thmode.toString() === "true") setMode('dark');
    else setMode('light');
  }, [])

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        components: {
          MuiStack: {
            styleOverrides: {
              root: {
                width: '100% !important',
                border: '2px solid #353945',
                borderRadius: '12px'
              }
            }
          }
        }
      }),
    [mode],
  );

  const changeBanner = (event) => {
    var file = event.target.files[0];
    if (file == null) return;
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

  const changeAvatar = (event) => {
    var file = event.target.files[0];
    if (file == null) return;
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
        if (isCreatingNewItem) localStorage.setItem("newCollectionId", newCollectionId);

        dispatch(setConsideringCollectionId(newCollectionId));
        setAlertParam({ state: "success", title: "Success", content: "You 've created a new collection." });
        setVisibleModal(true);
      })
      .catch(function (error) {
        console.log("creating collection error : ", error);
        setAlertParam({ state: "error", title: "Error", content: "Uploading failed" });
        setVisibleModal(true);
      });
  }

  const createCollection = async () => {

    if (currentUsr === null || currentUsr === undefined) {
      console.log("Invalid user :  currentUsr = ", currentUsr);
      setAlertParam({ state: "warning", title: "Warning", content: "Please sign in and try again." });
      setVisibleModal(true);
      return;
    }
    if (selectedAvatarFile === null || selectedBannerFile === null) {
      setAlertParam({ state: "warning", title: "Warning", content: "You have to select banner and avatar." });
      setVisibleModal(true);
      return;
    }
    if (textName === "" ) {
      setAlertParam({ state: "warning", title: "Warning", content: "Collection name can not be empty." });
      setVisibleModal(true);
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
        setAlertParam({ state: "error", title: "Error", content: "Uploading failed." });
        setVisibleModal(true);
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
        params.metaData = metaArry;
        saveCollection(params);
      })
      .catch(function (error) {
        console.log(error);
        setAlertParam({ state: "error", title: "Error", content: "Uploading failed." });
        setVisibleModal(true);
      });
  }

  const setAddMetaField = () => {
    if (metaFieldInput !== "") {
      let mfs = metaFields;
      mfs.push(metaFieldInput);
      setMetaFields(mfs);
      setMetaFieldInput("");
    }
  }

  const onRemoveMetaFieldInput = (index) => {
    let socs1 = [];
    socs1 = metaFields;
    socs1.splice(index, 1);
    setMetaFields(socs1);

    let socs2 = [];
    socs2 = metaFieldDatas;
    socs2.splice(index, 1);
    setMetaFieldDatas(socs2);

    let i;
    let metaFdArry = [];
    for (i = 0; i < socs1.length; i++) {
      if (socs2[i] && socs2[i].length > 0) {
        metaFdArry.push({ key: socs1[i], value: socs2[i]});
      }
    }
    setMetaArray(metaFdArry);

    console.log("metaFdArry = ", metaFdArry);
  }

  const onChangeMetaFieldValue = (data, metaIndex) => {
    // console.log(metaIndex+" : "+data);
    if (data !== "" && data !== undefined) {
      let mfds = metaFieldDatas;
      // mfds[metaIndex] = JSON.stringify(data);
      mfds[metaIndex] = data;
      setMetaFieldDatas(mfds);

      let socs1 = [];
      socs1 = metaFields;
      let socs2 = [];
      socs2 = metaFieldDatas;

      let i;
      let metaFdArry = [];
      for (i = 0; i < socs1.length; i++) {
        if (socs2[i] && socs2[i].length > 0) {
          metaFdArry.push({ key: socs1[i], value: socs2[i] });
        }
      }
      setMetaArray(metaFdArry);

      console.log("metaFdArry = ", metaFdArry);
    }
  }

  const onClickRemoveField = (index) => {
    setRemoveField(false);
    onRemoveMetaFieldInput(index);
  }

  const doRemovingModal = (index, field) => {
    setConsideringFieldIndex(index);
    setConsideringField(field);
    setRemoveField(true);
  }

  const onOk = () => {
    setVisibleModal(false);

    // let isCreatingNewItem = localStorage.getItem("isNewItemCreating");
    // if (isCreatingNewItem === "true") {
    //   let previoueLink = localStorage.getItem("previousPageURL");
    //   history.push(previoueLink);
    // }
    // else {
    //   history.push("/");
    // }
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  // console.log("metaFields = ", metaFields);

  return (
    <div className="container">
      <div style={{ paddingTop: "3rem", paddingRight: "3rem" }}>
        <h1>Create a collection</h1>
      </div>
      <div className={styles1.user} style={{
        marginTop: "1rem"
      }}>
        <div className={styles1.details}>
          <div className={styles1.stage}>Logo image</div>
          <div className={styles1.text}>
            This image will also be used for navigation. 350x350 recommend
          </div>
          <div className={styles2.file} style={{ border: "3px dashed rgb(204, 204, 204)", borderRadius: "50%", width: "160px", height: "160px" }}>
            <div id="preSelectSentence" style={{ position: "absolute" }}>
              <div className={styles2.icon}>
                <Icon name="upload-file" size="24px" />
              </div>
            </div>
            <input className={styles1.load} type="file" onChange={changeAvatar} />
            <div className={styles1.avatar} >
              {logoImg !== "" && <img id="avatarImg" src={logoImg} alt="Avatar" />}
            </div>
          </div>
        </div>
      </div>
      <div className={styles1.user} style={{
        marginTop: "1rem"
      }}>
        <div className={styles1.details}>
          <div className={styles1.stage}>Banner image</div>
          <div className={styles1.text}>
            This image will be appear at the top of your collection page. Avoid including too much text
            in this banner image, as the dimensions change on different devices. 1400x400 recommend.
          </div>
        </div>
      </div>
      <div className={styles2.item} style={{ border: "3px dashed rgb(204, 204, 204)", height: "200px" }}>
        <div className={styles2.file}>
          <div className={styles2.icon}>
            <Icon name="upload-file" size="48px" />
          </div>
          <input className={styles2.load} type="file" onChange={changeBanner} />
          <div >
            {bannerImg !== "" && <img id="BannerImg" src={bannerImg} alt="Banner" />}
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
            onChange={(event) => {
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
            onChange={(event) => {
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
          <div className={styles.field}>
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
          <div className="row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: '14px'
            }}
          >
            <div style={{
              width: "95%"
            }}>
              <TextInput
                className={styles.field}
                label="Metadata"
                // key={index}
                name={metaFieldInput}
                type="text"
                value={metaFieldInput}
                onChange={(e) => setMetaFieldInput(e.target.value)}
              />
            </div>
            <div
              style={{
                width: "20%",
                paddingLeft: "5px",
                paddingTop: '30px'
              }}
            >
              <button
                className={cn("button-stroke button-small", styles.button)}
                onClick={() => setAddMetaField()}
                style={{ width: "100%" }}
              >
                <Icon name="plus-circle" size="16" />
                <span>Add field</span>
              </button>
            </div>
          </div>
          {
            metaFields && metaFields.length > 0 &&
            metaFields.map((field, index) => (
              <div className="row" key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: '14px'
                }}
              >
                <div style={{
                  width: "95%",
                }}>
                  <ColorModeContext.Provider value={colorMode}>
                    <ThemeProvider theme={theme}>
                      <MultipleInput className={styles.multipleInput} label={field} metaIndex={index} onChange={onChangeMetaFieldValue} />
                    </ThemeProvider>
                  </ColorModeContext.Provider>
                </div>
                <div
                  style={{
                    width: "20%",
                    paddingLeft: "10px"
                  }}
                >
                  <button
                    className={cn("button-stroke button-small", styles.button)}
                    onClick={() => doRemovingModal(index, field)}
                    style={{ width: "100%" }}
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
          marginTop: "1rem",
          marginBottom: "5rem"
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
        <Alert className={styles.steps} param={alertParam} okLabel="OK" onOk={onOk} onCancel={onCancel} />
      </Modal>
      <Modal visible={removeField} onClose={() => setRemoveField(false)} >
        <div className={styles.field}>
          Are you going to delete {consideringField} field?
        </div>
        <button className={cn("button", styles.button)}
          style={{
            width: "-webkit-fill-available",
            marginTop: "1rem"
          }}
          onClick={() => onClickRemoveField(consideringFieldIndex)}>
          Yes
        </button>
      </Modal>
    </div>
  );
};

export default CreateCollection;
