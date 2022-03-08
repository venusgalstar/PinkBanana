var Web3 = require('web3');
var ObjectId = require('mongodb').ObjectID;
const { io } = require("./socket");
const mainnet_ws_RPC = require("../env").mainnet_ws_RPC;
const testnet_ws_RPC = require("../env").testnet_ws_RPC;
const testnet_http_RPC = require("../env").testnet_http_RPC;
const bsc_testnet_ws_RPC = require("../env").bsc_testnet_ws_RPC;
const db = require("./db");
const User = db.User;
const Sale = db.Sale;
const Item = db.Item;
const Notify = db.Notify;

const pinkBananaFactoryABI = require("./PinkBananFactory.json");
const pinkBananaFactoryAddress = "0x66386374A9C090209efe26a8E86660FecC947504";

var web3WS = new Web3("https://api.avax-test.network/ext/bc/C/rpc"); //testnet_ws_RPC);
var myContract = new web3WS.eth.Contract(pinkBananaFactoryABI, pinkBananaFactoryAddress);

var scanBlockNumber = 0;
var maxBlockNumber = 7006157;


const getBlockNumber = () => {
    // while (1) {
    web3WS.eth.getBlockNumber()
        .then((number) => {
            if (maxBlockNumber < number) {
                maxBlockNumber = number;
                if (scanBlockNumber == 0) {
                    scanBlockNumber = number;
                }
                console.log("max block number", number);
            }
        }).catch((error) => { console.log("error:", error) });
    // }
    setTimeout(getBlockNumber, 100);
}

getBlockNumber();

const getData = async () => {
    if (scanBlockNumber != 0) {
        console.log('scan block number', scanBlockNumber);
       try {
           await CreateSale_monitor(scanBlockNumber);
           await DestroySale_monitor(scanBlockNumber);
           await PlaceBid_monitor(scanBlockNumber);
           await AcceptBid_monitor(scanBlockNumber);
           await BuyNow_monitor(scanBlockNumber);
           await EndBid_monitor(scanBlockNumber);
           scanBlockNumber++;
       } catch (e) {

       }
    }
    setTimeout(getData, 500);
}

getData();



// CreateSale_monitor(number);


const CreateSale_monitor = async (blockNumber) => {
    try {
        let oldReturnValues = {};

        // while (1) {
        var event = await myContract.getPastEvents("CreateSale", { fromBlock: blockNumber });
        // console.log("create sale event: ", event);
        if (event.length != 0) {
            let data = event[0];
            if (oldReturnValues !== data.returnValues) {
                oldReturnValues = data.returnValues;

                console.log("---------------------- CreateSale event --------------------")
                console.log(data.returnValues);

                var tokenHash = data.returnValues.tokenHash;
                var price = data.returnValues.price;
                var interval = Number(data.returnValues.interval) / (24 * 3600) ;

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
                Item.findByIdAndUpdate(tokenHash, param).then(async (data) => {
                    const new_notify = new Notify(
                        {
                            imgUrl: data.logoURL,
                            subTitle: "New sale is opened",
                            description: (auctionPeriod === 0 ? "An instnat sale is opened on " + data.name + " with price " + price
                                : "An auction is opened on " + data.name + " with price " + price),
                            date: new Date(),
                            readers: [],
                            target_ids: [],
                            Type: 1
                        });
                    await new_notify.save(function (err) {
                        if (!err) {
                            io.sockets.emit("Notification");
                        }
                    });
                }).catch(() => {
                    ////res.send({ code: 1 });
                });

                console.log("---------------------- end of CreateSale event --------------------")
                console.log("");
            }
        } else {
            return;
        }
        // }

    } catch (error) {
        return {
            success: false,
            status: "Something went wrong 1: " + error.message,
        };
    }
}

const DestroySale_monitor = async (blockNumber) => {
    try {

        let oldReturnValues = {};

        // while (1) {
            var event = await myContract.getPastEvents("DestroySale", { fromBlock: blockNumber });
            // console.log("destroy event: ", event);
            if (event.length != 0) {
                let data = event[0];
                if (oldReturnValues !== data.returnValues) {
                    oldReturnValues = data.returnValues;

                    console.log("----------------------DestroySale event--------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var param = { price: 0 };

                    if (instant) {
                        param.isSale = 0;
                        param.price = 0;
                    } else {
                        param.isSale = 0;
                        param.auctionPrice = 0;
                        param.auctionPeriod = 0;
                    }
                    Item.findByIdAndUpdate(tokenHash, param).then((data) => {
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
                                io.sockets.emit("Notification");
                            }
                        });
                    }).catch(() => {
                        ////res.send({ code: 1 });
                    });

                    console.log("---------------------- end of DestroySale event --------------------")
                    console.log("");
                }
            }
        // }

    } catch (error) {
        return {
            success: false,
            status: "Something went wrong 1: " + error.message,
        };
    }
}

