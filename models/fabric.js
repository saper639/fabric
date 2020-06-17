exports.id = 'Fabric';
exports.version = '1.0';

NEWSCHEMA('Fabric').make(function(schema) {
	schema.define('id',      'Number'            	   );
	schema.define('slug',    'String(100)', true, 'upd');
	schema.define('name',    'String(300)', true, 'upd');
	schema.define('html',    'String',      true, 'upd');
	schema.define('code',    'String',            'upd');	
	schema.define('param',   'Object',            'upd');	
	schema.define('dt',   	 'Date',              'upd');

	schema.setDefault(function(property, isntPreparing, schema) {
		if (property === 'dt')  return new Date();    
	})	

	//schem handler for db mysql, postgree, mongodb
	if (CONFIG('db')) {
		schema.setSave(function($) {
			var sql = DB();
			var model = schema.clean($.model);
			var isINSERT = (model.id ==0) ? true : false;            
			model.param = JSON.stringify(model.param);
			sql.save('fabric', 'fabric', isINSERT, function(builder, isINSERT) {
				builder.set(schema.filter('*upd', model));
				if (!isINSERT) {
	        		builder.where('id', model.id);	        
	      		}	      	     	      			  
			})	
			sql.exec(function(err, resp) {	    	
				if (err) {
					F.error(err, 'DB', 'Fabric/save');                    
		    		return $.invalid('!unexpected');		        
		    	}
   	      		if (isINSERT) { 
	           		model.id = resp.identity;                                   		
    	    	}      		
				return $.success(true, model);  
			}, 'fabric')	
		})	

		schema.setQuery(function($) {
			var sql = DB();
			var o = $.query;			
			sql.select('fabric', 'fabric').make(function(builder) {				
				if (o.id) builder.where('id', o.id);                	           
	    		if (o.slug) builder.where('slug', o.slug);        		
	    		if (o.q) {
					builder.scope(function() {                  
						builder.like('slug', o.q, '*');
						builder.like('name', o.q, '*');
					})	
				}
				builder.sort('name');
			});
			sql.exec(function(err, resp) {
			    if (err) {
			        F.error(err, 'DB', 'Fabric/query');
	    			return $.callback(null);
			    }    		
	    		return (o.first) ? $.callback(resp.first()||null) : $.callback(resp||[]);         
  			}, 'fabric');  	
		});			
	} //schem handler for default db nosql
	  else {
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
			var o = $.query;
			nosql.find().make(function(builder) {			
				if (o.id) builder.where('id', o.id);                	           
	    		if (o.slug) builder.where('slug', o.slug);        		
				if (o.q) {
					builder.or();
					builder.search('slug',  o.q);       					
					builder.search('name', o.q);       					
					builder.end();
				}
				builder.sort('name');
				builder.callback(function(err, resp) {
					return (o.list) ? $.callback(resp||[]) : $.callback(resp.first()||null);         					
				})	
			})	
	    })
	}	
})	