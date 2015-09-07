var mongodb=require('./db');

function Address(address){
	this.name=address.name;  //整个user的属性集合
	this.ip=address.ip;      //收货人地址
	this.who=address.who;     //收货人姓名
	this.phone=address.phone;   //收货人电话
}


module.exports=Address;

//保存一个地址
Address.prototype.save=function(callback){   
	var address={
		name: this.name,
		ip: this.ip,
		who: this.who,
		phone: this.phone

	};
	mongodb.open(function(err,db){
		
		if(err){return callback(err);}
		db.collection('ids',function(err,collection){
			collection.findAndModify({"name":"address"},[], {$inc:{'id':1}}, {new:true, upsert:true},function(err,doc){
				var newaddress={
					"aid":doc.id,
					"name":address.name,
					"ip":address.ip,
					"who":address.who,
					"phone":address.phone,
					"state":1
				}
				db.collection('adds',function(err,collection){
					if(err){mongodb.close();return callback(err);}
					collection.insert(newaddress,{safe:true}
						, function (err,adds) {
							mongodb.close();
							callback(err,adds);
						}); 
				});
			});
		});
	});
};

//获取地址

Address.get=function(name,state,callback){
	mongodb.open(function(err,db){
		if(err){callback(err);}

		db.collection('adds',function(err,collection){
			if(err){mongodb.close();callback(err);}
			var query={};
			if(name){
				query.name=name;
			}
			if(state){
				query.state=state;
			}
			collection.find(query).sort({aid:-1}).toArray(function(err,adds){

				mongodb.close();
				if(adds){
					
					callback(null,adds);

				}else {
					callback(err,null);
				}
			});
		});	
	});
};

//删除地址

Address.del=function(name,aid,callback){
	
	mongodb.open(function(err,db){
		if(err){callback(err);}
		
		db.collection('adds',function(err,collection){
			if(err){mongodb.close();callback(err);}
			collection.update({"name":name,"aid":aid,"state":1},{$set:{"state":0}},function(err){mongodb.close();
if(err){return callback(err);}
callback(null,1);
});


		});	
	});
};

