//'use strict';
//модель и функции для работы с Лэйаутоми
var Layout = {    
    //панель управления
    dash : {      
    	//Основной Лэйаут, значения по умолчанию
        Main : {                
            name: 'Main',
            north__maxSize: 100, 
            north__minSize: 50, 
            south__minSize: 50, 
            south__maxSize: 50,
            center__onresize: function() { Dash.resizeCenter(); 
                                           Dash.resizeMapPanel(); 
                                           setTimeout2('refresh', function() {  
                                              Dash.forScroll('.eventPanel', '.eScroll');					      	 
                                              Dt.resize(Dash.tbl.Damage, true);                                                                                            
                                              Dt.resize(Dash.tbl.Alarm, true);     
                                              Dt.resize(Dash.tbl.Gbr, true);
                                           }, 200 );                                                           
                                         },          
            stateManagement__enabled:	true                        
        },
        Part : {
        	name: 'Part',
        	west__paneSelector:  ".outer-west",
        	west__size:	   400,        	
        	west__minSize: 400, 
            west__maxSize: 700,
            center__paneSelector: ".outer-center",
            center__onresize: function() { Dash.resizeMapPanel(); 
                                           Dt.resize(Dash.tbl.Alarm, true);
                                           setTimeout2('refresh', function() {  
                                              Dash.forScroll('.eventPanel', '.eScroll'); 
                                              Dt.resize(Dash.tbl.Damage, true);
                                              Dt.resize(Dash.tbl.Alarm, true);
                                              Dt.resize(Dash.tbl.Gbr, true);
                                           }, 200 )
                                         },
            stateManagement__enabled:	true
        }
    },
    fab : {      
    	//Основной Лэйаут, значения по умолчанию
        Main : {                
            name: 'Main',
            north__maxSize: 100, 
            north__minSize: 50, 
            south__minSize: 50, 
            south__maxSize: 50,
            center__onresize: function() {  Fab.resizeCenter();
                                            setTimeout2('refresh', function() {  
                                              Fab.forScroll('.eventPanel', '.eScroll');                                                              
                                            }, 200 );  
                                         },          
            stateManagement__enabled:	true                        
        },
        Part : {
        	name: 'Part',
        	west__paneSelector:  ".outer-west",
        	west__size:	   '50%',        	
        	/*west__size:	   400,        	*/
        	//west__minSize: 400, 
            //west__maxSize: 700,
            center__paneSelector: ".outer-center",
            center__onresize: function() {  Fab.resizeCenter(); 
                                            setTimeout2('refresh', function() {  
                                              Fab.forScroll('.eventPanel', '.eScroll');                                                              
                                            }, 200 );  },
            stateManagement__enabled:	true
        }
    },
    track : {
      Part : {
          name: 'Part',
          west__paneSelector:  ".outer-west",
          west__size:    400,         
          west__minSize: 400, 
          west__maxSize: 700,
          center__paneSelector: ".outer-center",
          center__onresize: function() { Track.resizeMapPanel(); },
          stateManagement__enabled: true
      }
    }      	
}