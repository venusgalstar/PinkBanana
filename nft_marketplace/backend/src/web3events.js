var Web3 = require('web3');
var ObjectId = require('mongodb').ObjectID;
const { io } = require("./socket");
const mainnet_http_RPC = require("../env").mainnet_http_RPC;
const pinkBananaFactoryABI = require("../env").pinkBananaFactoryABI;
const pinkBananaFactoryAddress = require("../env").pinkBananaFactoryAddress;
var ObjectId = require('mongodb').ObjectID;

const db = require("./db");
const User = db.User;
const Sale = db.Sale;
const Item = db.Item;
const Notify = db.Notify;

var web3WS = new Web3(mainnet_http_RPC);
var myContract = new web3WS.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);

var scanBlockNumber = 0;
var maxBlockNumber = 11845904;

var CreateTemp = {};
var DestroyTemp = {};
var PlaceTemp = {};
var AcceptTemp = {};
var BuyTemp = {};
var EndTemp = {};
var TransferTemp = {};
var BurnTemp = {};
var ChangePriceTemp = {};

const compareObjects = (A, B) =>
{
    if(Object.keys(A).length === 0) return false;    
    if(Object.keys(A).length !== Object.keys(B).length) return false;
    else{
        if(JSON.stringify(A) !== JSON.stringify(B)) return false;
    }
    console.log("----------------- same event happend ----------------");
    return true;
}

const getBlockNumber = () => {
    web3WS.eth.getBlockNumber()
        .then((number) => {
            if (maxBlockNumber < number) {
                maxBlockNumber = number;
                if (scanBlockNumber == 0) {
                    scanBlockNumber = number;
                }
                console.log("max block number", number);
            }
        }).catch((error) => {
            console.log("get blocknumber error");
        });
    setTimeout(getBlockNumber, 300);
}

getBlockNumber();

const getData = async () => {
    if (scanBlockNumber != 0 && scanBlockNumber <= maxBlockNumber) {
        console.log('scan block number', scanBlockNumber);
        try {
            await CreateSale_monitor(scanBlockNumber);
            await DestroySale_monitor(scanBlockNumber);
            await PlaceBid_monitor(scanBlockNumber);
            await AcceptBid_monitor(scanBlockNumber);
            await BuyNow_monitor(scanBlockNumber);
            await EndBid_monitor(scanBlockNumber);
            await TransferNFT_monitor(scanBlockNumber);
            await BurnNFT_monitor(scanBlockNumber);
            await ChangePrice_monitor(scanBlockNumber);
            scanBlockNumber++;
        } catch (e) {

        }
    }
    setTimeout(getData, 100);
}

getData();


const CreateSale_monitor = async (blockNumber) => {
    try {        
        var event = await myContract.getPastEvents("CreateSale", { fromBlock: blockNumber });        
        if (event.length > 0) {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(CreateTemp, objTemp) === false) 
                {
                    CreateTemp = objTemp;

                    console.log("---------------------- CreateSale event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var price = data.returnValues.price;
                    var interval = Number(data.returnValues.interval) / (24 * 3600);

                    var param = { price: 0 };
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');

                    if (interval == 0) {
                        param.isSale = 1;
                        param.price = item_price;
                        param.auctionPeriod = 0;
                        param.auctionPrice = 0;
                    } else {
                        param.isSale = 2;
                        param.auctionPrice = item_price;
                        param.auctionPeriod = interval;
                    }
                    Item.findByIdAndUpdate(tokenHash, param).then( (data) => {
                        
                    let descriptionStr =  data.auctionPeriod === 0 ? 
                    "An instnat sale is opened on " + data.name + " with price " + data.price
                    : "An auction is opened on " + data.name + " with price " + data.price;
                    
                        const new_notify = new Notify(
                        {
                            imgUrl: data.logoURL,
                            subTitle: "New sale is opened",
                            description: descriptionStr,
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 1
                        });
                        new_notify.save(function (err) {
                            if (!err) {
                            }
                        });
                        io.sockets.emit("UpdateStatus", { type: "CREATE_SALE" });

                    }).catch(() => {
                        ////res.send({ code: 1 });
                    });

                    console.log("---------------------- end of CreateSale event --------------------")
                    console.log("");
                }
            }
        } else {
            return;
        }

    } catch (error) {
        console.log("Something went wrong 1: " + error.message)
    }
}

