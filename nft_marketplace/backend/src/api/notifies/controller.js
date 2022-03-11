const { Notify } = require("../../db");
const db = require("../../db");
var ObjectId = require('mongodb').ObjectID;
const { io } = require("../../socket");



exports.CreateNotify = async (req, res) => {
    // console.log("CreateNotify post accept"); 
    const new_notify = new Notify(
        {
            ...req.body,
            readers: [],
            target_ids: []
        });
    await new_notify.save(function (err) {
        if (!err)
            res.status(200).send({ success: true, message: "Successfully create a new Notify" });
        else
            res.status(500).send({ success: false, message: "Internal server Error" });
    });
}

exports.markAllAsRead = async (req, res) => {
    const notifyIds = req.body.notifyIds;
    const userId = req.body.userId;
    var j; var query = {}, queryItem = {}, queryItemArry = [];
    // console.log("notifyIds = ", notifyIds, "userId = ", userId);
    for (j = 0; j < notifyIds.length; j++) {
        queryItem = { _id: new ObjectId(notifyIds[j]) };
        queryItemArry.push(queryItem);
    }
    query = {
        $or: queryItemArry
    }

    Notify.find(query).then(async (data) => {
        for (j = 0; j < data.length; j++) {
            var readers = data[j].readers;
            // console.log("readers of ", j, "th data[", j,"] = ", readers);
            if (readers !== undefined) {
                var index = data[j].readers.findIndex((element) => {
                    return element == userId;
                });
                if (index == -1) {
                    readers.push(new ObjectId(userId));
                    // console.log("push: ", readers, "index:", index);
                } else {
                    //readers = readers.splice(index, 0);
                    //console.log("slice:", readers, "index:", index);
                }
            }
            else readers = [new ObjectId(userId)];
            await Notify.findByIdAndUpdate(data[j]._id, {
                readers: readers
            }).then((ret) => {
                //res.send({code: 0, data: ret});
            }).catch((err) => {
                // console.log("[markAllAsRead] 0 error : ", err);
                res.status(500).send({
                    success: false, message: "Internal Server Error"
                });
            })
        }
        console.log("Updating Notify : succeed.");
        io.sockets.emit("UpdateStatus", { type: "ReadAllNotify" });
        res.status(200).json({ success: true, message: "Successfully Update the notifies." })
    })
    .catch((err) => {
        console.log("[markAllAsRead] 1 error : ", err);
        io.sockets.emit("UpdateStatus", { type: "ReadAllNotify" });
        res.status(500).send({
            success: false, message: "Internal Server Error"
        });
    })
}

exports.DeleteNotify = (req, res) => {
    // console.log("DeleteNotify 0");
    Notify.deleteOne({ _id: req.params.id }, function (err) {
        if (!err)
            res.status(200).send({ success: true, message: "Successfully delete a new Notify" });
        else
            res.status(500).send({ success: false, message: "Internal server Error" });
    });
}

//exception
exports.UpdateNotify = async (req, res) => {
    // console.log("UpdateNotify 0");
    try {
        await Notify.updateOne(
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
        console.log("Updating Notify : " + err.message);
        res.status(500).send({ success: false, message: "Internal server Error" });
        return;
    }
    console.log("Updating Notify : succeed.");
    res.status(200).json({ success: true, message: "Successfully Update a Notify" })
}

// modify
exports.FindNotify = (req, res) => {
    // console.log("FindNotify 0");
    Notify.find({}, function (err, docs) {
        if (err) {
            console.log("Notify doesn't exisit" + err.message);
            res.status(500).send({ success: false, message: "Internal server Error" });
        }
        else {
            res.status(200).send({ success: true, data: docs, message: "success" });
        }
    });
}

exports.getNotifiesByLimit = (req, res) => {

    var userId = req.body.userId ? req.body.userId : 0;
    var filter = req.body.filter ? req.body.filter : [];
    var typeFilter = { $match: {} };
    if (userId == 0) {
        res.status(500).send({ success: false, message: "Invalid user id" });
    }
    if (filter.length > 0) {
        typeFilter = { $match: { Type: { $in: filter } } };
    }
    Notify.aggregate([
        {
            $project: {
                createdAt: 1,
                date: 1,
                description: 1,
                imgUrl: 1,
                subTitle: 1,
                Type: 1,
                updatedAt: 1,
                target_ids: 1,
                readers: 1,
                is_new: {
                    $cond: {
                        if: {
                            $and: [
                                {
                                    $or: [{
                                        $eq: [{
                                            $size: "$target_ids"
                                        }, 0]
                                    }, {
                                        $in: [ObjectId(userId), "$target_ids"]
                                    }]
                                },
                                {
                                    $eq: [

                                        {
                                            $in: [ObjectId(userId), "$readers"]
                                        }
                                        ,
                                        false
                                    ]
                                }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        typeFilter,
        {
            $sort: {
                is_new: - 1,
                createdAt: - 1
            }
        }
    ])
        .skip(0)
        .limit(req.body.limit)
        .then((docs) => {
            res.status(200).send({ success: true, data: docs, message: "success" });
        }).catch((error) => {
            console.log("Notify doesn't exisit" + error.message);
            res.status(500).send({ success: false, message: "Internal server Error" });
        });
}

exports.FindOneNotify = (req, res) => {
    // console.log("FindOneNotify ");
    Notify.findOne({ _id: req.params.id }, function (err, docs) {
        if (err) {
            console.log("Notify doesn't exisit" + err.message);
            res.status(500).send({ success: false, message: "Internal server Error" });
        }
        else {
            if (docs !== null && docs !== undefined) res.status(200).send({ success: true, data: docs, message: "success" });
            else res.status(404).send({ success: true, data: [], message: "Can not find Notify" });
        }
    });
}

exports.getNotifiesByFilter = async (req, res) => {
    const filters = req.body.filters;
    var j; var query = {}, queryItem = {}, queryItemArry = [];
    // console.log("filters = ", filters, "userId = ", userId);
    for (j = 0; j < filters.length; j++) {
        queryItem = { Type: filters[j] };
        queryItemArry.push(queryItem);
    }
    query = {
        $or: queryItemArry
    }
    // console.log("query = ", query);
    Notify.find(query).then((data) => {
        console.log("Updating Notify : succeed.");
        res.status(200).json({ success: true, data: data, message: "Successfully Update the notifies." })
    })
        .catch((err) => {
            console.log("[markAllAsRead] 1 error : ", err);
            res.status(500).send({
                success: false, message: "Internal Server Error"
            });
        })
}
