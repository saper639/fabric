// Model name
exports.id = 'Fabric';
exports.version = '1.0';

NEWSCHEMA('Fabric').make(function(schema) {
	schema.define('id',      'Number'            		   );
	schema.define('name',    'String(50)',  true, 'add|upd');
	schema.define('title',   'String(150)', true, 'add|upd');
	schema.define('html',    'String',      true, 'add|upd');
	schema.define('code',    'String',            'add|upd');	
	schema.define('param',   'Object',            'add|upd');	
	schema.setResource('errors');
	

  	schema.setGet(function(error, model, o, callback){   
      var nosql = NOSQL('form');
      nosql.find().make(function(builder) {         
         builder.callback(function(err, resp) {
            return callback(resp||[]);    
         });
      });  		
  	})	

	//добавление и обновление формы
  	schema.setSave(function(error, model, self, callback) {
      var nosql = NOSQL('form');
      var isINSERT = (model.id ==0) ? true : false;              	   
  		var filtr = (isINSERT) ? '*add' : '*upd';  		    
      if (isINSERT) {             
              mess = 'mess_form_insert';
          } else {
              mess = 'mess_form_update';           
          } 
  		model = schema.clean(model);      
      if (isINSERT) {
        //insert
        nosql.count().make(function(builder) {
          builder.callback(function(err, resp) {
            model.id = resp+1;
            nosql.insert(model);
            console.log(model);
            return callback(SUCCESS(true, {mess: RESOURCE(mess).params(model), model: model}));  
          });
        });
      } else {
          //update
          nosql.update(model).make(function(builder) {
            builder.where('id', model.id);
            builder.callback(function(err, count) {
              return callback(SUCCESS(true, {mess: RESOURCE(mess).params(model), model: model}));     
            });
          })            
        }        
    })            
})	
