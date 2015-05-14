var mongodb = require('./db');

function Cart(cart) {
    this.uid = cart.uid;    //购物车用户id
    this.cid = cart.cid;       //商品ID
    this.cname =cart.cname;     //商品名称
    this.cimage = cimage;       //商品图片
    this.cprice = cart.cprice;  //商品价格
    this.camount = cart.camount;  //购物车中商品数量
    this.cstatus = cart.cstatus;   //购物车中商品状态
    this.name = cart.name;     //收货人姓名
}


module.exports = Cart;


//保存新的cart
Cart.prototype.save = function (callback) {
   
    var date = new Date();

    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    };

    mongodb.open(function (err, db) {
        if (err) { callback(err); }
        db.collection('ids', function (err, collection) {
            collection.findAndModify({ "name": "cart" }, [], { $inc: { 'id': 1 } }, { new: true, upsert: true }, function (err, doc) {
                var newcart = {
                    "uid": cart.uid,
                    "cartid": doc.id,    //购物车id
                    "cid": cart.cid,    //商品id
                    "cname": cart.cname,
                    "cimage": cart.cimage,
                    "cprice": cart.cprice,
                    "camount": cart.camount,
                    "cstatus": 1,
                    "name": cart.name,
                    "time": time
                }

                db.collection('carts', function (err, colletion) {
                    if (err) {
                        mongodb.close();
                        callback(err);
                    }
                    collection.insert(newcart, { safe: true }, function (err, cart) {
                        mongodb.close();
                        callback(err, cart);
                    });
                });
            });
        });
    });
};
