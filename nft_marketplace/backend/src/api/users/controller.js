const { Fav, mongoose, Collection } = require("../../db");
const db = require("../../db");
const Users = db.User;
const Sales = db.Sale;
const Favs = db.Fav;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const e = require("express");
const jwt_enc_key = require("../../../env").jwt_enc_key;
const admin_address = require("../../../env").admin_address;
const signIn_break_timeout = require("../../../env").signIn_break_timeout;
var ObjectId = require('mongodb').ObjectID;
const Items = db.Item;

exports.create = (req, res) => {
    console.log("[Create user] req.body = ", req.body);

    const user = new Users({
        address: req.body.address,
        username: req.body.username,
        customURL: req.body.customURL,
        avatar: req.body.avatar,
        userBio: req.body.userBio,
        websiteURL: req.body.websiteURL,
        banner: req.body.banner,
        verified: false,
        twitter: req.body.twitter,
        socials: req.body.socials,
        password: req.body.password
    });

    //avoid re - resistering     
    Users.find({ address: req.body.adderss }, function (err, docs) {
        if (err) {
            res.status(501).send({ success: false, message: "Internal Server Error." });
        }
        if (docs.length > 0) {
            res.status(501).send({ success: false, message: "Address is duplicated." });
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    res.status(501).send({ success: false, message: "Cannot save the new author." });
                }
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        res.status(501).send({ success: false, message: "Cannot save the new author." });
                    }
                    else {
                        user.password = hash;
                        user.save(function (err) {
                            if (!err)
                                res.status(200).send({ success: true, message: "Successfully create a new Author" });
                            else
                                res.status(501).send({ success: false, message: "Cannot save the new author." });
                        });
                    }
                })
            })
        }
    })

    // user
    //     .save()
    //     .then((data) => {
    //         res.send(data);
    //     })
    //     .catch((err) => {
    //         res.status(500).send({
    //             message: err.message || "Some error occurred while creating the User.",
    //         });
    //     });
}

exports.findAll = (req, res) => {
    const address = req.query.address;
    var condition = { address: { $regex: new RegExp(address), $options: "i" } };

    Users.find(condition)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message || "Some error occured while retrieving tutorials.",
            });
        });
}

exports.findOne = (req, res) => {
    const address = req.body.address;
    Users.findOne({ address: address })
        .then((data) => {
            if (!data) {
                res
                    .status(404)
                    .send({ message: "Not found User with address " + adderss });
            } else {
                res.send(data);
            }
        })
        .catch((err) => {
            res.status(500)
                .send({ message: "Error retrieving User with address = " + address });
        });
}

exports.getDetailById = (req, res) => {
    const usrId = req.params.userId;
    // console.log("usrId = ", usrId);
    Users.findOne({ _id: new ObjectId(usrId) })
        .then((data) => {
            if (!data) {
                res
                    .status(404)
                    .send({ success: false, message: "Not found User with id " + usrId });
            } else {
                res.status(200).send({ success: true, data, message: "Getting detailed user info succeed" });
            }
        })
        .catch((err) => {
            res.status(500)
                .send({ message: "Error retrieving User with address = " + address });
        });
}

exports.update = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            success: false,
            message: "Data to update can not be empty!",
        });
    }

    // console.log("update 000"),
    // console.log("req.body = ", req.body);

    Users.findByIdAndUpdate(
        ObjectId(req.params.id),
        {
            ...req.body
        },
        { useFindAndModify: false }
    )
        .then((data) => {
            if (!data) {
                res.status(404).send({
                    success: false,
                    message: `Cannot update User. Maybe User was not found.`,
                });
            } else res.status(200).send({
                success: true,
                message: "User was updated successfully"
            });
        })
        .catch((err) => {
            console.log("User updating error : ", err);
            res.status(500).send({
                success: false,
                message: "Error updating User "
            });
        });
}