const PlaceBid_monitor = async (blockNumber) => {
    try {

        let oldReturnValues = {};

        // while (1) {
            var event = await myContract.getPastEvents("PlaceBid", { fromBlock: blockNumber });
            // console.log("place bid:", event);
            if (event.length != 0) {
                let data = event[0];
                if (oldReturnValues !== data.returnValues) {
                    oldReturnValues = data.returnValues;

                    console.log("---------------------- PlaceBid event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var bidder = data.returnValues.bidder;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');

                    var bidder_id = await User.find({ address: bidder }, { _id: 1 });
                    bidder_id = bidder_id[0]._id;

                    Item.findById(tokenHash).then(async (data) => {

                        var bids = data.bids;
                        if (bids.length == 0 || bids[bids.length - 1].price < item_price) {
                            bids.push({ user_id: ObjectId(bidder_id), price: item_price, Time: Date.now() });
                            await Item.findByIdAndUpdate(tokenHash, { bids: bids }).then(async (data) => {
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
                                await new_notify.save(function (err) {
                                    if (!err) {
                                        io.sockets.emit("Notification");
                                    }
                                });
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
        // }

    } catch (error) {
        return {
            success: false,
            status: "Something went wrong 1: " + error.message,
        };
    }
}

const AcceptBid_monitor = async (blockNumber) => {
    try {

        let oldReturnValues = {};

        // while (1) {
            var event = await myContract.getPastEvents("AcceptBid", { fromBlock: blockNumber });
            // console.log('accept bid: ', event);
            if (event.length != 0) {
                let data = event[0];
                if (oldReturnValues !== data.returnValues) {
                    oldReturnValues = data.returnValues;

                    console.log("---------------------- AcceptBid event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');
                    var seller = data.returnValues.seller;
                    var buyer = data.returnValues.buyer;

                    var buyer_id = await User.find({ address: buyer }, { _id: 1 });
                    buyer_id = buyer_id[0]._id;
                    var seller_id = await User.find({ address: seller }, { _id: 1 });
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
                                    io.sockets.emit("Notification");
                                }
                            });
                        });
                    }).catch(() => {
                        ////res.send({ code: 1 });
                    })
                    console.log("---------------------- end of AcceptBid event --------------------")
                    console.log("");
                }
            }
        // }

    } catch (error) {
        return {
            success: false,
            status: "Something went wrong 1: " + error.message,
        };
    }
}

const BuyNow_monitor = async (blockNumber) => {
    try {

        let oldReturnValues = {};

        // while (1) {
            var event = await myContract.getPastEvents("BuyNow", { fromBlock: blockNumber });
            // console.log("buy now event", event);
            if (event.length != 0) {
                let data = event[0];
                if (oldReturnValues !== data.returnValues) {
                    oldReturnValues = data.returnValues;

                    console.log("---------------------- BuyNow event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var seller = data.returnValues.seller;
                    var buyer = data.returnValues.buyer;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');

                    var buyer_id = await User.find({ address: buyer }, { _id: 1 });
                    buyer_id = buyer_id[0]._id;
                    var seller_id = await User.find({ address: seller }, { _id: 1 });
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
                                io.sockets.emit("Notification");
                            }
                        });
                    })
                        .catch((err) => {
                            console.log("BuyNow error : ", err)
                        })

                    console.log("---------------------- end of BuyNow event --------------------")
                    console.log("");
                }
            }
        // }

    } catch (error) {
        return {
            success: false,
            status: "Something went wrong 1: " + error.message,
        };
    }
}

const EndBid_monitor = async (blockNumber) => {

    try {

        let oldReturnValues = {};

        // while (1) {
            var event = await myContract.getPastEvents("EndBid", { fromBlock: blockNumber });
            if (event.length != 0) {
                let data = event[0];
                if (JSON.stringify(oldReturnValues) !== JSON.stringify(data.returnValues)) {
                    oldReturnValues = data.returnValues;

                    console.log("---------------------- EndBid event --------------------")
                    console.log(data.returnValues);

                    var tokenHash = data.returnValues.tokenHash;
                    var seller = data.returnValues.seller;
                    var buyer = data.returnValues.buyer;
                    var price = data.returnValues.price;
                    let item_price = web3WS.utils.fromWei(price !== null ? price.toString() : '0', 'ether');

                    var buyer_id = await User.find({ address: buyer }, { _id: 1 });
                    buyer_id = buyer_id[0]._id;
                    var seller_id = await User.find({ address: seller }, { _id: 1 });
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
                                io.sockets.emit("Notification");
                            }
                        });
                    })
                        .catch((err) => {
                            console.log("BuyNow error : ", err)
                        })

                    console.log("---------------------- end of EndBid event --------------------")
                    console.log("");
                }
            }
        // }
    } catch (error) {
        return {
            success: false,
            status: "Something went wrong 1: " + error.message,
        };
    }
}


// CreateSale_monitor();
// DestroySale_monitor();
// PlaceBid_monitor();
// AcceptBid_monitor();
// BuyNow_monitor();
// EndBid_monitor();



module.exports = {
    CreateSale_monitor,
    DestroySale_monitor,
    PlaceBid_monitor,
    AcceptBid_monitor,
    BuyNow_monitor,
    EndBid_monitor
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

