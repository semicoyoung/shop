var mongodb = require('./db'),
    markdown = require('markdown').markdown;


function Commodity(name, cname, cimage,cprice) {
  this.name = name;
  this.cname = cname;
  this.cimage = cimage;
  this.cprice = cprice;
}

module.exports = Commodity;

//存储一篇文章及其相关信息
Commodity.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var commodity = {
      name: this.name,
      time: time,
      cname: this.cname,
      cimage: this.cimage,
      cprice: this.cprice
  };
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 commoditys 集合
    db.collection('commoditys', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //将文档插入 commoditys 集合
      collection.insert(commodity, {
        safe: true
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null);//返回 err 为 null
      });
    });
  });
};

//读取文章及其相关信息
Commodity.getAll = function(name, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 commoditys 集合
    db.collection('commoditys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //根据 query 对象查询文章
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
     //解析 markdown 为 html
docs.forEach(function (doc) {   //原来是post,应该是name,title,post中的post，而不是posts集合中的单个post,因此将此处改为cimage(图片)
  doc.cimage = markdown.toHTML(doc.cimage);
});
        callback(null, docs);//成功！以数组形式返回查询的结果
      });
    });
  });
};


//获取一篇文章
Commodity.getOne = function(name, day, cname, callback) {
  //打开数据库
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 commoditys 集合
    db.collection('commoditys', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "name": name,
        "time.day": day,
        "cname": cname
      }, function (err, doc) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        //解析 markdown 为 html
        doc.cimage = markdown.toHTML(doc.cimage);
        callback(null, doc);//返回查询的一篇文章
      });
    });
  });
};


//返回通过标题关键字查询的所有文章信息
Commodity.search = function(keyword, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('commoditys', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var pattern = new RegExp(keyword, "i");
      collection.find({
        "cname": pattern
      }, {
        "name": 1,
        "time": 1,
        "cname": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
         return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};