exports.delete = (req, res) => {
    const id = req.params.id;

    Users.findByIdAndRemove(id)
        .then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete User with id = ${id}. Maybe User was not found.`,
                });
            } else {
                res.send({
                    message: "User was deleted successfully!",
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete User with id = " + id,
            });
        });
}

exports.deleteAll = (req, res) => {
    Users.deleteMany({})
        .then((data) => {
            res.send({
                message: `${data.deletedCount} Users were deleted succesfully!`,
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all Users.",
            });
        });
};

exports.getPopularUserList = async (req, res) => {
    var limit = req.body.limit ? req.body.limit : 10;
    var time = req.body.time ? req.body.time : 0;
    var timeStart = 1000;
    if (time == 1) {
        timeStart = Date.now() - 24 * 3600 * 1000;
    } else if (time == 2) {
        timeStart = Date.now() - 7 * 24 * 3600 * 1000;
    } else if (time == 3) {
        timeStart = Date.now() - 30 * 24 * 3600 * 1000;
    } else if (time == 4) {
        timeStart = Date.now() - 365 * 24 * 3600 * 1000;
    }

    try {

        var buyerList = [];
        var sellerList = [];

        var data = await Sales.aggregate([
            {
                $project: {
                    "_id": 1,
                    "item": 1,
                    "owner": 1,
                    "buyer": 1,
                    "price": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    created: {
                        $toLong: "$createdAt"
                    }
                }
            },
            {
                $match: {
                    "created": {
                        $gte: timeStart
                    }
                }
            },
            {
                $group: {
                    _id: "$buyer",
                    totalPrice: {
                        $sum: "$price"
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "buyer"
                }
            },
            {
                $unwind: "$buyer"
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "buyer._id",
                    foreignField: "target_id",
                    as: "follows"
                }
            },
            {
                $project: {

                    "buyer.password": 0
                }
            },
            {
                $limit: limit
            }
        ]);

        for (var i = 0; i < data.length; i++) {
            var item = data[i].buyer;
            item.totalPrice = data[i].totalPrice;
            item.follows = data[i].follows;
            buyerList.push(item);
        }

        var sellerData = await Sales.aggregate([
            {
                $project: {
                    "_id": 1,
                    "item": 1,
                    "owner": 1,
                    "buyer": 1,
                    "price": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    created: {
                        $toLong: "$createdAt"
                    }
                }
            },
            {
                $match: {
                    "created": {
                        $gte: timeStart
                    }
                }
            },
            {
                $group: {
                    _id: "$owner",
                    totalPrice: {
                        $sum: "$price"
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $lookup: {
                    from: "follows",
                    localField: "owner._id",
                    foreignField: "target_id",
                    as: "follows"
                }
            },
            {
                $project: {

                    "owner.password": 0
                }
            }, {

                $limit: limit
            }
        ]);

        for (var i = 0; i < sellerData.length; i++) {
            var item = sellerData[i].owner;
            item.totalPrice = sellerData[i].totalPrice;
            item.follows  = sellerData[i].follows;
            sellerList.push(item);
        }

        res.send({ code: 0, data: { buyer: buyerList, seller: sellerList } });
    } catch (e) {
        res.send({ code: 1, data: { buyer: [], seller: [] } });
    }
}

exports.login = (req, res) => {
    Users
        .findOne({
            address: {
                $regex: new RegExp(req.body.address, "i")
            }
        }, function (err, docs) {
            // console.log("req.body.address = ", req.body.address);
            if (err) {
                res.status(500).send({ success: false, message: "Internal server Error" });
                return;
            }
            // console.log("docs = ", docs);
            if (docs === undefined || docs === null) {
                res.status(404).send({ success: false, message: "You are unregistered customer." });
                return;
            }
            if (docs.password == undefined) {
                res.status(500).send({ success: false, message: "No registered password" });
            }
            else {
                // bcrypt.compare(req.body.password, docs.password).then(ismatch => {
                //     if (ismatch) {
                        const jwtToken = jwt.sign(
                            { id: docs._id, isAdmin: (docs.address === admin_address) ? 1 : 0, ...docs },
                            jwt_enc_key,
                            { expiresIn: signIn_break_timeout }
                        );
                        res.status(200).send({ success: true, token: jwtToken });
                //     } else {
                //         res.status(500).send({ success: false, message: "Password Wrong" });
                //     }
                // }).catch((err) => {
                //     res.status(500).send({ success: false, message: "Internal server Error" });
                //     return;
                // })
            }

            // console.log("docs.password = ", docs.password);
            // else{
            //      res.status(500).send({ success: false, message: "No registered password" });
            // }
        });

}

exports.getUploadUser = (req, res) => {
    var limit = req.body.limit ? req.body.limit : 4;
    Collection.aggregate([
        {
            $project: {
                owner: 1,
                createdAt: 1,
                itemLength: {
                    $size: "$items"
                }
            }
        },
        {
            $match: {
                itemLength: {
                    $gt: 0
                }
            }
        },
        {
            $sort: {
                createdAt: - 1
            }
        },
        {
            $group: {
                _id: "$owner",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "uploader"
            }
        },
        {
            $unwind: "$uploader"
        },
        {
            $project: {
                "uploader.password": 0
            }
        },
        {
            $limit: limit
        }
    ]).then((data) => {
        res.send({ code: 0, list: data });
    }).catch((error) => {
        res.send({ code: 1, list: [] });
    });
}


exports.setFav = (req, res) => {

    var user_id = req.body.user_id;
    var target_id = req.body.target_id;

    Items.findById(new ObjectId(target_id)).then((data) => {

        var likes = data.likes;
        var index = data.likes.findIndex((element) => {
            return element == user_id;
        });
        if (index == -1) {
            likes.push(user_id);
            console.log("push: ", likes, "index:", index);
        } else {
            likes = likes.splice(index, 0);
            console.log("slice:", likes, "index:", index);
        }
        Items.findByIdAndUpdate(target_id, {
            likes: likes
        }).then((ret) => {
            res.send({ code: 0, data: ret });
        }).catch(() => {
            res.send({ code: 1 });
        })

    }).catch(() => {
        res.send({ code: 1, message: "not found" });
    })


}

exports.putSale = (req, res) => {
    var item_id = req.body.item_id;
    var user_id = req.body.user_id;
    var price = req.body.price;
    var instant = req.body.instant;
    var period = req.body.period;

    var param = { price: price };

    if (instant) {
        param.isSale = 1;
        param.price = price;
    } else {
        param.isSale = 2;
        param.auctionPrice = price;
        param.auctionPeriod = period;
    }
    Items.findByIdAndUpdate(item_id, param).then((data) => {
        res.send({ code: 0 });
    }).catch(() => {
        res.send({ code: 1 });
    });
}

exports.removeSale = (req, res) => {
    var item_id = req.body.item_id;
    var user_id = req.body.user_id;
    Items.findByIdAndUpdate(item_id, {
        isSale: 0
    }).then((data) => {
        res.send({ code: 0, data: data });
    }).catch(() => {
        res.send({ code: 1, data: [] });
    })
}