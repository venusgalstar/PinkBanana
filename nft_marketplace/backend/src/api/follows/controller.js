const db = require("../../db");
const Follow = db.Follow;
var ObjectId = require('mongodb').ObjectID;
var User  = db.User;
var Item = db.Item;

exports.toggleFollow = (req, res) => 
{
    var my_id = req.body.my_id;
    var target_id = req.body.target_id;
    
    Follow.find({
        user_id: ObjectId(my_id),
        target_id: ObjectId(target_id)
    }).then((data) => {
        if(data.length === 0)
        {
            console.log("now creating...")
            //no pair, so create it
            var follow = new Follow({
                user_id: ObjectId(my_id),
                target_id: ObjectId(target_id)
            })
            follow.save().then((data) => {
                return res.status(200).send({ success: true, data: data, message: "Creating new follow succeed." });        
            }).catch((error) => {
                console.log("Creating new follow : error = ", error);
                return res.status(500).send({ success: false, message: "Internal server error" });
            });
        }
        else {
            console.log("now deleting...")
            //pair exiists, delete it
            Follow.deleteMany({
                user_id: ObjectId(my_id)
            }).then(() => {
                return res.status(200).send({ success: true, message: "Deleting a follow succeed." });        
            }).catch((error) => {
                console.log("Deleting a follow : error = ", error);
                return res.status(500).send({ success: false, message: "Internal server error" });
            });
        }
    }).catch((err) => {        
        console.log("Finding a follow : error = ", err);
        res.status(500).send({ success: false, message: "Internal server error" });
    })
    return;       
}

exports.getFollows = (req, res) => 
{
    var my_id = req.body.my_id;
    var resultObjectArry=[]; var j;
    Follow.find({user_id: new ObjectId(my_id) })
    .then(async (docs) => {
        if (docs !== null && docs !== undefined) 
        {
            // console.log("docs.length = ", docs.length);
            for(j = 0; j<docs.length; j++)
            {
                var resultObject = {};
                await User.find({_id: new ObjectId(docs[j].target_id)})
                .then(async (docs) =>{
                    // console.log(" secondary docs = ", docs);
                    let targetsFollowers = 0; let targetGallery = [];
                    if(docs.length === 0) {}
                    else{
                        resultObject.name = docs[0].username;
                        resultObject.avatar = docs[0].avatar;
                        resultObject.url = docs[0].customURL;
                        resultObject.buttonClass = "blue";
                        resultObject.buttonContent  = "Unfollow";    

                        await Follow.find({user_id: new ObjectId(my_id) })
                        .then((docs) => {
                            if(docs !== null) targetsFollowers =  docs.length;
                            else targetsFollowers = 0;
                        })
                        .catch((err) => {targetsFollowers = 0;})
                        resultObject.counter = targetsFollowers;

                        await Item.find({owner: new ObjectId(docs[0]._id)})
                        .skip(0).limit(5)
                        .then((docs) => {
                            if(docs.length === 0) targetGallery = [];
                            else for(i=0; i<docs.length; i++) 
                                targetGallery.push(docs[i].logoURL);
                        })
                        .catch((err) => {
                            targetGallery = [];
                        })
                        resultObject.gallery = targetGallery;
                    }
                })
                .catch((err) =>
                {
                    resultObject = {};
                })
                resultObjectArry.push(resultObject);
            }
            return res.status(200).send({ success: true, data: resultObjectArry, message: "success" });
        }
        else return res.status(404).send({ success: false, data: [], message: "Can't find such follow." });
    })
    .catch((err) =>
    {
        console.log("Follow doesn't exisit" + err.message);
        return res.status(500).send({ success: false, message: "Internal server Error" });
    })
}

exports.getFollowings = (req, res) => 
{
    var my_id = req.body.my_id;
    var resultObjectArry=[]; var j;
    Follow.find({target_id: new ObjectId(my_id) })
    .then(async (docs) => {
        if (docs !== null && docs !== undefined) 
        {
            // console.log("docs.length = ", docs.length);
            for(j = 0; j<docs.length; j++)
            {
                var resultObject = {};
                await User.find({_id: new ObjectId(docs[j].user_id)})
                .then(async (docs) =>{
                    // console.log(" secondary docs = ", docs);
                    let targetsFollowers = 0; let targetGallery = [];
                    if(docs.length === 0) {}
                    else{
                        resultObject.name = docs[0].username;
                        resultObject.avatar = docs[0].avatar;
                        resultObject.url = docs[0].customURL;
                        resultObject.buttonClass = "transparent";
                        resultObject.buttonContent  = "";    

                        await Follow.find({user_id: new ObjectId(my_id) })
                        .then((docs) => {
                            if(docs !== null) targetsFollowers =  docs.length;
                            else targetsFollowers = 0;
                        })
                        .catch((err) => {targetsFollowers = 0;})
                        resultObject.counter = targetsFollowers;

                        await Item.find({owner: new ObjectId(docs[0]._id)})
                        .skip(0).limit(5)
                        .then((docs) => {
                            if(docs.length === 0) targetGallery = [];
                            else for(i=0; i<docs.length; i++) 
                                targetGallery.push(docs[i].logoURL);
                        })
                        .catch((err) => {
                            targetGallery = [];
                        })
                        resultObject.gallery = targetGallery;
                    }
                })
                .catch((err) =>
                {
                    resultObject = {};
                })
                resultObjectArry.push(resultObject);
            }
            return res.status(200).send({ success: true, data: resultObjectArry, message: "success" });
        }
        else return res.status(404).send({ success: false, data: [], message: "Can't find such follow." });
    })
    .catch((err) =>
    {
        console.log("Follow doesn't exisit" + err.message);
        return res.status(500).send({ success: false, message: "Internal server Error" });
    })
}

exports.isExists = (req, res) =>
{
    var user_id = req.body.user_id;
    var target_id = req.body.target_id;
    console.log(user_id, target_id);
    Follow.find(
        {
            $or:
            [
                {user_id: new ObjectId(user_id), target_id: new ObjectId(target_id)},
                {target_id: new ObjectId(user_id), user_id: new ObjectId(target_id)}
            ]
        }
    )
    .then((docs) => {
        console.log("docs = ", docs);
        if(docs.length>0)
            res.status(200).send({
                success: true, data: true, message:"Pair exists"
            })
        else{            
            res.status(200).send({
                success: true, data: false, message:"No such pair"
            })
        }
    })
    .catch((err)=>{        
        res.status(200).send({
            success: false,  message:"Internal server error"
        })        
    })
}