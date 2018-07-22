exports.install = function() {
	F.route('/fabric/form',      form_save,    ['authorize', 'post',   '*Fabric']);    
	F.route('/fabric/form',      form,         ['authorize', '@admin', '@manager', '*Fabric']);    
}

function form_save() {
	var self = this;	
	self.body.$save(self, self.callback());
}

function form() {
	var self = this;    		
	self.$get(self.query, self.callback());    	
}	
