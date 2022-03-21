import React, { useEffect, useState } from "react";
import cn from "classnames";
import styles from "./ProfileEdit.module.sass";
import Control from "../../components/Control";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import Icon from "../../components/Icon";
import axios from "axios";
import config from "../../config";
import Modal from "../../components/Modal";
// import FolowSteps from "./FolowSteps";
import { useHistory } from "react-router-dom";
import { authSet } from "../../store/actions/auth.actions";
import { useDispatch, useSelector } from 'react-redux';
import jwt_decode from "jwt-decode";
import { getValidWallet, signString } from "../../InteractWithSmartContract/interact";
import Dropdown from "../../components/Dropdown";
import { useParams } from "react-router-dom";
import { getDetailedUserInfo } from "../../store/actions/auth.actions";
import Alert from "../../components/Alert";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Edit Profile",
  },
];


const socialTypes = [
  { value: 1, text: "Email" },
  { value: 2, text: "Discord" },
  { value: 3, text: "Phone" },
  { value: 4, text: "Twitter" }
];

const ProfileEdit = () => {

  const [logoImg, setLogoImg] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [nameText, setNameText] = useState("");
  const [websiteText, setWebsiteText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [address, setAddress] = useState("");
  const [twitterText, setTwitterText] = useState("");
  const [bioText, setBioText] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  let history = useHistory();
  let dispatch = useDispatch();
  const [addSocial, setAddSocial] = useState(false);
  const [socialAccount, setSocialAccount] = useState("");
  const [socialType, setSocialType] = useState(socialTypes[0]);
  // const [socialType, setSocialType] = useState("");
  const [socials, setSocials] = useState("");
  const { userId } = useParams();  //taget_id in making follow
  const [saveMode, setSaveMode] = useState(0); //0: new, 1: update
  const [socialInputs, setSocialInputs] = useState([]);
  const [alertParam, setAlertParam] = useState({});
  const regexForWebsite = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;
  const regexForWallet = /^(0x[a-fA-F0-9]{40})$/gm;

  const currentWalletAddress = useSelector(state => state.auth.currentWallet);
  const walletStatus = useSelector(state => state.auth.walletStatus);
  const detailedUserInfo = useSelector(state => state.auth.detail);



  useEffect(() => {
    if (userId !== "new") {
      setSaveMode(1);
      dispatch(getDetailedUserInfo(userId));
    }
    else {
      setSaveMode(0);
    }
  }, [userId])

  useEffect(() => {
    if (userId !== "new" && detailedUserInfo) {
      setAddress(detailedUserInfo.address);
      setLogoImg(config.imgUrl + detailedUserInfo.avatar)
      setNameText(detailedUserInfo.username);
      setUrlText(detailedUserInfo.customURL);
      setWebsiteText(detailedUserInfo.websiteURL);
      setTwitterText(detailedUserInfo.twitter);
      setBioText(detailedUserInfo.userBio);
      setSocials(detailedUserInfo.socials);
      // console.log("[in the useEffect] address = " , detailedUserInfo.address);
    } else {
      setAddress(currentWalletAddress);
    }
  }, [detailedUserInfo])

  // console.log("[out of useEffect] currentUsr = " , currentUsr);
  // console.log("[out of useEffect] address = " , currentUsr.address);

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
  }

  const doLogin = (address, password) => 
  {
    const params = {};
    params.address = address;
    params.password = password;
    Login(params);
  }

  const Login = (params) => 
  {
    axios({
      method: "post",
      url: `${config.baseUrl}users/login`,
      data: params
    })
      .then(function (response) {
        console.log("edit profile resonse : " , response);
        if (response.data.success === true) {
          //set the token to sessionStroage   
          const token = response.data.token;
          localStorage.setItem("jwtToken", response.data.token);
          const decoded = jwt_decode(token);
          console.log("edit profile token decodec :", decoded);
          dispatch(authSet(decoded._doc));
          if(decoded.id) dispatch(getDetailedUserInfo(decoded.id))
          history.push("/");
        }
      })
      .catch(function (error) {
        console.log(error);
        setAlertParam({ state: "error", title: "Error", content: "You 've failed in registering. "+error.message });
        setVisibleModal(true);
      });
  }

  useEffect(() =>
  {
    if(currentWalletAddress) setAddress(currentWalletAddress);
  }, [currentWalletAddress])

  const saveUser = async (params) => {
    let signingResult = "";
    signingResult = await signString(address);
    if (signingResult.success === true) 
    {
      params.password = signingResult.message;
      if (saveMode === 0) {
        await axios({
          method: "post",
          url: `${config.baseUrl}users/create`,
          data: params
        })
          .then(function (response) {
            console.log("response", response);            
            if(response.data.code === 1) 
            {
              let errMsg = "";
              errMsg = "Address is duplicated.";
              setAlertParam({ state: "error", title: "Error", content: "You 've failed in registering. "+ errMsg });
              setVisibleModal(true);              
            }else {
              doLogin(params.address, params.password);
            }
          })
          .catch(function (error) {
            console.log("error : ", error);
            setAlertParam({ state: "error", title: "Error", content: "You 've failed in registering. " });
            setVisibleModal(true);
          });
      }
      if (saveMode === 1) {
        await axios({
          method: "put",
          url: `${config.baseUrl}users/${detailedUserInfo._id}`,
          data: params
        })
          .then(function (response) {
            console.log(response);
              setAlertParam({ state: "success", title: "Success", content: "Updating succeed." });
              setVisibleModal(true);
            if (detailedUserInfo && detailedUserInfo._id) dispatch(getDetailedUserInfo(detailedUserInfo._id));
          })
          .catch(function (error) {
            console.log(error);
            setAlertParam({ state: "error", title: "Error", content: error.message });
            setVisibleModal(true);
          });
      }
    }else{      
      setAlertParam({ state: "warning", title: "Warning", content: signingResult.message });
      setVisibleModal(true);
    }
  }

  const onClickUpdate = async () => {
    
    if(walletStatus === false)
    {
      setAlertParam( {state: "info", title:"Information", content: "Please connect and unlock your wallet." } );      
      setVisibleModal( true );
      return;
    }
    const params = {};
    if (address !== "") {
      let m; let correct = false;
      while ((m = regexForWallet.exec(address)) !== null) {
        if (m.index === regexForWallet.lastIndex) {
          regexForWallet.lastIndex++;
        }
        if (m[0] === address) {
          correct = true;
          params.address = address;
        }
      }
      if (!correct) {
        setAlertParam({ state: "warning", title: "Warning", content: "Invalid wallet address." });
        setVisibleModal(true);
        params.address = "";
        return;
      }
    }
    else{
      setAlertParam({ state: "warning", title: "Warning", content: "Username can not be empty." });
      setVisibleModal(true);
      return;
    }
    if (nameText === "") {
      setAlertParam({ state: "warning", title: "Warning", content: "Username can not be empty." });
      setVisibleModal(true);
      return;
    }
    params.username = nameText;
    if (urlText !== "") {
      let m; let correct = false;
      while ((m = regexForWebsite.exec(urlText)) !== null) {
        if (m.index === regexForWebsite.lastIndex) {
          regexForWebsite.lastIndex++;
        }
        if (m[0] === urlText) {
          correct = true;
          params.customURL = urlText;
        }
      }
      if (!correct) {
        setAlertParam({ state: "warning", title: "Warning", content: "Invalid custom url." });
        setVisibleModal(true);
        params.customURL = "";
        return;
      }
    }
    else params.customURL = "";
    params.userBio = bioText;
    if (websiteText !== "") {
      let m; let correct = false;
      while ((m = regexForWebsite.exec(websiteText)) !== null) {
        if (m.index === regexForWebsite.lastIndex) {
          regexForWebsite.lastIndex++;
        }
        if (m[0] === websiteText) {
          correct = true;
          params.websiteURL = websiteText;
        }
      }
      if (!correct) {
        setAlertParam({ state: "warning", title: "Warning", content: "Invalid portfolio or website." });
        setVisibleModal(true);
        params.websiteURL = "";
        return;
      }
    }
    else params.websiteURL = "";
    params.verified = true;
    params.banner = "";
    params.twitter = twitterText;
    params.socials = socials;

    if (selectedAvatarFile == null) {
      if (saveMode === 1) {
        params.avatar = logoImg.split(config.imgUrl)[1];
        saveUser(params);
        return;
      } else {
        setAlertParam({ state: "warning", title: "Warning", content: "Plese select a photo." });
        setVisibleModal(true);
        return;
      }
    }
    const formData = new FormData();
    formData.append("itemFile", selectedAvatarFile);
    formData.append("authorId", "hch");
    console.log(selectedAvatarFile);

    await axios({
      method: "post",
      url: `${config.baseUrl}utils/upload_file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        params.avatar = response.data.path;
        saveUser(params);
      })
      .catch(function (error) {
        console.log(error);
        setAlertParam({ state: "error", title: "Error", content: "Uploading photo failed." });
        setVisibleModal(true);
      });
  }

  const onAddSocial = () => {
    if(socialAccount === "" || socialAccount.trim(" ") ==="") return;
    setAddSocial(false);
    let socs = [];
    socs = socialInputs;
    socs.push({ type: socialType.text, value: socialAccount });
    let i; let socialsString = "";
    for (i = 0; i < socs.length; i++) {
      if (i === socs.length - 1) socialsString += socs[i].type + " : " + socs[i].value;
      else socialsString += socs[i].type + " : " + socs[i].value + ", ";
    }
    setSocials(socialsString);
    setSocialInputs(socs);
    console.log("socialInputs = ", socialInputs);
    setSocialAccount("");
  }

  const onRemoveSocialInput = (index) => {
    let socs = [];
    socs = socialInputs;
    socs.splice(index, 1);
    setSocialInputs(socs);
    let i; let socialsString = "";
    for (i = 0; i < socs.length; i++) {
      if (i === socs.length - 1) socialsString += socs[i].type + " : " + socs[i].value;
      else socialsString += socs[i].type + " : " + socs[i].value + ", ";
    }
    setSocials(socialsString);
  }

  const onCliearAll = () => {
    setLogoImg("");
    setSelectedAvatarFile(null);
    setNameText("");
    setWebsiteText("");
    setUrlText("");
    setTwitterText("");
    setBioText("");
    setVisibleModal(false);
    setSocials("");
  }

  const onOk = () => {
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  return (
    <div className={styles.page}>
      <Control className={styles.control} item={breadcrumbs} />
      <div className={cn("section-pt80", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.top}>
            <h1 className={cn("h2", styles.title)}>{userId !== "new" ? "Edit profile" : "Sign Up"}</h1>
            <div className={styles.info}>
              You can set preferred display name, create{" "}
              <strong>your profile URL</strong> and manage other personal
              settings.
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.user}>
                <div className={styles.avatar} style={{ border: "3px dashed rgb(204, 204, 204)", borderRadius: "50%", width: "160px", height: "160px" }}>
                  {logoImg !== "" && <img id="avatarImg" src={logoImg} alt="Avatar" />}
                </div>
                <div className={styles.details}>
                  <div className={styles.stage}>Profile photo *</div>
                  <div className={styles.text}>
                    We recommend an image of at least 400x400. Gifs work too{" "}
                    <span role="img" aria-label="hooray">
                      🙌
                    </span>
                  </div>
                  <div className={styles.file}>
                    <button
                      className={cn(
                        "button-stroke button-small",
                        styles.button
                      )}
                    >
                      Upload
                    </button>
                    <input className={styles.load} type="file" onChange={(e) => changeAvatar(e)} />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.list}>
                <div className={styles.item}>
                  <div className={styles.category}>Account info</div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      label="Display name *"
                      name="Name"
                      type="text"
                      placeholder="Enter your display name"
                      value={nameText}
                      onChange={(e) => setNameText(e.target.value)}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Custom url"
                      name="Url"
                      type="text"
                      placeholder="Your custom URL"
                      value={urlText}
                      onChange={(e) => setUrlText(e.target.value)}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Address *"
                      name="address"
                      type="text"
                      placeholder="e.g 0xcccCCCCCccccccCCCCCCcccc"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                    <TextArea
                      className={styles.field}
                      label="Bio"
                      name="Bio"
                      placeholder="About yourselt in a few words"
                      required="required"
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.category}>Social</div>
                  <div className={styles.fieldset}>
                    <TextInput
                      className={styles.field}
                      label="portfolio or website"
                      name="Portfolio"
                      type="text"
                      placeholder="Enter URL"
                      value={websiteText}
                      onChange={(e) => setWebsiteText(e.target.value)}
                      required
                    />
                    {/* <div className={styles.box}>
                      <TextInput
                        className={styles.field}
                        label="twitter"
                        name="Twitter"
                        type="text"
                        placeholder="@twitter username"
                        value={twitterText}
                        onChange={(e)=>setTwitterText(e.target.value)}
                        required
                      />
                      <button
                        className={cn(
                          "button-stroke button-small",
                          styles.button
                        )}
                      >
                        Verify account
                      </button>
                    </div> */}
                    <div className={styles.box} style={{ marginTop: "2rem" }}>
                      <div className={styles.fieldset} >
                        {
                          (socialInputs && socialInputs.length > 0) &&
                          socialInputs.map((socialInfo, index) => (
                            <div className="row" key={index}>
                              <div style={{
                                width: "92%",
                                display: "inline-block"
                              }}>
                                <TextInput
                                  className={styles.field}
                                  label={socialInfo.type}
                                  key={index}
                                  name={socialInfo.type + index}
                                  type="text"
                                  value={socialInfo.value}
                                  disabled
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
                                  onClick={() => onRemoveSocialInput(index)}
                                >
                                  <Icon name="close-circle" size="16" />
                                </button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  <button
                    className={cn("button-stroke button-small", styles.button)}
                    onClick={() => setAddSocial(!addSocial)}
                  >
                    <Icon name="plus-circle" size="16" />
                    <span>Add social accounts</span>
                  </button>
                </div>
              </div>
              <div className={styles.note}>
                To update your settings you should sign message through your
                wallet. Click {saveMode === 0 ? "'Register'" : "'Update'"} then sign the message
              </div>
              <div className={styles.btns}>
                <button className={cn("button", styles.button)}
                  onClick={() => onClickUpdate()}
                >
                  {saveMode === 0 ? "Register" : "Update"}
                </button>
                <button className={styles.clear} onClick={() => onCliearAll()}>
                  <Icon name="circle-close" size="24" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="Yes" onOk={onOk} onCancel={onCancel} />
      </Modal>
      <Modal visible={addSocial} onClose={() => setAddSocial(false)} >
        <div className={cn("h4", styles.title)}> Add Social Account</div>
        <div className={styles.field}>
          {/* <div className={styles.label} style={{marginTop:"2rem"}}>Social Type</div> */}
          <div className={styles.label}>Social Type</div>
          <Dropdown
            className={styles.dropdown}
            label="Social Type"
            value={socialType}
            setValue={setSocialType}
            options={socialTypes}
          />
        </div>
        <div className={styles.fieldset}>
          <TextInput
            className={styles.field}
            label="Social  Account"
            name=""
            type="text"
            placeholder="Enter URL"
            value={socialAccount}
            onChange={(e) => setSocialAccount(e.target.value)}
            required
          />
        </div>
        <button className={cn("button", styles.button)}
          style={{
            width: "-webkit-fill-available",
            marginTop: "1rem"
          }}
          onClick={() => onAddSocial()}>
          Add
        </button>
      </Modal>
    </div>
  );
};

export default ProfileEdit;
