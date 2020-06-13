exports.id = 'Fabric';
exports.version = '1.0';

NEWSCHEMA('Fabric').make(function(schema) {
	schema.define('id',      'Number'            		   );
	schema.define('type',    'String(50)',  true, 'add|upd');
	schema.define('name',    'String(150)', true, 'add|upd');
	schema.define('html',    'String',      true, 'add|upd');
	schema.define('code',    'String',            'add|upd');	
	schema.define('param',   'Object',            'add|upd');	
	//save
  	schema.setSave(function($) {
      	var nosql = NOSQL('fabric');
		var model = schema.clean($.model);        	  		  		
  		var isINSERT = (model.id ==0) ? true : false;       
  		var filtr = (isINSERT) ? '*add' : '*upd';  		    
  		//insert
  		if (isINSERT) {
  			nosql.count().make(function(builder) {
	         	builder.callback(function(err, resp) {
		            model.id = resp+1;
		            nosql.insert(model);		            
		            return $.callback(SUCCESS(true, model));  
	          	});
        	});
  		}   //update
  			else {
	  			nosql.update(model).make(function(builder) {
	            	builder.where('id', model.id);
	            	builder.callback(function(err, count) {
	              		return $.callback(SUCCESS(true, model));     
	            	});
	          	})            	
  			}	  		  	
    })	            
    //query
    schema.setQuery(function($) {
 		var nosql = NOSQL('fabric');		
		var o = $.options;
		nosql.find().make(function(builder) {			
			if (o.q) {
				builder.or();
				builder.search('name',  o.q);       					
				builder.search('title', o.q);       					
				builder.end();
			}
			builder.sort('name');
			builder.callback(function(err, resp) {
				return $.callback(resp||[]);                                     	
			})	
		})	
    })
})	