exports.name = "db";
exports.version = "1.0";

//connect to db
if (CONFIG('db')) {
  var type = CONFIG('db').split(':')[0];
  if (type=='mysql') require('sqlagent/mysql').init(CONFIG('db')); 	  
  if (type=='postgresql') require('sqlagent/pg').init(CONFIG('db')); 	  
  if (type=='mongodb') require('sqlagent/mongodb').init(CONFIG('db')); 
}