const db = require("../../db");
const Collection = db.Collection;


const Follows = db.Follow;
const Users = db.User;


var ObjectId = require('mongodb').ObjectID;



exports.create = (req, res) => {
    console.log(req.body);

    var reqItem = req.body;
    const collection = new Collection({
        name: reqItem.collectionName,
        logoURL: reqItem.collectionLogoURL,
        bannerURL: reqItem.collectionBannerURL,
        description: reqItem.collectionDescription,
        category: reqItem.collectionCategory,
        price: reqItem.price,
        owner: ObjectId(reqItem.owner)
    });

    collection
        .save()
        .then((data) => {
            res.send(data);
            console.log("Creating new collection succeed.");
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the User.",
            });
        });
}

exports.get = (req, res) => {
    Collection.findOne({ _id: req.params.id }).populate("owner")
        .then((docs) => {
            if (docs !== null && docs !== undefined) return res.status(200).send({ success: true, data: docs, message: "success" });
            else return res.status(404).send({ success: false, data: [], message: "Can't find such asset." });
        })
        .catch((err) => {
            console.log("Collection doesn't exisit" + err.message);
            return res.status(500).send({ success: false, message: "Internal server Error" });
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

    var creatorFilter = { $match: {} };
    var categoryFilter = { $match: {} };
    var dateSort = {};
    var likeSort = {};
    var priceSort = {};
    var rangeFilter = { $match: {} };

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
            return res.status(200).send({ success: true, data: docs, message: "success" });
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

