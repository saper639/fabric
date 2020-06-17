exports.install = function() {	
	F.route('POST /fabric/save',     		['*Fabric --> @save']);    
	F.route('GET /fabric/query',            ['*Fabric --> @query']);    
}
