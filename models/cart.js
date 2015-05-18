var mongodb = require('./db');

function Cart(cart) {
    this.uname = cart.uname;    //购物车用户名
    this.cid = cart.cid;       //商品ID
    this.cname =cart.cname;     //商品名称
    this.cprice = cart.cprice;  //商品价格
    this.camount = cart.camount;  //购物车中商品数量
    this.state = cart.state;   //购物车中商品状态
    this.name = cart.name;     //商家姓名(sold)
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

    var cart = {
        time: time,
        uname: this.uname,
        cid: this.cid,
        cname: this.cname,
        cprice: this.cprice,
        state: this.state,
        camount: this.camount,
		name: this.name
    }
    mongodb.open(function (err, db) {
        if (err) {
            callback(err);
        }
		/*
		db.colletcion('ids',function(err,collection){
			collection.findAndModify({"name":"cart",},[],{$inc:{'id':1}},{new:true,upsert:true},function(err,doc){
			
			var newcart={
			cartid: doc.id,
			uname: cart.uname,
			cid: cart.cid,
			cname: cart.cname,
			cprice: cart.cprice,
			state: 1,
			camount: cart.camount,
			name: cart.name,
			time: time
		}
		db.collection('carts',function(err,collection){
			if(err){
				mongodb.close();
				callback(err);				
			}
			collection.insert(newcart,{safe:true},function(err,cart){
				mongodb.close();
				callback(err,cart);				
});
});
	});
});

*/
        db.collection('carts', function (err, collection) {
            if (err) {
                mongodb.close();
                callback(err);
            }
            collection.insert(cart, {
                safe:true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};


Cart.get = function (uname, state, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        var query = {};
        if (uname) {
            query.uname = uname;
        }
        if (state) {
            query.state = state;
        }

        db.collection('carts', function (err, colletcion) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            colletcion.find(query).sort({ time: -1 }).toArray(function (err, carts) {
                mongodb.close();
                if (carts) {
                    callback(null, carts);
                }
                else {
                    callback(err, null);
                }
            }); 
        });
    });
};


/*
Cart.addtocart = function (uname, cname, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            callback(err);
        }
        db.collection('carts', function (err, cart) {
            cart.findOne({ "uname": uname, "cname": cname }, function (err, doc) {
                if (doc) {
                    cart.update({ "uname": uname, "cname": cname }, { $set: { camount: doc.acmount + 1 } }, function (err, doc) {
                        mongodb.close();
                        if (err) {
                            callback(err, null);
                        }
                        else {
                            callback(null,cart);
                        }
                    });
                }
                else {
                    db.collection('commoditys', function (err, commodity) {
                        commodity.findOne({ "cname": cname }, function (err, doc) {
                            if (doc) {
                                cart.create({
                                    uname: uname,
                                    cid: doc.cid,
                                    cname: cname,
                                    cprice: doc.cprice,
                                    state: doc.state,
                                    camount: 1
                                }, function (err, doc) {
                                    if (err) {
                                        mondodb.close();
                                        callback(err);
                                    }
                                    else {
                                        callback(null, cart);
                                    }
                                })
                            }
                        });
                    });
                }
            })
        });
    })
};

*/

Cart.del = function (uname, cartid, callback) {
    mongodb.open(function (err, db) {
        if (err) {
            callback(err);
        }

        db.collection('carts', function (err, collection) {
            if (err) {
                mongodb.close();
                callback(err);
            }
            collection.findAndModify({ "uname": uname, "._id": cartid }, [],{ $set: { "state": 0 } }, { new: true, upsert: true }, function (err, cart) {
                mongodb.close();
                if (cart) {
                    callback(null, cart);
                } else {
                    callback(err, null);
                }
            });
        });
    });
};


Cart.modify = function(uname,cartid,camount,callback){
    mongodb.open(function (err, db) {
        if (err) {
            callback(err);
        }
        db.collection('carts', function (err, collection) {
            if (err) {
                mongodb.close();
                callback(err);
            }
            collection.findAndModify({ "uname": uname, "._id": cartid }, [], { $inc: { "camount": camount } }, { new: true, upsert: true }, function (err, cart) {
                mongodb.close();
                if (err) {
                    callback(err,null);
                }
                else {
                    callback(null, cart);
                }
            });
        });
    });
};

Cart.getNum=function(uname,callback){
	
	mongodb.open(function(err,db){
	if(err){callback(err);}
	
	db.collection('carts',function(err,collection){
	if(err){mongodb.close();callback(err);}

	collection.find({"uname":uname,"state":1}).count(function(err,number){
		console.log("very good");
		mongodb.close();
			callback(null,number);
			});
		});
	});
};

Cart.buy=function(name,callback){
	
	var name=this.name;
	
	console.log(cart);
	mongodb.open(function(err,db){
	if(err){callback(err);}
	
	db.collection('users',function(err,collection){
	if(err){mongodb.close();callback(err);}
	
	collection.findAndModify({"name":name},[],{$set:{"carts.$.state":state}},{new:true,upsert:true},function(err,user){
	mongodb.close();
		if(user){
		callback(err,user);
		}else {
		callback(err,null);
		}
			});
		});
	});
};




