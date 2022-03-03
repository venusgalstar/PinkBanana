const db = require("../../db");
const Sale = db.Sale;
var ObjectId = require('mongodb').ObjectID;

exports.buy = (req, res) => {
    var item = req.body.item_id;
    var owner = req.body.owner;
    var buyer = req.body.buyer;
    var price = req.body.price;

    var saleInfo = new Sale({
        item: ObjectId(item),
        owner: ObjectId(owner),
        buyer: ObjectId(buyer),
        price: price
    });
    saleInfo.save().then((data) => {
        res.send({ code: 0, data: data });
    }).catch((err) => {
        res.status(500).send({ code: 1, data: {} });
    });
}