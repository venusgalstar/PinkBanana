import React, { useEffect, useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Profile.module.sass";
import Icon from "../../components/Icon";
import User from "./User";
import Items from "./Items";
import Followers from "./Followers";
import axios from "axios";
import config from "../../config";
import Modal from "../../components/Modal";
// import FolowSteps from "./FolowSteps";
import Alert from "../../components/Alert";
import { useParams } from "react-router-dom";
import { getItemsOfUserByConditions } from "../../store/actions/nft.actions";
import { getFollowList, getFollowingList } from "../../store/actions/follow.actions";
import { getDetailedUserInfo } from "../../store/actions/auth.actions";
import { useHistory } from "react-router-dom";

// data
// import { bids } from "../../mocks/bids";
import { useDispatch, useSelector } from "react-redux";
// import { isStepDivisible } from "react-range/lib/utils";

const navLinks = [
  "On Sale",
  "Collectibles",
  "Created",
  "Likes",
  "Following",
  "Followers",
];

const socials = [
  {
    title: "twitter",
    url: "https://twitter.com/ui8",
  },
  {
    title: "instagram",
    url: "https://www.instagram.com/ui8net/",
  },
  {
    title: "facebook",
    url: "https://www.facebook.com/ui8.net/",
  },
];

// const following_template = [
//   {
//     name: "Sally Fadel",
//     counter: "161 followers",
//     avatar: "/images/content/avatar-5.jpg",
//     url: "https://ui8.net",
//     buttonClass: "stroke",
//     buttonContent: "Unfollow",
//     gallery: [
//       "/images/content/follower-pic-1.jpg",
//       "/images/content/follower-pic-2.jpg",
//       "/images/content/follower-pic-3.jpg",
//       "/images/content/follower-pic-4.jpg",
//     ],
//   }
// ];

// const followers_template = [
//   {
//     name: "Sally Fadel",
//     counter: "161 followers",
//     avatar: "/images/content/avatar-5.jpg",
//     url: "https://ui8.net",
//     buttonClass: "blue",
//     buttonContent: "Follow",
//     gallery: [
//       "/images/content/follower-pic-1.jpg",
//       "/images/content/follower-pic-2.jpg",
//       "/images/content/follower-pic-3.jpg",
//       "/images/content/follower-pic-4.jpg",
//     ],
//   }
// ];

const Profile = () => 
{
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imgBanner, setImgBanner] = useState("/images/content/bg-profile.jpg");
  const [visibleModal, setVisibleModal] = useState(false);
  const [alertParam, setAlertParam] = useState({});  
  const itemsOfCol = useSelector(state => state.nft.list);
  const dispatch = useDispatch();
  const currentUsr  =  useSelector(state=>state.auth.user);  //user_id in making follow
  const {userId} = useParams();  //taget_id in making follow
  const [start, setStart] = useState(0);
  const [last, setLast] = useState(8);
  const following  = useSelector(state => state.follow.followinglist);
  const followers  = useSelector(state => state.follow.followlist);
  const detailedUserInfo = useSelector(state => state.auth.otherUser);
  const history = useHistory();

  useEffect(() =>
  {
    dispatch(getDetailedUserInfo(userId, false));
  }, [userId])

  const changeFile = (e) =>
  {
    var file = e.target.files[0];
    if(file == null) return;
    console.log(file);
    setSelectedFile(file);
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImgBanner(reader.result);
      document.getElementById("coverImageArea").style.background = `url(${reader.result})`;
    };
    reader.onerror = function (error) {
    }
  }

  const saveItem = async (params) => {
    await axios({
      method: "put",
      url: `${config.baseUrl}users/${userId}`,
      data: params
    })
    .then(function (response) {
      console.log(response);      
      setAlertParam({state: "success", title:"Success", content:"Uploading succeed."});      
      setVisibleModal(true);
      dispatch(getDetailedUserInfo(userId));
    })
    .catch(function (error) {
      console.log(error);
      setAlertParam({state: "error", title:"Error", content:"Uploading failed."});      
      setVisibleModal(true);
    });
  }

  const onUpdateUserImg = async () =>
  {
    if(selectedFile == null) 
    {
      const params = {};
      params.banner = imgBanner;
      await saveItem(params);
      return;
    }
    const formData = new FormData();
    formData.append("itemFile", selectedFile);
    formData.append("authorId", "hch");
    console.log(selectedFile);
    
    await axios({
      method: "post",
      url: `${config.baseUrl}utils/upload_file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(async function (response) {
      console.log("response = ", response);
      const params = {};
      params.banner = response.data.path;
      await saveItem(params);
    })
    .catch(function (error) {
      console.log(error);
      setAlertParam({state: "error", title:"Error", content:"Uploading failed."});      
      setVisibleModal(true);
    });

    setVisible(false);
  }

  useEffect(() => 
  {
    let params = { start : start, last: last};
    params.activeindex = activeIndex;
    console.log("params  = ", params, "currentUsr._id = ", currentUsr._id, "userId = ", userId);
    if(activeIndex>=0 && activeIndex<=3) dispatch(getItemsOfUserByConditions(params, userId));
    if(activeIndex === 4) 
    {
      dispatch(getFollowList(userId, 10))      
    }
    if(activeIndex === 5) 
    {
      dispatch(getFollowingList(userId, 10))
    }
    console.log("following = ", following);
    console.log("followers = ", followers);
  }, [activeIndex])

  const navigate2Next = () =>
  {
    
  }

  const onGotoProfile = () =>
  {
    history.push(`/profile-edit/${currentUsr._id}`);
  }

  const onOk = () => { 
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  return (
    <div className={styles.profile}>
        <div id="coverImageArea" className={cn(styles.head, { [styles.active]: visible })}
          style={
            (detailedUserInfo && detailedUserInfo.banner) ?
            {backgroundImage: `url(${config.imgUrl}${detailedUserInfo.banner})`} 
            :            
            {backgroundImage: `url(${imgBanner})`}           
          }
        >       
        {
          currentUsr._id === userId && 
        <div className={cn("container", styles.container)}>
          <div className={styles.btns}>
            <button
              className={cn("button-stroke button-small", styles.button)}
              onClick={() => setVisible(true)}
            >
              <span>Edit cover photo</span>
              <Icon name="edit" size="16" />
            </button>
            <Link
              className={cn("button-stroke button-small", styles.button)}
              onClick = {() => onGotoProfile()}
            >
              <span>Edit profile</span>
              <Icon name="image" size="16" />
            </Link>      
          </div>
          <div className={styles.file}>
            <input type="file" onChange={(e) => changeFile(e)}/>
            <div className={styles.wrap}>
              <Icon name="upload-file" size="48" />
              <div className={styles.info}>Drag and drop your photo here</div>
              <div className={styles.text}>or click to browse</div>
            </div>
            <button
              className={cn("button-small", styles.button)}
              onClick={() => onUpdateUserImg()}
            >
              Save photo
            </button>
          </div>
        </div>
        }
      </div>
      <div className={styles.body}>
        <div className={cn("container", styles.container)}>
          <User className={styles.user} item={socials} />
          <div className={styles.wrapper}>
            <div className={styles.nav}>
              {
                (navLinks && navLinks.length> 0 ) && 
              navLinks.map((x, index) => (
                <button
                  className={cn(styles.link, {
                    [styles.active]: index === activeIndex,
                  })}
                  key={index}
                  onClick={() => setActiveIndex(index)}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className={styles.group}>
              <div className={styles.item}>
                {activeIndex === 0 && (
                  //OnSale
                  <Items class={styles.items} items={itemsOfCol} /> 
                )}
                {activeIndex === 1 && (
                  //collectibles
                  <Items class={styles.items} items={itemsOfCol} />
                )}
                {activeIndex === 2 && (
                  //created
                  <Items class={styles.items} items={itemsOfCol} />
                )}
                {activeIndex === 3 && (
                  //links
                  <Items class={styles.items} items={itemsOfCol} />
                )}
                {activeIndex === 4 && (
                  //following
                  <Followers className={styles.followers} items={following} buttonContent="Unfollow" />
                )}
                {activeIndex === 5 && (
                  //Followers
                  <Followers className={styles.followers} items={followers} buttonContent="" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>          
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="Yes" onOk={onOk} onCancel={onCancel} />
      </Modal>
    </div>
  );
};

export default Profile;
