const { Fav, mongoose, Collection } = require("../../db");
const db = require("../../db");
const Users = db.User;
const Sales = db.Sale;
const Favs = db.Fav;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const e = require("express");
const jwt_enc_key = require("../../../.env").jwt_enc_key;
const admin_address = require("../../../.env").admin_address;
const signIn_break_timeout = require("../../../.env").signIn_break_timeout;
var ObjectId = require('mongodb').ObjectID;
const Items = db.Item;

exports.create = (req, res) => 
{
    console.log("req.body = ", req.body);

    const user = new Users({
        address: req.body.address,
        username: req.body.username,
        customURL: req.body.customURL,
        avatar: req.body.avatar,
        userBio: req.body.userBio,
        websiteURL: req.body.websiteURL,
        banner: req.body.banner,
        verified: false,
        password: req.body.password,
    });

    bcrypt.genSalt(10, (err, salt) => 
    {
        if (err) {
            return res.status(501).send({ success: false, message: "Cannot save the new author." });
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return res.status(501).send({ success: false, message: "Cannot save the new author." });
            }
            else {
                user.password = hash;
                user.save(function (err) {
                    if (!err)
                        return res.status(200).send({ success: true, message: "Successfully create a new Author" });
                    else
                        return res.status(501).send({ success: false, message: "Cannot save the new author." });
                });
            }
        })
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
            // res.status(500)
            // .send({message: "Error retrieving User with address = " + address});
        });
}

exports.getDetailById = (req, res) => {
    const usrId = req.params.userId;
    console.log("usrId = ", usrId);
    Users.findOne({ _id: new ObjectId(usrId) })
        .then((data) => {
            if (!data) {
                res
                    .status(404)
                    .send({ success: false, message: "Not found User with id " + usrId });
            } else {
                res.status(200).send({success: true, data, message:"Getting detailed user info succeed"});
            }
        })
        .catch((err) => {
            // res.status(500)
            // .send({message: "Error retrieving User with address = " + address});
        });
}

exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!",
        });
    }

    // const address =  req.body.address;
    // const username =  req.body.username;
    // const customURL =  req.body.customURL;
    // const profilePhoto =  req.body.profilePhoto;
    // const userBio  = req.body.userBio;
    // const websiteURL =  req.body.websiteURL;
    // const userImg  =  req.body.userImg;
    // const verified = true;

    Users.findByIdAndUpdate(
        req.params.id,
        {
            ...req.body
        },
        { useFindAndModify: false }
    )
        .then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update User with id = ${id}. Maybe User was not found.`,
                });
            } else res.send({ message: "User was updated successfully" });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error updating User ",
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
    var limit = req.body.limit;
    var time = req.body.time;

    try {

        var buyerList = [];
        var sellerList = [];
        var data = await Sales.aggregate([
            { $group: { _id: "$buyer", totalPrice: { $sum: "$price" } } },
            { $limit: limit },
            { $sort: { totalPrice: -1 } }]);
        for (var i = 0; i < data.length; i++) {
            var user = await Users.findById(data[i]._id);
            buyerList.push(user);
        }

        var sellerdata = await Sales.aggregate([
            { $group: { _id: "$owner", totalPrice: { $sum: "$price" } } },
            { $limit: limit },
            { $sort: { totalPrice: -1 } }]);
        for (var i = 0; i < sellerdata.length; i++) {
            var user = await Users.findById(sellerdata[i]._id);
            sellerList.push(user);
        }

        res.send({ code: 0, data: { buyer: buyerList, seller: sellerList } });
    } catch (e) {
        res.send({ code: 1 });
    }
}

exports.login = (req, res) => {
    Users
        .findOne({ address: req.body.address }, function (err, docs) {
            // console.log("req.body.address = ", req.body.address);
            if (err) {
                res.status(500).send({ success: false, message: "Internal server Error" });
                return;
            }
            console.log("docs = ", docs);
            if (docs === undefined || docs === null) {
                res.status(404).send({ success: false, message: "You are unregistered customer." });
                return;
            }
            if (docs.password == undefined) {
                return res.status(500).send({ success: false, message: "No registered password" });
            }
            else {
                bcrypt.compare(req.body.password, docs.password).then(ismatch => {
                    if (ismatch) {
                        const jwtToken = jwt.sign(
                            { id: docs._id, isAdmin: (docs.address === admin_address) ? 1 : 0, ...docs },
                            jwt_enc_key,
                            { expiresIn: signIn_break_timeout }
                        );
                        return res.status(200).send({ success: true, token: jwtToken });
                    } else {
                        return res.status(500).send({ success: false, message: "Password Wrong" });
                    }
                }).catch((err) => {
                    res.status(500).send({ success: false, message: "Internal server Error" });
                    return;
                })
            }

            // console.log("docs.password = ", docs.password);
            // else{
            //     return res.status(500).send({ success: false, message: "No registered password" });
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
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "uploader_info"
            }
        },
        { $limit: limit }
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
        }).then((ret)=>{
            res.send({code: 0, data: ret});
        }).catch(()=>{
            res.send({code: 1});
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

    var param = {price: price};

    if (instant) {
        param.isSale = 1;
        param.price = price;
    } else {
        param.isSale = 2;
        param.auctionPrice = price;
        param.auctionPeriod = period;
    }    
    Items.findByIdAndUpdate(item_id, param).then((data)=>{
        res.send({code: 0});
    }).catch(()=>{
        res.send({code: 1});
    });
}

exports.removeSale = (req, res) => {
    var item_id = req.body.item_id;
    var user_id = req.body.user_id;
    Items.findByIdAndUpdate(item_id, {
        isSale : 0
    }).then((data)=>{
        res.send({code: 0, data: data});
    }).catch(()=>{
        res.send({code: 1, data: []});
    })
}