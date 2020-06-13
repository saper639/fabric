exports.install = function() {
	F.route('/fabric/{name}',      	  fab_get,              ['*Fabric']);    
	F.route('/fabric/save',      	  fab_save,     ['post', '*Fabric']);    
	F.route('/fabric/query',     	  fab_query,            ['*Fabric']);    
}

function fab_get(name) {
}

function fab_save() {
	var self = this;    		
	self.body.$save(self, self.callback());
}	

function fab_query() {
	var self = this;    		
	self.$query(self.query, self.callback());    	
}	

