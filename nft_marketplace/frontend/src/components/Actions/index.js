import React, { useState, useEffect } from "react";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Actions.module.sass";
import Transfer from "../Transfer";
import RemoveSale from "../RemoveSale";
import Burn from "../Burn";
// import Report from "../Report";
import Icon from "../Icon";
import Modal from "../../components/Modal";
import ChangePrice from "../ChangePrice";
import { useDispatch, useSelector } from "react-redux";
import { burnNFT, changePrice, checkNetworkById, getBalanceOf } from "../../InteractWithSmartContract/interact";
import { emptyNFTTradingResult, getNftDetail } from "../../store/actions/nft.actions";
import { transferNFT } from "../../InteractWithSmartContract/interact";
import { destroySale } from "../../InteractWithSmartContract/interact";
import Alert from "../../components/Alert";
import { useHistory } from "react-router-dom";

const Actions = ({ className, setProcessing }) => 
{
  const [visible, setVisible] = useState(false);
  const [visibleModalTransfer, setVisibleModalTransfer] = useState(false);
  const [visibleModalRemoveSale, setVisibleModalRemoveSale] = useState(false);
  const [visibleModalBurn, setVisibleModalBurn] = useState(false);
  // const [visibleModalReport, setVisibleModalReport] = useState(false);
  const [visibleModalChange, setVisibleModalChange] = useState(false);
  const [alertParam, setAlertParam] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);
  const [items, setItems] = useState([]);

  const currentWalletAddress = useSelector(state => state.auth.currentWallet);
  const currentChainId = useSelector(state => state.auth.currentChainId);
  const auth = useSelector(state => state.auth.user);
  const nft = useSelector(state => state.nft);
  const nftDetail = useSelector(state => state.nft.detail);
  const dispatch = useDispatch();
  const history = useHistory();
  const tradingResult = useSelector(state => state.nft.tradingResult);
  const walletStatus = useSelector(state => state.auth.walletStatus);

  const checkWalletAddrAndChainId = async () => {
    if (Object.keys(auth).length === 0) {
      setAlertParam({ state: "warning", title: "Warning", content: "You have to sign in before doing a trading." });
      setVisibleModal(true);
      console.log("Invalid account.");
      return false;
    }
    if(walletStatus === false){
      setAlertParam({ state: "warning", title: "Warning", content: "Please connect and unlock your wallet." });
      setVisibleModal(true);
      return false;      
    }
    if (currentWalletAddress && auth && auth.address && currentWalletAddress.toLowerCase() !== auth.address.toLowerCase()) {
      setAlertParam({ state: "warning", title: "Warning", content: "Wallet addresses are not equal. Please check current wallet to your registered wallet." });
      setVisibleModal(true);
      return false;
    }
    var result = await checkNetworkById(currentChainId);
    if (!result) {
      setAlertParam({ state: "warning", title: "Warning", content: "Please connect to Avalanche network and try again." });
      setVisibleModal(true);
      return false;
    }
    return true;
  }

  useEffect(() => {    
    const itemList = [
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
    ];

    var list = [];
    if (nftDetail && auth) {
      if (nftDetail.isSale === 1 || (nftDetail.isSale === 2 && nftDetail.bids.length === 0)) {
        list.push(itemList[0]);
      }
      if (nftDetail.isSale === 0) {
        list.push(itemList[1]);
      }
      if (nftDetail.isSale === 1 || (nftDetail.isSale === 2 && nftDetail.bids.length === 0)) {
        list.push(itemList[2]);
      }
      if (nftDetail.isSale === 0) {
        list.push(itemList[3]);
      }
      setItems(list);
    }
  }, [nftDetail, auth ]);

  useEffect(() => {
    if (tradingResult) 
    {
      console.log("[Actions useEffect] tradingResult = ", tradingResult)
      setProcessing(false);
      switch (tradingResult.function) {
        default:
          setVisibleModal(false);
          break;
        case "changePrice":
          if (tradingResult.success) {
            setAlertParam({ state: "success", title: "Success", content: "The price of NFT is changed." });
          } else {
            setAlertParam({ state: "error", title: "Error", content: tradingResult.message });
          }
          setVisibleModal(true);
          break;
        case "destroySale":
          if (tradingResult.success) {
            setAlertParam({ state: "success", title: "Success", content: "You 've removed a NFT from sale." });
          } else {
            setAlertParam({ state: "error", title: "Error", content:  tradingResult.message });
          }
          setVisibleModal(true);
          break;
        case "burnNFT":
          if (tradingResult.success) {
            setAlertParam({ state: "success", title: "Success", content: "You 've burned a NFT." });
          } else {
            setAlertParam({ state: "error", title: "Error", content:  tradingResult.message });
          }
          setVisibleModal(true);
          history.push("/collectionItems/"+ nftDetail.collection_id._id);
          break;
        case "transferNFT":
          if (tradingResult.success) {
            setAlertParam({ state: "success", title: "Success", content: "You 've transfered a NFT." });
          } else {
            setAlertParam({ state: "error", title: "Error", content:  tradingResult.message });
          }
          setVisibleModal(true);
          break;
      }
      dispatch(emptyNFTTradingResult());
      getNftDetail(nftDetail._id)(dispatch);
    }
  }, [tradingResult, dispatch, nftDetail, history, setProcessing])

  const setNewPrice = async (newPrice) => {
    setVisibleModalChange(false);

    if (newPrice < 0) {
      setAlertParam({ state: "warning", title: "Warning", content: "Price can not be a negative number." });
      setVisibleModal(true);
      return;
    }

    if (nft.detail.owner._id !== auth._id) {
      setAlertParam({ state: "warning", title: "Warning", content: "You are not the owner of this nft." });
      setVisibleModal(true);
      return;
    }

    if (nft.detail.bids.length > 0 && nft.detail.isSale === 2) {
      setAlertParam({ state: "warning", title: "Warning", content: "You cannot change the price of NFT because you had one or more bid(s) already." });
      setVisibleModal(true);
      return;
    }

    setProcessing(true);
    let iHaveit;
    try {
      iHaveit = await getBalanceOf(auth.address, nft.detail._id);
      if (iHaveit === 1) {
        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "Your NFT is not on sale." });
        setVisibleModal(true);
        return;
      }
      if(iHaveit && iHaveit.message)
      {
        setAlertParam({ state: "warning", title: "Warning", content: iHaveit.message });
        setVisibleModal(true);
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }

      console.log("tokenhash = " + nft.detail._id + " newPrice: " + newPrice);

      if (nft.detail._id) await changePrice(auth.address, nft.detail._id, newPrice);
      else {
        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "NFT is invalid." });
        setVisibleModal(true);
        return;
      }
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
      console.log("failed on changing price : ", err.message)
    }

  }

  const removeSale = async () => {
    console.log("remove");
    setVisibleModalRemoveSale(false);

    if (nft.detail.owner._id !== auth._id) {
      setAlertParam({ state: "warning", title: "Warning", content: "You are not the owner of this nft." });
      setVisibleModal(true);
      return;
    }

    if (nft.detail.bids.length > 0 && nft.detail.isSale === 2) {
      setAlertParam({ state: "warning", title: "Warning", content: "You cannot remove it from sale because you had one or more bid(s) already." });
      setVisibleModal(true);
      return;
    }

    setProcessing(true);
    let iHaveit;
    try {
      iHaveit = await getBalanceOf(auth.address, nft.detail._id);
      if (iHaveit === 1) {
        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "Your NFT is not on sale." });
        setVisibleModal(true);
        return;
      }
      if(iHaveit && iHaveit.message)
      {
        setAlertParam({ state: "warning", title: "Warning", content: iHaveit.message });
        setVisibleModal(true);
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }

      console.log("tokenhash = " + nft.detail._id + " address: " + auth.address);

      if (nft.detail._id) await destroySale(auth.address, nft.detail._id);
      else {
        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "Invalid NFT" });
        setVisibleModal(true);
        return;
      }
      setProcessing(false);

    } catch (err) {
      setProcessing(false);
      console.log("failed on remove sale : ", err.message)
    }

  }

  const burnToken = async () => {
    setVisibleModalBurn(false);

    if (nft.detail.owner._id !== auth._id) {
      setAlertParam({ state: "warning", title: "Warning", content: "You are not the owner of this nft." });
      setVisibleModal(true);
      return;
    }
    setProcessing(true);
    let iHaveit;
    try {
      iHaveit = await getBalanceOf(auth.address, nft.detail._id);
      if (iHaveit === 0) {
        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "You cannot burn NFT while it is on sale or you've not minted it ever." });
        setVisibleModal(true);
        return;
      }
      if(iHaveit && iHaveit.message)
      {
        setAlertParam({ state: "warning", title: "Warning", content: iHaveit.message });
        setVisibleModal(true);
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }

      console.log("tokenhash = " + nft.detail._id + " address: " + auth.address);

      if (nft.detail._id) await burnNFT(auth.address, nft.detail._id);
      else {

        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "Invalid NFT." });
        setVisibleModal(true);
        return;
      }
      setProcessing(false);
    } catch (err) {
      setProcessing(false);
      console.log("failed on burn token : ", err.message)
    }

  }

  const transferToken = async (toAddr) => {
    setVisibleModalTransfer(false);

    if (nft.detail.owner._id !== auth._id) {
      setAlertParam({ state: "warning", title: "Warning", content: "You are not the owner of this nft." });
      setVisibleModal(true);
      return;
    }
    setProcessing(true);
    let iHaveit;
    try {
      iHaveit = await getBalanceOf(auth.address, nft.detail._id);
      if (iHaveit === 0) {
        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "You cannot transfer NFT while it is on sale or you've not minted it ever." });
        setVisibleModal(true);
        return;
      }
      if(iHaveit && iHaveit.message)
      {
        setAlertParam({ state: "warning", title: "Warning", content: iHaveit.message });
        setVisibleModal(true);
      }
      let checkResut = await checkWalletAddrAndChainId();
      if (!checkResut) {
        setProcessing(false);
        return;
      }

      console.log("tokenhash = " + nft.detail._id + " address: " + auth.address + " toAddr : ", toAddr);

      if (nft.detail._id) await transferNFT(auth.address, toAddr, nft.detail._id);
      else {
        setProcessing(false);
        setAlertParam({ state: "warning", title: "Warning", content: "Invalid NFT." });
        setVisibleModal(true);
        return;
      }
      setProcessing(false);
    } catch (err) {
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
        <RemoveSale onOk={() => { removeSale() }} onCancel={() => setVisibleModalRemoveSale(false)} />
      </Modal>
      <Modal
        visible={visibleModalBurn}
        onClose={() => setVisibleModalBurn(false)}
      >
        <Burn onOk={() => burnToken()} onCancel={() => setVisibleModalBurn(false)} />
      </Modal>
      {/* <Modal
        visible={visibleModalReport}
        onClose={() => setVisibleModalReport(false)}
      >
        <Report />
      </Modal>       */}
      <Modal
        visible={visibleModalChange}
        onClose={() => setVisibleModalChange(false)}
      >
        <ChangePrice onOk={setNewPrice} onCancel={() => setVisibleModalChange(false)} />
      </Modal>

      <Modal visible={visibleModal} onClose={() => setVisibleModal(false)}>
        <Alert className={styles.steps} param={alertParam} okLabel="Yes" onOk={onOk} onCancel={onCancel} />
      </Modal>

    </>
  );
};

export default Actions;