const DestroySale_monitor = async (blockNumber) => {
    try {
        var event = await myContract.getPastEvents("DestroySale", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(DestroyTemp, objTemp) === false) 
                {
                    DestroyTemp = objTemp;

                    console.log("----------------------DestroySale event--------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var param = { };

                    param.price = 0;
                    param.isSale = 0;
                    param.auctionPrice = 0;
                    param.auctionPeriod = 0;

                    console.log("before call findByIdAndUpdate()");
                    Item.findByIdAndUpdate(tokenHash, param).then((data) => {
                        console.log("data = ", data)
                        const new_notify = new Notify(
                        {
                            imgUrl: data.logoURL,
                            subTitle: "A sale is cancelled.",
                            description: "Item " + data.name + " is removed from sale.",
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 1
                        });
                        new_notify.save(function (err) {
                            if (!err) {
                            }
                        });
                        io.sockets.emit("UpdateStatus", { type: "DESTROY_SALE" });

                    }).catch((err) => {
                        console.log("destroy sale error : " + err)
                    });

                    console.log("---------------------- end of DestroySale event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
        console.log("Something went wrong 2: " + error.message)
    }
}

const PlaceBid_monitor = async (blockNumber) => {
    try {       
        var event = await myContract.getPastEvents("PlaceBid", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(PlaceTemp, objTemp) === false) 
                {
                    PlaceTemp = objTemp;

                    console.log("---------------------- PlaceBid event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var bidder = data.returnValues.bidder;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');

                    var bidder_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + bidder, "i") }
                    }, { _id: 1 });
                    bidder_id = bidder_id[0]._id;

                    Item.findById(tokenHash).then(async (data) => {

                        var bids = data.bids;
                        if (bids.length == 0 || bids[bids.length - 1].price < item_price) {
                            bids.push({ user_id: ObjectId(bidder_id), price: item_price, Time: Date.now() });
                            Item.findByIdAndUpdate(tokenHash, { bids: bids }).then(async (data) => {
                                const new_notify = new Notify(
                                {
                                    imgUrl: data.logoURL,
                                    subTitle: "New Bid is placed.",
                                    description: "Item " + data.name + " has new bid with price " + item_price,
                                    date: new Date(),
                                    readers: [],
                                    target_ids: [],
                                    Type: 3
                                });
                                new_notify.save(function (err) {
                                    if (!err) {
                                    }
                                });
                                io.sockets.emit("UpdateStatus", { type: "PLACE_BID" });
                            }).catch(() => {
                            })
                        } else {
                        }
                    }).catch((error) => {
                    });

                    console.log("---------------------- end of PlaceBid event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
        console.log("Something went wrong 3: " + error.message)
    }
}

const AcceptBid_monitor = async (blockNumber) => {
    try {
        var event = await myContract.getPastEvents("AcceptBid", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(AcceptTemp, objTemp) === false)
                {
                    AcceptTemp = objTemp;

                    console.log("---------------------- AcceptBid event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');
                    var seller = data.returnValues.seller;
                    var buyer = data.returnValues.buyer;

                    var buyer_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + buyer, "i") }
                    }, { _id: 1 });
                    buyer_id = buyer_id[0]._id;
                    var seller_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + seller, "i") }
                    }, { _id: 1 });
                    seller_id = seller_id[0]._id;

                    Item.findById(tokenHash).then((data) => {
                        var bids = data.bids;
                        if (bids.length == 0) {
                            ////res.send({ code: 1, message: "no bids" });
                        }

                        var promise = [];
                        var find_update = Item.findByIdAndUpdate(tokenHash, {
                            owner: buyer_id,
                            price: item_price,
                            auctionPrice: 0,
                            auctionPeriod: 0,
                            bids: [],
                            isSale: 0
                        });
                        promise.push(find_update);
                        var sale = new Sale({
                            item: tokenHash,
                            owner: seller_id,
                            buyer: buyer_id,
                            price: item_price
                        });
                        promise.push(sale.save());
                        Promise.all(promise).then((result) => {
                            const new_notify = new Notify(
                            {
                                imgUrl: "notify_icons/AVAX_logo.png",
                                subTitle: "Item is sold",
                                description: "Item " + result[0].name + " is sold with price " + item_price,
                                date: new Date(),
                                readers: [],
                                target_ids: [],
                                Type: 7
                            });
                            new_notify.save(function (err) {
                                if (!err) {
                                }
                            });
                            io.sockets.emit("UpdateStatus", { type: "ACCEPT_BID" });
                        });
                    }).catch(() => {
                        ////res.send({ code: 1 });
                    })
                    console.log("---------------------- end of AcceptBid event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
       console.log("Something went wrong 4: " + error.message)
    }
}

