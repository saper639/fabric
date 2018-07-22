exports.install = function() {
    //fabric
    F.route('/', view_fabric_form,  ['authorize','@admin']);

};	

function view_fabric_form() {
    var self = this;  
    self.layout('layout_split');
    self.view('fabric');                     
}
