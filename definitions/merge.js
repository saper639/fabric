/**
 * Optimize resource
 */
var p={ vn : 'vendor/', ap : 'app/' };

MERGE('js/vendor.min.js',   [ p.vn+'jquery/jquery-3.3.0.min.js',				
			  				  p.vn+'jcomponent/jcta.min.js',
                              p.vn+'bootstrap/bootstrap.min.js',                                   
                              p.vn+'fastclick/fastclick.min.js',                                  
                              p.vn+'splitter/splitter.js',                                                                
                            ]);

MERGE('css/vendor.min.css', [ p.vn+'bootstrap/bootstrap.css',                                                                       
	                          p.vn+'font-awesome/css/font-awesome.css',
	                          p.vn+'splitter/splitter.css',              	                          
                            ]);

MERGE('css/app.min.css',  	[ p.ap+'css/indent.css',
				 			  p.ap+'css/style.css', 
                              p.ap+'css/ui.css']);

MERGE('js/app.min.js',      [p.ap+'js/ui.js']);

MAP('fonts', p.vn+'font-awesome/fonts/', ['.otf', '.eot', '.svg', '.ttf', '.woff', '.woff2']);