const BuyNow_monitor = async (blockNumber) => {
    try {
        var event = await myContract.getPastEvents("BuyNow", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(BuyTemp, objTemp) === false) 
                {
                    BuyTemp = objTemp;

                    console.log("---------------------- BuyNow event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var seller = data.returnValues.seller;
                    var buyer = data.returnValues.buyer;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');

                    var buyer_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + buyer, "i") }
                    }, { _id: 1 });
                    buyer_id = buyer_id[0]._id;
                    var seller_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + seller, "i") }
                    }, { _id: 1 });
                    seller_id = seller_id[0]._id;
                    console.log("buyer_id = ", buyer_id, ", seller_id = ", seller_id);

                    var promise = [];
                    var find_update = Item.findByIdAndUpdate(tokenHash, {
                        owner: buyer_id,
                        price: item_price,
                        auctionPrice: 0,
                        auctionPeriod: 0,
                        bids: [],
                        isSale: 0
                    });
                    promise.push(find_update);
                    var sale = new Sale({
                        item: tokenHash,
                        owner: seller_id,
                        buyer: buyer_id,
                        price: item_price
                    });
                    promise.push(sale.save());
                    await Promise.all(promise).then((result) => {
                        const new_notify = new Notify(
                        {
                            imgUrl: "notify_icons/AVAX_logo.png",
                            subTitle: "Item is sold",
                            description: "Item " + result[0].name + " is sold with price " + item_price,
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 7
                        });
                        new_notify.save(function (err) {
                            if (!err) {
                            }
                        });
                        io.sockets.emit("UpdateStatus", { type: "BUY_NOW" });
                    })
                    .catch((err) => {
                        console.log("BuyNow error : ", err)
                    })

                    console.log("---------------------- end of BuyNow event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
        console.log("Something went wrong 5: " + error.message)
    }
}

const EndBid_monitor = async (blockNumber) => {

    try {
        var event = await myContract.getPastEvents("EndBid", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(EndTemp, objTemp) === false)
                {
                    EndTemp = objTemp;

                    console.log("---------------------- EndBid event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var seller = data.returnValues.seller;
                    var buyer = data.returnValues.buyer;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');
                
                    var buyer_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + buyer, "i") }
                    }, { _id: 1 });
                    buyer_id = buyer_id[0]._id;
                    var seller_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + seller, "i") }
                    }, { _id: 1 });
                    seller_id = seller_id[0]._id;
                    // console.log("buyer_id = ", buyer_id, ", seller_id = ", seller_id);

                    var promise = [];
                    var find_update = Item.findByIdAndUpdate(tokenHash, {
                        owner: buyer_id,
                        price: item_price,
                        auctionPrice: 0,
                        auctionPeriod: 0,
                        bids: [],
                        isSale: 0
                    });
                    promise.push(find_update);
                    var sale = new Sale({
                        item: tokenHash,
                        owner: seller_id,
                        buyer: buyer_id,
                        price: item_price
                    });
                    promise.push(sale.save());
                    await Promise.all(promise).then((result) => {
                        const new_notify = new Notify(
                        {
                            imgUrl: "notify_icons/AVAX_logo.png",
                            subTitle: "Item is sold",
                            description: "Item " + result[0].name + " is sold with price " + item_price,
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 7
                        });
                        new_notify.save(function (err) {
                            if (!err) {
                            }
                        });                        
                        io.sockets.emit("UpdateStatus", { type: "END_BID" });
                    })
                    .catch((err) => {
                        console.log("BuyNow error : ", err)
                    })

                    console.log("---------------------- end of EndBid event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
        console.log("Something went wrong 6: " + error.message)
    }
}

const TransferNFT_monitor = async (blockNumber) => {
    try {
        var event = await myContract.getPastEvents("TransferNFT", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(TransferTemp, objTemp) === false) 
                {
                    TransferTemp = objTemp;
                    
                    console.log("---------------------- TransferNFT event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var sender = data.returnValues.sender;
                    var receiver = data.returnValues.receiver;

                    var sender_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + sender, "i") }
                    }, { _id: 1 });
                    sender_id = sender_id[0]._id;
                    var receiver_id = await User.find({
                        address:
                            { $regex: new RegExp("^" + receiver, "i") }
                    }, { _id: 1 });
                    receiver_id = receiver_id[0]._id;
                    
                    await Item.findByIdAndUpdate(tokenHash, {
                        owner: receiver_id,
                        auctionPrice: 0,
                        auctionPeriod: 0,
                        bids: [],
                        isSale: 0
                    }).then((result) => {
                        const new_notify = new Notify(
                        {
                            imgUrl: result.logoURL,
                            subTitle: "NFT is transfered.",
                            description: "Item " + result.name + " is transfered ",
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 8
                        });
                        new_notify.save(function (err) 
                        {
                            if (!err) {
                            }
                        });
                        io.sockets.emit("UpdateStatus", { type: "TRANSFER_NFT" });
                    })
                    .catch((err) => {
                        console.log("transferNFT error : ", err)
                    })

                    console.log("---------------------- end of TransferNFT event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
        console.log("Something went wrong 7: " + error.message)
    }
}

