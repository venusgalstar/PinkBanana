import React, {useEffect, useState}from "react";
// import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./ProfileEdit.module.sass";
import Control from "../../components/Control";
import TextInput from "../../components/TextInput";
import TextArea from "../../components/TextArea";
import Icon from "../../components/Icon";
// import { useTable } from "react-table";
import axios from "axios";
import config from "../../config";
import Modal from "../../components/Modal";
import FolowSteps from "./FolowSteps";
import { useHistory } from "react-router-dom";
import { authSet } from "../../store/actions/auth.actions";
import { useDispatch, useSelector } from 'react-redux';
import jwt_decode from "jwt-decode";
import { signString } from "../../InteractWithSmartContract/interact";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Edit Profile",
  },
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
  const [createState, setCreateState] = useState(1);
  let history = useHistory();
  let dispatch = useDispatch();
  const currentUsr = useSelector(state => state.auth.user);
  const [signedString, setSignedString] = useState("");
  
  useEffect(() =>
  {
    if(currentUsr && currentUsr.address)
    {
      setAddress(currentUsr.address);
      console.log("[in the useEffect] address = " , currentUsr.address);
    }
  }, [currentUsr])

  console.log("[out of useEffect] currentUsr = " , currentUsr);
  console.log("[out of useEffect] address = " , currentUsr.address);

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
  }

  const doLogin = (address, password) =>
  {    
    const params = {};
    params.address = address;
    params.password = password;
    setCreateState(1);
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
      console.log(response);     
      if(response.data.success === true)
      { 
        //set the token to sessionStroage   
        const token = response.data.token;   
        sessionStorage.setItem("jwtToken", response.data.token);
        const decoded = jwt_decode(token);
        console.log(decoded);
        dispatch(authSet(decoded._doc));
        setCreateState(0);      
      }
    })
    .catch(function (error) {
      console.log(error);
      setCreateState(2);
    });
  }

  const saveItem = (params) => {
    axios({
      method: "post",
      url: `${config.baseUrl}users/create`,
      data: params
    })
    .then(function (response) {
      console.log(response);      
      setCreateState(0);
      doLogin(params.address, params.password);
    })
    .catch(function (error) {
      console.log(error);
      setCreateState(2);
    });
  }

  const onClickUpdate = async () =>
  { 
    setVisibleModal(true);    
    let signedString = "";   
    signedString =  await signString(address);
    if(signedString !== "")
    {
      if(selectedAvatarFile == null) 
      {
        const params = {};
        params.address = address;
        params.username = nameText;
        params.customURL = urlText;
        params.profilePhoto = logoImg;
        params.userBio = bioText;
        params.websiteURL = websiteText;
        params.verified = true;
        params.userImg = "";
        params.password = signedString;
        setCreateState(1);
        saveItem(params);
        return;
      }
      const formData = new FormData();
      formData.append("itemFile", selectedAvatarFile);
      formData.append("authorId", "hch");
      console.log(selectedAvatarFile);
      
      setCreateState(1);
      axios({
        method: "post",
        url: `${config.baseUrl}utils/upload_file`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(function (response) 
      {
        // console.log(response);
        const params = {};
        params.address = address;
        params.username = nameText;
        params.customURL = urlText;
        params.avatar = response.data.path;
        params.userBio = bioText;
        params.websiteURL = websiteText;
        params.verified = true;
        params.banner = "";
        params.password = signedString;
        setCreateState(1);
        saveItem(params);
      })
      .catch(function (error) {
        console.log(error);
        setCreateState(2);
      });
    }
  }
  
  const navigate2Next = () =>
  {
    history.push("/")
  }

  const onCliearAll = () =>
  {
    setLogoImg("");
    setSelectedAvatarFile(null);
    setNameText("");
    setWebsiteText("");
    setUrlText("");
    setTwitterText("");
    setBioText("");
    setVisibleModal(false);
    setCreateState(1);
  }

  return (
    <div className={styles.page}>
      <Control className={styles.control} item={breadcrumbs} />
      <div className={cn("section-pt80", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={styles.top}>
            <h1 className={cn("h2", styles.title)}>Edit profile</h1>
            <div className={styles.info}>
              You can set preferred display name, create{" "}
              <strong>your profile URL</strong> and manage other personal
              settings.
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.user}>
                <div className={styles.avatar} style={{border:"3px dashed rgb(204, 204, 204)", borderRadius:"50%", width:"160px", height:"160px"}}>
                  {logoImg !=="" &&<img id="avatarImg" src={logoImg} alt="Avatar" /> }
                </div>
                <div className={styles.details}>
                  <div className={styles.stage}>Profile photo</div>
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
                    <input className={styles.load} type="file" onChange={(e)=>changeAvatar(e)}/>   
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
                      label="display name"
                      name="Name"
                      type="text"
                      placeholder="Enter your display name"
                      value={nameText}
                      onChange={(e)=>setNameText(e.target.value)}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="Custom url"
                      name="Url"
                      type="text"
                      placeholder="ui8.net/Your custom URL"
                      value={urlText}
                      onChange={(e)=>setUrlText(e.target.value)}
                      required
                    />
                    <TextInput
                      className={styles.field}
                      label="address"
                      name="address"
                      type="text"
                      placeholder="e.g 0xcccCCCCCccccccCCCCCCcccc"
                      value={address}
                      onChange={(e)=>setAddress(e.target.value)}
                      required
                    />
                    <TextArea
                      className={styles.field}
                      label="Bio"
                      name="Bio"
                      placeholder="About yourselt in a few words"
                      required="required"
                      value={bioText}
                      onChange={(e)=>setBioText(e.target.value)}
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
                      onChange={(e)=>setWebsiteText(e.target.value)}
                      required
                    />
                    <div className={styles.box}>
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
                    </div>
                  </div>
                  <button
                    className={cn("button-stroke button-small", styles.button)}
                  >
                    <Icon name="plus-circle" size="16" />
                    <span>Add more social account</span>
                  </button>
                </div>
              </div>
              <div className={styles.note}>
                To update your settings you should sign message through your
                wallet. Click 'Update profile' then sign the message
              </div>
              <div className={styles.btns}>
                <button className={cn("button", styles.button)}
                  onClick={() => onClickUpdate()}
                >
                  Register
                </button>
                <button className={styles.clear} onClick={()=>onCliearAll()}>
                  <Icon name="circle-close" size="24" />
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>      
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <FolowSteps className={styles.steps} state={createState} navigate2Next={navigate2Next}/>
      </Modal>
    </div>
  );
};

export default ProfileEdit;
