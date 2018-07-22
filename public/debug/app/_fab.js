//'use strict';
var Fab = { 
	layout : {
		main  : undefined,
		part  : undefined
	},	
	tab : {  
		design : 'Html',          
        result : 'View',                     
    },      
    init : function() {
    	var self=this;
        ON('@resource', function(component) {      
            FIND('resource').download('/default.txt');    
        });           
    	self.layout.main = $('div.layout-top-nav').layout(Layout.fab.Main);
        self.resizeCenter();
        self.layout.part = $('#innerTabLayout').layout(Layout.fab.Part);                           
        self.updateDropDown();
    },	
    resizeCenter: function() {
		var self = this;        
		var brc = $('section.content-header').outerHeight();                        
		var lc = self.layout.main.center.state.outerHeight;  var h = lc-brc-60;                          		
		$('.mainPanels').css({'height': h+'px'});		
	},
	forScroll : function(parent, its) {
        var h=$(parent).outerHeight();                
        $(its).each(function(idx) {
            var mhh = $(this).position().top;                 
            $(this).css({'height': h-mhh-2+'px'});
        })                
    },
    liveView : function() {
    	var self = Fab;    	    	    	
    	$('#View').html(form.html + ('<script>'+form.code+'</script>'));
        if (self.temp && self.temp.name == form.param.jcpath) {
            SET(form.param.jcpath, self.temp.value)
        }
        WATCH('*', function(path, value) {            
            if (form && form.param && form.param.jcpath && path.indexOf(form.param.jcpath) !== -1) {
                self.temp = {name: form.param.jcpath, value: eval(form.param.jcpath)};
                SET('form.json', JSON.stringify(eval(form.param.jcpath), null, 4));    
            }                    
        });                    
    },
    formNew : function() {
        SET('form', undefined);
        $('#View').html('');
        $('#formSearch').val('');
    },
    updateDropDown : function() {
        var self = this;
        console.log('**');
        jC.AJAX('GET fabric/form', {}, (resp, err)=>{                        
            SET('Fab.chForm', resp);
        });          
    },    
    formSave : function() {
        var self = Fab;        
        if (!VALIDATE('form.*')) {
            toastr.error(RESOURCE('err_form'));
            return
        };
        jC.AJAX('POST /fabric/form', form, function(res, err) {            
            if (err) {
                toastr.error(RESOURCE('err_unexpected'));                
                return;
            }
            SET('form.id', res.value.model.id);
            self.updateDropDown();
            toastr.success(res.value.mess);
        })    
    }
}
