const db = require("../../db");
const Collection = db.Collection;
const Follows = db.Follow;
const Users = db.User;
const Notify = db.Notify;
const {io} = require("../../socket");
const fs = require('fs');
const fsPromises = fs.promises;
const env = require("../../../env");
const upload_path = env.upload_path;

var ObjectId = require('mongodb').ObjectID;

exports.create = (req, res) => {
    
    console.log("creting collection 00");
    
    console.log("req.body = ", req.body);

    var reqItem = req.body;
    const collection = new Collection({
        name: reqItem.collectionName,
        logoURL: reqItem.collectionLogoURL,
        bannerURL: reqItem.collectionBannerURL,
        description: reqItem.collectionDescription,
        category: reqItem.collectionCategory,
        price: reqItem.price,
        metaData: reqItem.metaData,
        owner: ObjectId(reqItem.owner)
    });

    Collection.find({ name: reqItem.collectionName }, async function (err, docs) {
        if (err) {
            //res.status(501).send({ success: false, message: "Internal Server Error." });
        }
        if (docs.length > 0) {
            res.status(501).send({ success: false, message: "Collection name is duplicated." });
        } else {
            await fsPromises.mkdir(process.cwd() + upload_path + reqItem.collectionName, { recursive: true })
                .then(function () {
                    console.log('Directory created successfully');

                    collection
                        .save()
                        .then(async (data) => {
                            console.log("Creating new collection succeed.");
                            
                            const new_notify = new Notify(
                            {
                                imgUrl : data.logoURL,
                                subTitle : "New collection is created.",
                                description: "Item "+data.name+" is created",
                                date : new Date(),
                                readers: [],
                                target_ids : [],
                                Type : 2
                            });
                            await new_notify.save(function(err)
                            {
                                if(!err)
                                {
                                    //io.sockets.emit("Notification");
                                }
                            });    
                            res.status(200).send(
                                { success: true, data, message: "New collection successfully created." }
                            );
                        })
                        .catch((err) => {
                            res.status(500).send({
                                success: false,
                                message: err.message || "Some error occurred while creating the collection.",
                            });
                        });
                }
                ).catch(function (err) {
                    console.log('failed to create directory. ', err);
                    let errno = err.errno;
                    if (errno === -4075) {
                        console.log("Collection dir already exists");

                        collection
                            .save()
                            .then(async (data) => {
                                console.log("Creating new collection succeed.");
                                const new_notify = new Notify(
                                {
                                    imgUrl : data.logoURL,
                                    subTitle : "New collection is created.",
                                    description: "Item "+data.name+" is created",
                                    date : new Date(),
                                    readers: [],
                                    target_ids : [],
                                    Type : 2
                                });
                                await new_notify.save(function(err)
                                {
                                    if(!err)
                                    {
                                        //io.sockets.emit("Notification");
                                    }
                                });    
                                res.status(200).send(
                                    { success: true, data, message: "New collection successfully created." }
                                );
                            }).catch((err) => {
                                res.status(500).send({
                                    success: false,
                                    message: err.message || "Some error occurred while creating the collection.",
                                });
                            });
                    }
                });
        }
    })
}

exports.get = (req, res) => {
    Collection.findOne({ _id: req.params.id }).populate("owner")
        .then((docs) => {
            if (docs !== null && docs !== undefined) res.status(200).send({ success: true, data: docs, message: "success" });
            else res.status(404).send({ success: false, data: [], message: "Can't find such asset." });
        })
        .catch((err) => {
            console.log("Collection doesn't exisit" + err.message);
            res.status(500).send({ success: false, message: "Internal server Error" });
        })
}

exports.update = async (req, res) => {
    try {
        await Collection.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    ...req.body
                },
                $currentDate: {
                    ends: true,
                }
            },
            { upsert: true }
        );
    } catch (err) {
        console.log("Updating collection : " + err.message);
        res.status(500).send({ success: false, message: "Internal server Error" });
        return;
    }
    console.log("Updating collection : succeed.");
    res.status(200).json({ success: true, message: "Successfully Update a Collection" })

}

exports.getHotCollections = (req, res) => {
    var limit = req.body.limit ? req.body.limit : 3;

    Collection.aggregate([

        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "items",
                localField: "items",
                foreignField: "_id",
                as: "item_info"
            }
        },
        {
            $unwind: "$item_info"
        },
        {
            $group: {
                _id: "$_id",
                like_count: {
                    $sum: {
                        $size: "$item_info.likes"
                    }
                }
            }
        },
        {
            $lookup: {
                from: "collections",
                localField: "_id",
                foreignField: "_id",
                as: "collection_info"
            }
        },
        {
            $unwind: "$collection_info"
        },
        {
            $lookup: {
                from: "items",
                localField: "collection_info.items",
                foreignField: "_id",
                as: "items_list"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "collection_info.owner",
                foreignField: "_id",
                as: "creator_info"
            }
        },

        {
            $unwind: "$creator_info"
        },
        { $limit: limit },
        { $sort: { like_count: -1 } }
    ]).then((data) => {
        res.send({ code: 0, data: data });
    }).catch(() => {
        res.send({ code: 1, data: [] });
    });

}

