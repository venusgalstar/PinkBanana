import React, { useState } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import Transfer from "../Transfer";
import RemoveSale from "../RemoveSale";
import Burn from "../Burn";
import Report from "../Report";
import Icon from "../Icon";
import Modal from "../../components/Modal";
import ChangePrice from "../ChangePrice";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useDispatch, useSelector } from "react-redux";
import { burnNFT, changePrice, checkNetworkById, whoHasTokenNow } from "../../InteractWithSmartContract/interact";
import { getNftDetail } from "../../store/actions/nft.actions";
import { transferNFT } from "../../InteractWithSmartContract/interact";
import { destroySale } from "../../InteractWithSmartContract/interact";
import Alert from "../../components/Alert";
import { useHistory } from "react-router-dom";

const Actions = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const [visibleModalTransfer, setVisibleModalTransfer] = useState(false);
  const [visibleModalRemoveSale, setVisibleModalRemoveSale] = useState(false);
  const [visibleModalBurn, setVisibleModalBurn] = useState(false);
  const [visibleModalReport, setVisibleModalReport] = useState(false);
  const [visibleModalChange, setVisibleModalChange] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);

  const currentWalletAddress = useSelector(state => state.auth.currentWallet);
  const currentChainId = useSelector(state => state.auth.currentChainId);
  const auth = useSelector(state => state.auth.user);
  const nft = useSelector(state => state.nft);
  const dispatch = useDispatch(); 
  const history = useHistory();

  const checkWalletAddrAndChainId = async () => 
  {
    if(Object.keys(auth).length === 0)
    {
      setAlertParam({state: "warning", title:"Warning", content:"You have to sign in before creting a item."});      
      setVisibleModal(true);
      console.log("Invalid account.");
      return false;
    }
    if (currentWalletAddress && auth && auth.address && currentWalletAddress.toLowerCase() !== auth.address.toLowerCase()) {      
      setAlertParam({state: "warning", title:"Warning", content:"Wallet addresses are not equal. Please check current wallet to your registered wallet."});      
      setVisibleModal(true);
      return false;
    }
    var result = await checkNetworkById(currentChainId);
    if (!result) {
      setAlertParam({state: "warning", title:"Warning", content:"Please connect to Avalanche network and try again."});      
      setVisibleModal(true);
      return false;
    }
    return true;
  }

  const items = [
    {
      title: "Change price",
      icon: "coin",
      action: () => setVisibleModalChange(true),
    },
    {
      title: "Transfer token",
      icon: "arrow-right-square",
      action: () => setVisibleModalTransfer(true),
    },
    {
      title: "Remove from sale",
      icon: "close-circle",
      action: () => setVisibleModalRemoveSale(true),
    },
    {
      title: "Burn token",
      icon: "close-circle",
      action: () => setVisibleModalBurn(true),
    },
    {
      title: "Report",
      icon: "info-circle",
      action: () => setVisibleModalReport(true),
    },
  ];

  const setNewPrice = async (newPrice) => 
  {    
    console.log("price:", newPrice);
    setVisibleModalChange(false);
    
    if(newPrice <0 )
    {
      setAlertParam({state: "warning", title:"Warning", content:"Price can not be a negative number."});      
      setVisibleModal(true);
      return;
    }    

    if(nft.detail.owner._id !== auth._id)
    {
      setAlertParam({state: "warning", title:"Warning", content:"You are not the owner of this nft."});      
      setVisibleModal(true);
      return;
    }    

    if(nft.detail.bids.length >0 && nft.detail.isSale === 2 )
    {
      setAlertParam({state: "warning", title:"Warning", content:"You cannot change the price of NFT because you had one or more bid(s) already."});      
      setVisibleModal(true);
      return;
    }

    setProcessing(true);
    try{
      let iHaveit = await whoHasTokenNow(auth.address, nft.detail._id);
      if(iHaveit === 1)
      {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"Your NFT is not on sale."});      
        setVisibleModal(true);
        return;      
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }
      
      console.log("tokenhash = " +  nft.detail._id +  " newPrice: " + newPrice);

      let ret;
      if (nft.detail._id) ret = await changePrice(auth.address, nft.detail._id, newPrice );
      else {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"NFT is invalid."});      
        setVisibleModal(true);
        return;
      }

      if (ret.success === true) 
      {
        setProcessing(false);
        setTimeout(() => {
          getNftDetail(nft.detail.id)(dispatch);
        }, 1000);
        setAlertParam({state: "success", title:"Success", content:"The price of NFT is changed."});      
        setVisibleModal(true);
      }
      else {
        console.log("failed on changing price : ", ret.status);
        setProcessing(false);
        setAlertParam({state: "error", title:"Error", content:"Chaging price is failed."});      
        setVisibleModal(true);
      }
      setProcessing(false);
    }catch(err){
      setProcessing(false);
      console.log("failed on changing price : ", err.message)
    }

  }

  const removeSale = async () => 
  {
    console.log("remove");
    setVisibleModalRemoveSale(false);
    
    if(nft.detail.owner._id !== auth._id)
    {
      setAlertParam({state: "warning", title:"Warning", content:"You are not the owner of this nft."});      
      setVisibleModal(true);
      return;
    }    

    if(nft.detail.bids.length >0 && nft.detail.isSale === 2 )
    {
      setAlertParam({state: "warning", title:"Warning", content:"You cannot remove it from sale because you had one or more bid(s) already."});      
      setVisibleModal(true);
      return;
    }

    setProcessing(true);
    try{
      let iHaveit = await whoHasTokenNow(auth.address, nft.detail._id);
      if(iHaveit === 1)
      {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"Your NFT is not on sale."});      
        setVisibleModal(true);
        return;      
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }
      
      console.log("tokenhash = " +  nft.detail._id +  " address: " + auth.address);

      let ret;
      if (nft.detail._id) ret = await destroySale(auth.address, nft.detail._id );
      else {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"Invalid NFT"});      
        setVisibleModal(true);
        return;
      }

      if (ret.success === true) 
      {
        setProcessing(false);
        setTimeout(() => {
          getNftDetail(nft.detail.id)(dispatch);
        }, 1000);
        setAlertParam({state: "success", title:"Success", content:"You 've removed a NFT from sale."});      
        setVisibleModal(true);
      }
      else {
        console.log("failed on remove sale : ", ret.status);
        setProcessing(false);
        setAlertParam({state: "error", title:"Error", content:"Failed in removing a NFT from sale."});      
        setVisibleModal(true);
      }
      setProcessing(false);
    }catch(err){
      setProcessing(false);
      console.log("failed on remove sale : ", err.message)
    }

  }

  const burnToken = async () =>
  {
    console.log("burn");
    setVisibleModalBurn(false);
    
    if(nft.detail.owner._id !== auth._id)
    {
      setAlertParam({state: "warning", title:"Warning", content:"You are not the owner of this nft."});      
      setVisibleModal(true);
      return;
    }
    setProcessing(true);
    try{
      let iHaveit = await whoHasTokenNow(auth.address, nft.detail._id);
      if(iHaveit === 0)
      {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"You cannot burn NFT while it is on sale or you've not minted it ever."});      
        setVisibleModal(true);
        return;      
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }
      
      console.log("tokenhash = " +  nft.detail._id +  " address: " + auth.address);

      let ret;
      if (nft.detail._id) ret = await burnNFT(auth.address, nft.detail._id);
      else {
        //alert("Incorrect token ID");
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"Invalid NFT."});      
        setVisibleModal(true);
        return;
      }

      if (ret.success === true) 
      {
        setProcessing(false);
        setTimeout(() => {
          getNftDetail(nft.detail.id)(dispatch);
        }, 1000);
        setAlertParam({state: "success", title:"Success", content:"You 've burned a NFT."});      
        setVisibleModal(true);
        history.push("/");
      }
      else {
        console.log("failed on burn token : ", ret.status);
        setProcessing(false);
        setAlertParam({state: "error", title:"Error", content:"Failed in burning a NFT."});      
        setVisibleModal(true);
      }
      setProcessing(false);
    }catch(err){
      setProcessing(false);
      console.log("failed on burn token : ", err.message)
    }

  }

  const transferToken = async (toAddr) =>
  {
    setVisibleModalTransfer(false);

    if(nft.detail.owner._id !== auth._id)
    {
      setAlertParam({state: "warning", title:"Warning", content:"You are not the owner of this nft."});      
      setVisibleModal(true);
      return;
    }
    setProcessing(true);
    
    try{
      let iHaveit = await whoHasTokenNow(auth.address, nft.detail._id);
      if(iHaveit === 0)
      {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"You cannot transfer NFT while it is on sale or you've not minted it ever."});      
        setVisibleModal(true);
        return;      
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }
      
      console.log("tokenhash = " +  nft.detail._id +  " address: " + auth.address + " toAddr : ", toAddr);
      let ret;
      if (nft.detail._id) ret = await transferNFT(auth.address, toAddr, nft.detail._id);
      else {
        setProcessing(false);
        setAlertParam({state: "warning", title:"Warning", content:"Invalid NFT."});      
        setVisibleModal(true);
        return;
      }

      if (ret.success === true) 
      {
        setProcessing(false);
        setTimeout(() => {
          getNftDetail(nft.detail.id)(dispatch);
        }, 1000);
        setAlertParam({state: "success", title:"Success", content:"You 've transfered a NFT."});      
        setVisibleModal(true);
      }
      else {
        console.log("failed on transfer token : ", ret.status);
        setProcessing(false);
        setAlertParam({state: "error", title:"Error", content:"Failed in transfering a NFT."});      
        setVisibleModal(true);
      }
      setProcessing(false);
    }catch(err){
      setProcessing(false);
      console.log("failed on transfer token : ", err.message)
    }

  }

  const onOk = () => { 
    setVisibleModal(false);
  }

  const onCancel = () => {
    setVisibleModal(false);
  }

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
        <div
          className={cn(styles.actions, className, {
            [styles.active]: visible,
          })}
        >
          <button
            className={cn("button-circle-stroke", styles.button)}
            onClick={() => setVisible(!visible)}
          >
            <Icon name="more" size="24" />
          </button>
          <div className={styles.body}>
            {
            (items && items.length > 0) && 
            items.map((x, index) => (
              <div className={styles.item} key={index} onClick={x.action}>
                <Icon name={x.icon} size="20" />
                <span>{x.title}</span>
              </div>
            ))}
          </div>
        </div>
      </OutsideClickHandler>
      <Modal
        visible={visibleModalTransfer}
        onClose={() => setVisibleModalTransfer(false)}
      >
        <Transfer onOk={transferToken} onCancel={() => setVisibleModalTransfer(false)} />
      </Modal>
      <Modal
        visible={visibleModalRemoveSale}
        onClose={() => setVisibleModalRemoveSale(false)}
      >
        <RemoveSale onOk={()=>{removeSale()}} onCancel={()=>setVisibleModalRemoveSale(false)}/>
      </Modal>
      <Modal
        visible={visibleModalBurn}
        onClose={() => setVisibleModalBurn(false)}
      >
        <Burn onOk={() => burnToken()} onCancel={()=>setVisibleModalBurn(false)} />
      </Modal>
      <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report />
      </Modal>      
      <Modal
        visible={visibleModalChange}
        onClose={() => setVisibleModalChange(false)}
      >
        <ChangePrice onOk={setNewPrice} onCancel={()=>setVisibleModalChange(false)}/>
      </Modal>
      
      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="Yes" onOk={onOk} onCancel={onCancel}/>
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

export default Actions;
