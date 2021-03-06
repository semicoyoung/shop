var mongodb = require('./db');

function Order(uname, order) {
    this.uname = uname;
    this.order = order;
};

module.exports = Order;



Order.save = function (carts, ip, who, phone, callback) {

    var date = new Date();

    var time = {
        date: date,
        year: date.getFullYear(),
        month: date.getFullYear() + "-" + (date.getMonth() + 1),
        day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };

    mongodb.open(function (err, db) {
        if (err) {
            callback(err);
        }
        db.collection('orders', function(err, collection) {
            if (err) {
                callback(err);
            }
            carts.forEach(function(cart, index) {
                var order = {
                    uname: cart.uname,
                    cid: cart.cid,
                    cname: cart.cname,
                    cimage: cart.cimage,
                    cprice: cart.cprice,
                    camount: cart.camount,
                    ip: ip,
                    who: who,
                    phone: phone,
                    time:time
                };
                collection.insert(order,{safe:true},function(err){
			mongodb.close();
			if(err){callback(err);}
			callback(null,1);			
		});
            });
        });
    });
};


Order.get = function (uname, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            callback(err);
        }
        db.collection('orders', function (err, collection) {
            if (err) {
                mongodb.close();
                callback(err);
            }
            var query = {};

            if (uname) {
                query.uname = uname;
            }
            collection.find(query).sort({ time: -1 }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }
                callback(null, docs);
            });
        });
    });
};