const BurnNFT_monitor = async (blockNumber) => {
    try {
        var event = await myContract.getPastEvents("BurnNFT", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(BurnTemp, objTemp) === false) 
                {
                    BurnTemp = objTemp;

                    console.log("---------------------- BurnNFT event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    
                    Item.findOneAndDelete({ _id: new ObjectId(tokenHash) }).then((data) => {
                        const new_notify = new Notify(
                        {
                            imgUrl: "notify_icons/Item_deleted.png",
                            subTitle: "A nft is burned.",
                            description: "Item " + data.name + " is burned.",
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 4
                        });
                        new_notify.save(function (err) {
                            if (!err) {
                            }
                        });
                        io.sockets.emit("UpdateStatus", { type: "BURN_NFT" });

                    }).catch(() => {
                        ////res.send({ code: 1 });
                    });

                    console.log("---------------------- end of BurnNFT event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
       console.log("Something went wrong 8: " + error.message)        
    }
}

const ChangePrice_monitor = async (blockNumber) => 
{
    try {
        var event = await myContract.getPastEvents("ChangePrice", { fromBlock: blockNumber });
        if (event.length > 0) 
        {
            let i;
            for(i=0; i<event.length; i++)
            {
                let data = event[i];
                let objTemp = data.returnValues;
                objTemp.transactionHash = data.transactionHash;
                if (compareObjects(ChangePriceTemp, objTemp) === false) 
                {
                    ChangePriceTemp = objTemp;

                    console.log("---------------------- ChangePrice event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var newPrice = data.returnValues.newPrice;
                    var interval = Number(data.returnValues.interval) / (24 * 3600);

                    var param = { price: 0 };
                    let item_price = web3WS.utils.fromWei(newPrice !== null ? newPrice.toString() : '0', 'ether');

                    if (interval == 0) {
                        param.isSale = 1;
                        param.price = item_price;
                        param.auctionPeriod = 0;
                        param.auctionPrice = 0;
                    } else {
                        param.isSale = 2;
                        param.auctionPrice = item_price;
                        param.auctionPeriod = interval;
                    }

                    await Item.findByIdAndUpdate(tokenHash, param)
                    .then((result) => {
                        const new_notify = new Notify(
                        {
                            imgUrl: result.logoURL,
                            subTitle: "NFT's price updated.",
                            description: "Item " + result.name + " 's price was changed ",
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 1
                        });
                        new_notify.save(function (err) {
                            if (!err) {
                            }
                        });
                        io.sockets.emit("UpdateStatus", { type: "CHANGE_PRICE" });
                    })
                    .catch((err) => {
                        console.log("change price error : ", err)
                    })

                    console.log("---------------------- end of ChangePrice event --------------------")
                    console.log("");
                }
            }
        }

    } catch (error) {
        console.log("Something went wrong 9: " + error.message );
    }
}

/*
    event SetTokenUri(uint256 tokenId, string uri);
    event CreateToken(address to, uint256 tokenId, uint256 amount, address nftAddress);
    event MintSingleNFT(string tokenHash, uint256 tokenId);
    event CreateSale(address seller, string tokenHash, uint256 tokenId, uint256 interval, uint256 price, uint8 kind);
    event DestroySale(address seller, string tokenHash, uint256 tokenId);
    event PlaceBid(address bidder, uint256 price, string tokenHash, uint256 tokenId);
    event AcceptBid(address caller, address seller, address buyer, uint256 price, string tokenHash, uint256 tokenId, RoyaltyInfo royaltyInfo);
    event EndBid(address caller, address seller, address buyer, uint256 price, string tokenHash, uint256 tokenId, RoyaltyInfo royaltyInfo);
    event BuyNow(address caller, address seller, address buyer, uint256 price, string tokenHash, uint256 tokenId, RoyaltyInfo royaltyInfo);
    event SetAuthentication(address sender, address addr, uint256 flag);
    event SetMintingFee(address sender, address creator, uint256 amount);
    event SetRoyalty(address sender, RoyaltyInfo info);
    event CustomizedTransfer(address sender, address to, uint256 amount, uint8 kind);
    event TransferNFTOwner(address sender, address to);
    event ChangePrice(address sender,string tokenHash, uint256 oldPrice, uint256 newPrice);
    event TransferNFT(address sender, address receiver, string tokenHash, uint256 tokenId);
    event BurnNFT(address sender, string tokenHash, uint256 tokenId);
*/

