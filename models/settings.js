// Model name
exports.id = 'Settings';
exports.version = '1.0';

exports.init = function(callback) {
    var cfg = F.global.cfg;
    if (!cfg.path) cfg.path = {};
    if (!cfg.path.img) cfg.path.img = "/img/";    
        //скин по умолчанию
    if (!cfg.style) cfg.style = {};
    if (!cfg.style.skin) cfg.style.skin = "skin-blue";
        //описание фирмы
    if (!cfg.company) cfg.company = {};
    if (!cfg.company.shortname) cfg.company.shortname = "Fabric";
    if (!cfg.company.brand) cfg.company.brand = "";
    if (!cfg.company.name) cfg.company.name = "";
    if (!cfg.company.minilogo) cfg.company.minilogo = "";
    if (!cfg.company.logo) cfg.company.logo = "/img/logo.png";
    if (!cfg.company.web) cfg.company.web = "";
    if (!cfg.company.tel) cfg.company.tel = ""; 
    if (!cfg.company.email) cfg.company.email = ""; 
}

/**
 * Клиентская сборка проекта
 * @self  {[Controller]} 
 */
exports.scripts = function () {
    var p = {mn : {f: 'debug/main/',   t: 'app/main/'},
             ap : {f: 'debug/app/',    t: 'app/'},
             pl : {f: 'debug/plugins/',t: 'app/plugins/'} };
    // MAIN 
    F.merge(p.mn.t+'js/main.min.js',[p.mn.f+'jquery-2.2.4.min.js', 
                                     p.mn.f+'bootstrap/bootstrap.min.js', 
                                     p.mn.f+'AdminLTE/js/app.js', 
                                     p.mn.f+'fastclick/fastclick.min.js']);

    F.merge(p.mn.t+'js/comp.min.js', [ p.mn.f+'jcta.min.js',
                                       p.mn.f+'ui.js' ]);


    F.merge(p.mn.t+'css/main.css', [p.mn.f+'bootstrap/bootstrap.min.css', 
                                    p.mn.f+'AdminLTE/css/_all-skins.min.css', 
                                    p.mn.f+'AdminLTE/css/AdminLTE.min.css',                               
                                    p.mn.f+'font-awesome/css/font-awesome.css', 
                                    p.mn.f+'default.css', 
                                    p.mn.f+'indent.css', 
                                    p.mn.f+'font-awesome-animation.min.css']);

    F.map(p.mn.t+'img',   p.mn.f+'AdminLTE/img/', ['.png', '.gif', '.jpg']);
    F.map(p.mn.t+'fonts', p.mn.f+'bootstrap/fonts/', ['.otf', '.eot', '.svg', '.ttf', '.woff', '.woff2']);
    F.map(p.mn.t+'fonts', p.mn.f+'font-awesome/fonts/', ['.otf', '.eot', '.svg', '.ttf', '.woff', '.woff2']);  
    //APP
    F.merge(p.ap.t+'js/app.js', [p.ap.f+'_fab.js',
                                 p.ap.f+'layout.js']);    
    // UTILIT
    F.merge(p.pl.t+'utilit.min.js',[p.pl.f+'toastr/toastr.min.js']);
    F.merge(p.pl.t+'utilit.css', [p.pl.f+'toastr/toastr.min.css']);
    //PLUGINS
    F.map(p.pl.t+'jquery-ui',   p.pl.f+'jquery-ui');
}

