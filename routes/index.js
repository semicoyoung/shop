var crypto = require('crypto'),
    User = require('../models/user.js'),
    Commodity = require('../models/commodity.js'),
    Cart = require('../models/cart.js'),
	Address = require('../models/address.js');

module.exports = function(app) {
 app.get('/', function (req, res) {
  Commodity.getAll(null, function (err, commoditys) {
    if (err) {
      commoditys = [];
    } 
    res.render('index', {
      title: '主页',
      user: req.session.user,
      commoditys: commoditys,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!'); 
      return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: name,
        password: password,
        email: req.body.email
    });
    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');
      }
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功!');
        res.redirect('/');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    }); 
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!'); 
        return res.redirect('/login');
      }
      if (user.password != password) {
        req.flash('error', '密码错误!'); 
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');
    });
  });

  app.get('/addcommodity', checkLogin);
  app.get('/addcommodity', function (req, res) {
    res.render('addcommodity', {
      title: '添加',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

app.post('/addcommodity', checkLogin);
app.post('/addcommodity', function (req, res) {
  var currentUser = req.session.user,
      commodity = new Commodity(currentUser.name, req.body.cname, req.body.cimage,req.body.cprice);
  commodity.save(function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/');//发表成功跳转到主页
  });
});

  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });


app.get('/order',checkLogin);
app.get('/order',function(req,res) {
		res.render('order', {
			title: '订单列表',
			user: req.session.user,
			success: req.flash('success').toString(),
      error: req.flash('error').toString()
  });
});

app.post('/order',checkLogin);
app.post('/order',function(res,req){
});

app.get('/search', function (req, res) {
  Commodity.search(req.query.keyword, function (err, commoditys) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('search', {
      title: "搜索:" + req.query.keyword,
      commoditys: commoditys,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});


app.get('/u/:name', function (req, res) {
  //检查用户是否存在
  User.get(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/');//用户不存在则跳转到主页
    }
    //查询并返回该用户的所有文章
    Commodity.getAll(user.name, function (err, commoditys) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      } 
      res.render('user', {
        title: user.name,
        commoditys: commoditys,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  }); 
});


app.get('/u/:name/:day/:cname', function (req, res) {
  Commodity.getOne(req.params.name, req.params.day, req.params.cname, function (err, commodity) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('goods', {
      title: req.params.cname,
      commodity: commodity,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

app.get('/cart',checkLogin);
app.get('/cart', function (req, res) {
        var state = 1;
        Cart.get(req.session.user, state, function (err, carts) {
            if (err) {
                res.redirect('/');
            }
			Address.get(req.session.user,state,function(err,adds){
				if(err){
					return res.redirect('/index');			
				}
				Cart.getNum(req.session.user,function(err,num){
					if(err){
						return res.redirect('/index');			
					}
					res.render('cart',{
						title:'我的购物车',
						user:req.session.user,
						carts:carts,
						adds:adds,
						num:num,
						success:req.flash('success').toString(),
						error:req.flash('error').toString()
					});
				});
			});



          /*  res.render('cart', {
                title: "购物车",
                user: req.session.user,
                carts: carts,
                seccess: req.flash('success').toString(),
                error:req.flash('error').toString()
            });*/
        });
    });

/*
app.post('/cart/addtocart',checkLogin);
app.post('/cart/addtocart',function(req,res){
	var cname=req.body.cname;
	Cart.addtocart(req.session.user,cname,function(err,cart){
		if(cart){
			return res.json({success:1});			
		}
		res.json({success:2});
	});
});

*/


app.post('/cart',checkLogin);
app.post('/cart',function(req,res){
		var cid=parseInt(req.body.cid);
		var cname=req.body.cname;
		var ciamge=req.body.cimage;
		var cprice=req.body.cprice;
		var name=req.body.name;
		//var state=1;
		Commodity.get(cid,function(err,commodity){
			if(err){
				return res.redirect('/index');			
			}
			var camount=1;
			var state=1;
			var cart=new Cart({
				"cid":cid,
				"cname":cname,
				"cimage":ciamge,
				"cprice":cprice,
				"camount":camount,
				"state":state,
				"uname":req.session.user,
				"name":name
			});
			cart.save(function(err,carts){
				if(err){
					return res.redirect('/index');			
				}
				if(carts){
					//res.json({success:2});
				}
				//res.json({success:1});	
			});
		});
	});



app.post('/cart/modify',checkLogin);
app.post('/cart/modify',function(req,res){
		var cartid=req.body.cart._id;
		var camount=parseInt(req.body.camount);
		Cart.modify(req.session.user,cartid,camount,function(err,cart){

			if(err){
				return res.json({success:2});
			}
			res.json({success:1});
		});
	});


/*
app.post('/cart/change',checkLogin);
app.post('/cart/change',function(req,res){
	var cname=req.body.cname;
	var camount=req.body.camount;	
	
	Cart.change(req.session.user,cname,camount,function(err,cart){
		if(cart){
			return res.json({success:1});			
		}
		res.json({success:2});
	});
});
*/
app.post('/cart/del',checkLogin);
app.post('/cart/del',function(req,res){
	var cartid=req.body.cart._id;
	Cart.del(req.session,user,cartid,function(err,cart){
	if(cart){
		return res.json({success:1});	
	}	
	res.json({success:2});
	});
});


app.post('/address',checkLogin);
 	app.post('/address',function(req,res){
 		var ip=req.body.ip;
 		var who=req.body.who;
 		var phone=req.body.phone;
 		var address=new Address({
 			"name":req.session.user,
 			"ip":ip,
 			"who":who,
 			"phone":phone
 		});
 		address.save(function(err,address){
 			if(err){
 				return res.json({success:2});
 			}
 			res.json({success:1});
 		});
 	});

 	//app.post('/address/del') login
 	app.post('/address/del',checkLogin);
 	app.post('/address/del',function(req,res){
 		var aid=parseInt(req.body.aid);
 		Address.del(req.session.user,aid,function(err,adds){
 			if(err){
 				return  res.json({success:2});
 			}	
 			res.json({success:1});
 		});
 	});


  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!'); 
      res.redirect('back');
    }
    next();
  }
};