// param.price = price.value;
// param.likes = likes.value;
// param.creator = creator.value;
// param.range = range;


exports.getCollectionList = async (req, res) => {

    console.log("sort param", req.body);
    var category = req.body.category ? req.body.category : 0;
    var date = req.body.date;
    var start = req.body.start;
    var last = req.body.last;
    var creator = req.body.creator ? req.body.creator : 0;
    var likes = req.body.likes ? req.body.likes : 0;
    var price = req.body.price ? req.body.price : 0;
    var range = req.body.range ? req.body.range : null;
    var search = req.body.search? req.body.search : "";

    var creatorFilter = { $match: {} };
    var categoryFilter = { $match: {} };
    var dateSort = {};
    var likeSort = {};
    var priceSort = {};
    var rangeFilter = { $match: {} };
    var searchFilter = { $match: {} };


    if (search != "") {
        searchFilter = {
            $match: {
                "item_info.name": {
                    $regex: `.*${search}.*`,
                    $options: 'i'
                }
            }
        }
    }


    if (creator == 1) {
        //verified users list
        var userlist = await Users.find({ verified: true });
        var list = [];
        for (var i = 0; i < userlist.length; i++) {
            list.push(userlist[i]._id);
        }
        creatorFilter = { $match: { "item_info.creator": { "$in": list } } };
    }

    if (category != 0) {
        categoryFilter = {
            $match: { category: category }
        }
    }
    if (date == 0) {
        dateSort = { $sort: { "item_info.createdAt": -1 } };
    } else if (date == 1) {
        dateSort = { $sort: { "item_info.createdAt": 1 } };
    }

    if (likes == 0) {
        likeSort = { $sort: { "likes": -1 } };
    } else if (likes == 1) {
        likeSort = { $sort: { "likes": 1 } };
    }

    if (price == 0) {
        priceSort = { $sort: { "item_info.price": -1 } };
    } else if (price == 1) {
        priceSort = { $sort: { "item_info.price": 1 } };
    }

    if (range) {
        rangeFilter = { $match: { "item_info.price": { $gte: range[0] }, "item_info.price": { $lte: range[1] } } };
    }
    Collection.aggregate([
        categoryFilter,
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "items",
                localField: "items",
                foreignField: "_id",
                as: "item_info"
            }
        },
        {
            $unwind: "$item_info"
        },
        {
            $lookup: {
                from: 'users',
                localField: "item_info.creator",
                foreignField: "_id",
                as: "creator_info"
            }
        },
        {
            $unwind: "$creator_info"
        },
        {
            $lookup: {
                from: "users",
                localField: "item_info.owner",
                foreignField: "_id",
                as: "owner_info"
            }
        },
        {
            $unwind: "$owner_info"
        },
        {
            $project: {
                "item_info": 1,
                "creator_info": 1,
                "owner_info": 1,
                "likes": { $size: "$item_info.likes" }
            }
        },
        searchFilter,
        rangeFilter,
        creatorFilter,
        dateSort,
        likeSort,
        priceSort,
        {
            $limit: Number(last - start)
        },
        {
            $skip: Number(start)
        }
    ]).then((data) => {
        res.send({ code: 0, list: data });
    }).catch((error) => {
        res.send({ code: 1 });
    });

    // Collection
    //     .find(matchParams)
    //     // .find({collection_id: {category : 1}})
    //     .sort({ createdAt: req.body.date == 0 ? -1 : 0 })
    //     .skip(start).limit(last - start)
    //     .then((data) => {
    //         res.send({ code: 0, data: data });
    //     }).catch((error) => {
    //         res.send({ code: 1 });
    //     })
}

exports.getUserCollectionList = (req, res) => {
    const userId = req.params.userId;
    const limit = req.body.limit;

    Collection.find({ owner: ObjectId(userId) })
        .skip(0).limit(limit)
        .then((docs) => {
            res.status(200).send({ success: true, data: docs, message: "success" });
        })
        .catch((err) => {
            console.log("Hot collection doesn't exisit" + err.message);
            res.status(500).send({ success: false, message: "Internal server Error" });
        })
}

exports.getNewCollectionList = (req, res) => {
    Collection
        .find()
        .populate("owner")
        .sort({ createdAt: -1 })
        .limit(4)
        .then((data) => {
            res.send({ code: 0, data: data });
        })
        .catch(() => {
            res.send({ code: 1 });
        });
}

