/*TEXTBOX*/
COMPONENT('textbox', function(self, config) {

	var input, content = null, isfilled = false;
	var innerlabel = function() {
		var is = !!input[0].value;
		if (isfilled !== is) {
			isfilled = is;
			self.tclass('ui-textbox-filled', isfilled);
		}
	};

	self.nocompile && self.nocompile();

	self.validate = function(value) {

		if ((!config.required || config.disabled) && !self.forcedvalidation())
			return true;

		if (self.type === 'date')
			return value instanceof Date && !isNaN(value.getTime());

		if (value == null)
			value = '';
		else
			value = value.toString();

		EMIT('reflow', self.name);

		if (config.minlength && value.length < config.minlength)
			return false;

		switch (self.type) {
			case 'email':
				return value.isEmail();
			case 'phone':
				return value.isPhone();
			case 'url':
				return value.isURL();
			case 'currency':
			case 'number':
				return value > 0;
		}

		return config.validation ? !!self.evaluate(value, config.validation, true) : value.length > 0;
	};

	self.make = function() {

		content = self.html();

		self.type = config.type;
		self.format = config.format;

		self.event('click', '.fa-calendar', function(e) {
			if (!config.disabled && !config.readonly && config.type === 'date') {
				e.preventDefault();
				SETTER('calendar', 'toggle', self.element, self.get(), function(date) {
					self.change(true);
					self.set(date);
				});
			}
		});

		self.event('click', '.fa-caret-up,.fa-caret-down', function() {
			if (!config.disabled && !config.readonly && config.increment) {
				var el = $(this);
				var inc = el.hclass('fa-caret-up') ? 1 : -1;
				self.change(true);
				self.inc(inc);
			}
		});

		self.event('click', '.ui-textbox-label', function() {
			input.focus();
		});

		self.event('click', '.ui-textbox-control-icon', function() {
			if (config.disabled || config.readonly)
				return;
			if (self.type === 'search') {
				self.$stateremoved = false;
				$(this).rclass('fa-times').aclass('fa-search');
				self.set('');
			} else if (self.type === 'password') {
				var el = $(this);
				var type = input.attr('type');

				input.attr('type', type === 'text' ? 'password' : 'text');
				//el.rclass2('fa-').aclass(type === 'text' ? 'fa-eye' : 'fa-eye-slash');
			} else if (config.iconclick)
				EXEC(config.iconclick, self);
		});

		self.event('focus', 'input', function() {
			if (!config.disabled && !config.readonly && config.autocomplete)
				EXEC(config.autocomplete, self);
		});

		self.event('input', 'input', innerlabel);
		self.redraw();
		config.iconclick && self.configure('iconclick', config.iconclick);
	};

	self.setter2 = function(value) {
		if (self.type === 'search') {
			if (self.$stateremoved && !value)
				return;
			self.$stateremoved = !value;
			self.find('.ui-textbox-control-icon').tclass('fa-times', !!value).tclass('fa-search', !value);
		}
		innerlabel();
	};

	self.redraw = function() {

		var attrs = [];
		var builder = [];
		var tmp = 'text';

		switch (config.type) {
			case 'password':
				tmp = config.type;
				break;
			case 'number':
			case 'phone':
				isMOBILE && (tmp = 'tel');
				break;
		}

		self.tclass('ui-disabled', !!config.disabled);
		self.tclass('ui-textbox-required', !!config.required);
		self.type = config.type;
		attrs.attr('type', tmp);
		config.placeholder && !config.innerlabel && attrs.attr('placeholder', config.placeholder);
		config.maxlength && attrs.attr('maxlength', config.maxlength);
		config.keypress != null && attrs.attr('data-jc-keypress', config.keypress);
		config.delay && attrs.attr('data-jc-keypress-delay', config.delay);
		config.disabled && attrs.attr('disabled');
		config.readonly && attrs.attr('readonly');
		config.error && attrs.attr('error');
	        config.class && attrs.attr('class', config.class);
        	config.id && attrs.attr('id', config.id);

		attrs.attr('data-jc-bind', '');

		if (config.autofill) {
			attrs.attr('name', self.path.replace(/\./g, '_'));
			self.autofill && self.autofill();
		} else {
			attrs.attr('name', 'input' + Date.now());
			attrs.attr('autocomplete', 'new-password');
		}

		config.align && attrs.attr('class', 'ui-' + config.align);
		!isMOBILE && config.autofocus && attrs.attr('autofocus');

		builder.push('<div class="ui-textbox-input"><input {0} /></div>'.format(attrs.join(' ')));

		var icon = config.icon;
		var icon2 = config.icon2;

		if (!icon2 && self.type === 'date')
			icon2 = 'calendar';
	/*	else if (!icon2 && self.type === 'password')
			icon2 = 'eye';*/
		else if (self.type === 'search')
			icon2 = 'search';

		icon2 && builder.push('<div class="ui-textbox-control"><span class="fa fa-{0} ui-textbox-control-icon"></span></div>'.format(icon2));
		config.increment && !icon2 && builder.push('<div class="ui-textbox-control"><span class="fa fa-caret-up"></span><span class="fa fa-caret-down"></span></div>');

		if (config.label)
			content = config.label;

		self.tclass('ui-textbox-innerlabel', !!config.innerlabel);

		if (content.length) {
			var html = builder.join('');
			builder = [];
			builder.push('<div class="ui-textbox-label">');
			icon && builder.push('<i class="fa fa-{0}"></i> '.format(icon));
			builder.push('<span>' + content + (content.substring(content.length - 1) === '?' ? '' : ':') + '</span>');
			builder.push('</div><div class="ui-textbox">{0}</div>'.format(html));
			config.error && builder.push('<div class="ui-textbox-helper"><i class="fa fa-warning" aria-hidden="true"></i> {0}</div>'.format(config.error));
			self.html(builder.join(''));
			self.aclass('ui-textbox-container');
			input = self.find('input');
		} else {
			config.error && builder.push('<div class="ui-textbox-helper"><i class="fa fa-warning" aria-hidden="true"></i> {0}</div>'.format(config.error));
			self.aclass('ui-textbox ui-textbox-container');
			self.html(builder.join(''));
			input = self.find('input');
		}
                if (config.class) { 
			self.find('.ui-textbox-input').rclass('ui-textbox-input');
                        self.find('.ui-textbox').rclass('ui-textbox'); 
			self.rclass('ui-textbox'); 
                } 
	};

	self.configure = function(key, value, init) {

		if (init)
			return;

		var redraw = false;

		switch (key) {
			case 'readonly':
				self.find('input').prop('readonly', value);
				break;
			case 'disabled':
				self.tclass('ui-disabled', value);
				self.find('input').prop('disabled', value);
				self.reset();
				break;
			case 'format':
				self.format = value;
				self.refresh();
				break;
			case 'required':
				self.noValid(!value);
				!value && self.state(1, 1);
				self.tclass('ui-textbox-required', value === true);
				break;
			case 'placeholder':
				input.prop('placeholder', value || '');
				break;
			case 'maxlength':
				input.prop('maxlength', value || 1000);
				break;
			case 'autofill':
				input.prop('name', value ? self.path.replace(/\./g, '_') : '');
				break;
			case 'label':
				if (content && value)
					self.find('.ui-textbox-label span').html(value);
				else
					redraw = true;
				content = value;
				break;
			case 'type':
				self.type = value;
				if (value === 'password')
					value = 'password';
				else
					self.type = 'text';
				self.find('input').prop('type', self.type);
				break;
			case 'align':
				input.rclass(input.attr('class')).aclass('ui-' + value || 'left');
				break;
			case 'autofocus':
				input.focus();
				break;
			case 'icon2click': // backward compatibility
			case 'iconclick':
				config.iconclick = value;
				self.find('.ui-textbox-control').css('cursor', value ? 'pointer' : 'default');
				break;
			case 'icon':
				var tmp = self.find('.ui-textbox-label .fa');
				if (tmp.length)
					tmp.rclass2('fa-').aclass('fa-' + value);
				else
					redraw = true;
				break;
			case 'icon2':
			case 'increment':
				redraw = true;
				break;
			case 'labeltype':
				redraw = true;
				break;
		}

		redraw && setTimeout2('redraw.' + self.id, function() {
			self.redraw();
			self.refresh();
		}, 100);
	};

	self.formatter(function(path, value) {
		if (value) {
			switch (config.type) {
				case 'lower':
					value = value.toString().toLowerCase();
					break;
				case 'upper':
					value = value.toString().toUpperCase();
					break;
			}
		}
		return config.type === 'date' ? (value ? value.format(config.format || 'yyyy-MM-dd') : value) : value;
	});

	self.parser(function(path, value) {
		if (value) {
			switch (config.type) {
				case 'lower':
					value = value.toLowerCase();
					break;
				case 'upper':
					value = value.toUpperCase();
					break;
			}
		}
		return value ? config.spaces === false ? value.replace(/\s/g, '') : value : value;
	});

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : self.forcedvalidation() ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		self.tclass('ui-textbox-invalid', invalid);
		config.error && self.find('.ui-textbox-helper').tclass('ui-textbox-helper-show', invalid);
	};

	self.forcedvalidation = function() {
		var val = self.get();
		return (self.type === 'phone' || self.type === 'email') && (val != null && (typeof val === 'string' && val.length !== 0));
	};
});
/*TEXTBOX*/
/*DROPDOWN*/
COMPONENT('dropdown', function(self, config) {

	var select, condition, content = null;
	var render = '';
	self.nocompile && self.nocompile();

	self.validate = function(value) {

		if (!config.required || config.disabled)
			return true;

		var type = typeof(value);
		if (type === 'undefined' || type === 'object')
			value = '';
		else
			value = value.toString();

		EMIT('reflow', self.name);

		switch (self.type) {
			case 'currency':
			case 'number':
				return value > 0;
		}

		return value.length > 0;
	};

	self.configure = function(key, value, init) {

		if (init)
			return;

		var redraw = false;

		switch (key) {
			case 'type':
				self.type = value;
				break;
			case 'items':

				if (value instanceof Array) {
					self.bind('', value);
					return;
				}

				var items = [];

				value.split(',').forEach(function(item) {
					item = item.trim().split('|');
					var obj = { id: item[1] == null ? item[0] : item[1], name: item[0] };
					items.push(obj);
				});

				self.bind('', items);
				break;
			case 'if':
				condition = value ? FN(value) : null;
				break;
			case 'required':
				self.tclass('ui-dropdown-required', value === true);
				self.state(1, 1);
				break;
			case 'datasource':
				self.datasource(value, self.bind);
				break;
			case 'label':
				content = value;
				redraw = true;
				break;
			case 'icon':
				redraw = true;
				break;
			case 'disabled':
				self.tclass('ui-disabled', value);
				self.find('select').prop('disabled', value);
				self.reset();
				break;
		}

		redraw && setTimeout2(self.id + '.redraw', 100);
	};

	self.bind = function(path, arr) {

		if (!arr)
			arr = EMPTYARRAY;

		var builder = [];
		var value = self.get();
		var propText = config.text || 'name';
		var propValue = config.value || 'id';

		config.empty !== undefined && builder.push('<option value="">{0}</option>'.format(config.empty));

		var type = typeof(arr[0]);
		var notObj = type === 'string' || type === 'number';

		for (var i = 0, length = arr.length; i < length; i++) {
			var item = arr[i];
			if (condition && !condition(item))
				continue;
			if (notObj)
				builder.push(self.template({ value: item, selected: value == item, text: item }));
			else
				builder.push(self.template({ value: item[propValue], selected: value == item[propValue], text: item[propText] }));
		}

		render = builder.join('');
		select.html(render);
	};

	self.redraw = function() {
		var html = '<div class="ui-dropdown"><select data-jc-bind="">{0}</select></div>'.format(render);
		var builder = [];
		var label = content || config.label;
		if (label) {
			builder.push('<div class="ui-dropdown-label">{0}{1}:</div>'.format(config.icon ? '<span class="fa fa-{0}"></span> '.format(config.icon) : '', label));
			builder.push('<div class="ui-dropdown-values">{0}</div>'.format(html));
			self.html(builder.join(''));
		} else
			self.html(html).aclass('ui-dropdown-values');
		select = self.find('select');
		render && self.refresh();
		config.disabled && self.reconfigure('disabled:true');
		self.tclass('ui-dropdown-required', config.required === true);
                if (config.class) { 
			self.find('.ui-dropdown').rclass('ui-dropdown'); 
                } 
	};

	self.make = function() {
		self.template = Tangular.compile('<option value="{{value}}"{{if selected}} selected="selected"{{ fi }}>{{text}}</option>');
		self.type = config.type;
		content = self.html();
		self.aclass('ui-dropdown-container');
		self.redraw();
		config.if && (condition = FN(config.if));
		config.items && self.reconfigure({ items: config.items });
		config.datasource && self.reconfigure('datasource:' + config.datasource);
	        if (config.class) self.find('select').attr('class', config.class);
	};

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		self.tclass('ui-dropdown-invalid', invalid);
	};
});
/*DROPDOWN*/
/*AUTOCOMLETE*/
COMPONENT('autocomplete', 'height:200', function(self, config) {

	var cls = 'ui-autocomplete';
	var clssel = 'selected';

	var container, old, searchtimeout, searchvalue, blurtimeout, datasource, offsetter, scroller;
	var margin = {};
	var skipmouse = false;
	var is = false;
	var prev;

	self.template = Tangular.compile('<li{{ if index === 0 }} class="' + clssel + '"{{ fi }} data-index="{{ index }}"><span>{{ name }}</span><span>{{ type }}</span></li>');
	self.readonly();
	self.singleton();
	self.nocompile && self.nocompile();

	self.make = function() {

		self.aclass(cls + '-container hidden');
		self.html('<div class="' + cls + '"><div class="noscrollbar"><ul></ul></div></div>');

		scroller = self.find('.noscrollbar');
		container = self.find('ul');

		self.event('click', 'li', function(e) {
			e.preventDefault();
			e.stopPropagation();
			if (self.opt.callback) {
				var val = datasource[+$(this).attrd('index')];
				self.opt.scope && M.scope(self.opt.scope);
				if (self.opt.path)
					SET(self.opt.path, val.value === undefined ? val.name : val.value);
				else
					self.opt.callback(val, old);
			}
			self.visible(false);
		});

		self.event('mouseenter mouseleave', 'li', function(e) {
			if (!skipmouse) {
				prev && prev.rclass(clssel);
				prev = $(this).tclass(clssel, e.type === 'mouseenter');
			}
		});

		$(document).on('click', function() {
			is && self.visible(false);
		});

		$(window).on('resize', function() {
			self.resize();
		});

		self.on('scroll', function() {
			is && self.visible(false);
		});
	};

	self.prerender = function(value) {
		self.render(value);
	};

	self.configure = function(name, value) {
		switch (name) {
			case 'height':
				value && scroller.css('height', value);
				break;
		}
	};

	function keydown(e) {
		var c = e.which;
		var input = this;
		if (c !== 38 && c !== 40 && c !== 13) {
			if (c !== 8 && c < 32)
				return;
			clearTimeout(searchtimeout);
			searchtimeout = setTimeout(function() {
				var val = input.value || input.innerHTML;
				if (!val)
					return self.render(EMPTYARRAY);
				if (searchvalue === val)
					return;
				searchvalue = val;
				self.resize();
				self.opt.search(val, self.prerender);
			}, 200);
			return;
		}

		if (!datasource || !datasource.length || !is)
			return;

		var current = container.find('.' + clssel);
		if (c === 13) {
			if (prev) {
				prev = null;
				self.visible(false);
				if (current.length) {
					var val = datasource[+current.attrd('index')];
					self.opt.scope && M.scope(self.opt.scope);
					if (self.opt.callback)
						self.opt.callback(val, old);
					else if (self.opt.path)
						SET(self.opt.path, val.value === undefined ? val.name : val.value);
					e.preventDefault();
					e.stopPropagation();
				}
			}
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		if (current.length) {
			current.rclass(clssel);
			current = c === 40 ? current.next() : current.prev();
		}

		skipmouse = true;
		!current.length && (current = self.find('li:{0}-child'.format(c === 40 ? 'first' : 'last')));
		prev && prev.rclass(clssel);
		prev = current.aclass(clssel);
		var index = +current.attrd('index');
		var h = current.innerHeight();
		var offset = ((index + 1) * h) + (h * 2);
		scroller[0].scrollTop = offset > config.height ? offset - config.height : 0;
		setTimeout2(self.ID + 'skipmouse', function() {
			skipmouse = false;
		}, 100);
	}

	function blur() {
		clearTimeout(blurtimeout);
		blurtimeout = setTimeout(function() {
			self.visible(false);
		}, 300);
	}

	self.visible = function(visible) {
		clearTimeout(blurtimeout);
		self.tclass('hidden', !visible);
		is = visible;
	};

	self.resize = function() {

		if (!offsetter || !old)
			return;

		var offset = offsetter.offset();
		offset.top += offsetter.height();
		offset.width = offsetter.width();

		if (margin.left)
			offset.left += margin.left;
		if (margin.top)
			offset.top += margin.top;
		if (margin.width)
			offset.width += margin.width;

		self.css(offset);
	};

	self.show = function(opt) {

		clearTimeout(searchtimeout);
		var selector = 'input,[contenteditable]';

		if (opt.input == null)
			opt.input = opt.element;

		if (opt.input.setter)
			opt.input = opt.input.find(selector);
		else
			opt.input = $(opt.input);

		if (opt.input[0].tagName !== 'INPUT' && !opt.input.attr('contenteditable'))
			opt.input = opt.input.find(selector);

		if (opt.element.setter) {
			if (!opt.callback)
				opt.callback = opt.element.path;
			opt.element = opt.element.element;
		}

		if (old) {
			old.removeAttr('autocomplete');
			old.off('blur', blur);
			old.off('keydown', keydown);
		}

		opt.input.on('keydown', keydown);
		opt.input.on('blur', blur);
		opt.input.attr('autocomplete', 'off');

		old = opt.input;
		margin.left = opt.offsetX;
		margin.top = opt.offsetY;
		margin.width = opt.offsetWidth;
		opt.scope = M.scope ? M.scope() : '';

		offsetter = $(opt.element);
		self.opt = opt;
		self.resize();
		self.refresh();
		searchvalue = '';
		self.visible(false);
	};

	self.attach = function(input, search, callback, left, top, width) {
		self.attachelement(input, input, search, callback, left, top, width);
	};

	self.attachelement = function(element, input, search, callback, left, top, width) {		
		if (typeof(callback) === 'number') {
			width = left;
			left = top;
			top = callback;
			callback = null;
		}

		var opt = {};
		opt.offsetX = left;
		opt.offsetY = top;
		opt.offsetWidth = width;

		if (typeof(callback) === 'string')
			opt.path = callback;
		else
			opt.callback = callback;

		opt.search = search;
		opt.element = input;
		opt.input = input;
		self.show(opt);
	};

	self.render = function(arr) {

		datasource = arr;

		if (!arr || !arr.length) {
			self.visible(false);
			return;
		}

		var builder = [];
		for (var i = 0, length = arr.length; i < length; i++) {
			var obj = arr[i];
			obj.index = i;
			if (!obj.name)
				obj.name = obj.text;
			builder.push(self.template(obj));
		}

		container.empty().append(builder.join(''));
		skipmouse = true;

		setTimeout(function() {
			scroller[0].scrollTop = 0;
			skipmouse = false;
		}, 100);

		prev = container.find('.' + clssel);
		self.visible(true);
		setTimeout(function() {
			scroller.noscrollbar(true);
		}, 100);
	};
});
/* AUTOCOMPLETE */
/* PART */
COMPONENT('part', 'hide:1;loading:1', function(self, config) {

	var init = false;
	var clid = null;
	var downloading = false;
	var cls = 'ui-' + self.name;
	var isresizing = false;

	self.releasemode && self.releasemode('true');
	self.readonly();

	self.make = function() {
		self.aclass(cls);
	};

	self.resize = function() {
		if (config.absolute) {
			var pos = self.element.position();
			var obj = {};
			obj.width = WW - pos.left;
			obj.height = WH - pos.top;
			self.css(obj);
		}
	};

	self.destroy = function() {
		isresizing && $(W).off('resize', self.resize);
	};

	self.setter = function(value) {

		if (config.if !== value) {

			if (!self.hclass('hidden')) {
				config.hidden && EXEC(self.makepath(config.hidden));
				config.hide && self.aclass('hidden');
				self.release(true);
			}

			if (config.cleaner && init && !clid)
				clid = setTimeout(self.clean, config.cleaner * 60000);

			return;
		}

		if (config.absolute && !isresizing) {
			$(W).on('resize', self.resize);
			isresizing = true;
		}

		config.hide && self.rclass('hidden');

		if (self.dom.hasChildNodes()) {

			if (clid) {
				clearTimeout(clid);
				clid = null;
			}

			self.release(false);
			config.reload && EXEC(self.makepath(config.reload));
			config.default && DEFAULT(self.makepath(config.default), true);
			isresizing && setTimeout(self.resize, 50);
			setTimeout(self.emitresize, 200);

		} else {

			if (downloading)
				return;

			config.loading && SETTER('loading', 'show');
			downloading = true;
			setTimeout(function() {

				var preparator = config.path == null ? null : function(content) {
					return content.replace(/~PATH~/g, config.path);
				};

				if (preparator == null && config.replace)
					preparator = GET(self.makepath(config.replace));

				self.import(config.url, function() {
					downloading = false;

					if (!init) {
						config.init && EXEC(self.makepath(config.init));
						init = true;
					}

					self.release(false);
					config.reload && EXEC(self.makepath(config.reload), true);
					config.default && DEFAULT(self.makepath(config.default), true);
					config.loading && SETTER('loading', 'hide', 500);
					EMIT('parts.' + config.if, self.element, self);
					self.hclass('invisible') && self.rclass('invisible', 500);
					isresizing && setTimeout(self.resize, 50);
					setTimeout(self.emitresize, 200);

				}, true, preparator);

			}, 200);
		}
	};

	self.emitresize = function() {
		self.element.SETTER('*', 'resize');
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'if':
				config.if = value + '';
				break;
			case 'absolute':
				var is = !!value;
				self.tclass(cls + '-absolute', is);
				break;
		}
	};

	self.clean = function() {
		if (self.hclass('hidden')) {
			config.clean && EXEC(self.makepath(config.clean));
			setTimeout(function() {
				self.empty();
				init = false;
				clid = null;
				setTimeout(FREE, 1000);
			}, 1000);
		}
	};
});
/*PART*/
/*TABMENU*/
COMPONENT('tabmenu', 'class:selected;selector:li', function(self, config) {
	var old, oldtab;

	self.readonly();
	self.nocompile && self.nocompile();
	self.bindvisible();

	self.make = function() {
		self.event('click', config.selector, function() {
			if (!config.disabled) {
				var el = $(this);
				if (!el.hclass(config.class)) {
					var val = el.attrd('value');
					if (config.exec)
						EXEC(self.makepath(config.exec), val);
					else
						self.set(val);
				}
			}
		});
		var scr = self.find('script');
		if (scr.length) {
			self.template = Tangular.compile(scr.html());
			scr.remove();
		}
	};

	self.configure = function(key, value) {
		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', !!value);
				break;
			case 'datasource':
				self.datasource(value, function(path, value) {
					if (value instanceof Array) {
						var builder = [];
						for (var i = 0; i < value.length; i++)
							builder.push(self.template(value[i]));
						old = null;
						self.html(builder.join(''));
						self.refresh();
					}
				}, true);
				break;
		}
	};

	self.setter = function(value) {
		if (old === value)
			return;
		oldtab && oldtab.rclass(config.class);
		oldtab = self.find(config.selector + '[data-value="' + value + '"]').aclass(config.class);
		old = value;
	};
});
/*TABMENU*/
/*CODEMIRROR*/
COMPONENT('codemirror', 'linenumbers:false;required:false;trim:false;tabs:true', function(self, config, cls) {

	var editor, container;
	var cls2 = '.' + cls;

	self.getter = null;
	self.bindvisible();
	self.nocompile();

	self.reload = function() {
		editor.refresh();
		editor.display.scrollbars.update(true);
	};

	self.validate = function(value) {
		return (config.disabled || !config.required ? true : value && value.length > 0) === true;
	};

	self.insert = function(value) {
		editor.replaceSelection(value);
		self.change(true);
	};

	self.configure = function(key, value, init) {
		if (init)
			return;

		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', value);
				editor.readOnly = value;
				editor.refresh();
				break;
			case 'required':
				self.find(cls2 + '-label').tclass(cls + '-label-required', value);
				self.state(1, 1);
				break;
			case 'icon':
				self.find('i').rclass().aclass(value.indexOf(' ') === -1 ? ('fa fa-' + value) : value);
				break;
		}

	};

	self.make = function() {

		var findmatch = function() {

			if (config.mode === 'todo') {
				self.todo_done();
				return;
			}

			var sel = editor.getSelections()[0];
			var cur = editor.getCursor();
			var count = editor.lineCount();
			var before = editor.getLine(cur.line).substring(cur.ch, cur.ch + sel.length) === sel;
			var beg = cur.ch + (before ? sel.length : 0);
			for (var i = cur.line; i < count; i++) {
				var ch = editor.getLine(i).indexOf(sel, beg);
				if (ch !== -1) {
					editor.doc.addSelection({ line: i, ch: ch }, { line: i, ch: ch + sel.length });
					break;
				}
				beg = 0;
			}
		};

		var content = config.label || self.html();
		self.html(((content ? '<div class="{0}-label' + (config.required ? ' {0}-label-required' : '') + '">' + (config.icon ? '<i class="fa fa-' + config.icon + '"></i> ' : '') + content + ':</div>' : '') + '<div class="{0}"></div>').format(cls));
		container = self.find(cls2);

		var options = {};
		options.lineNumbers = config.linenumbers;
		options.mode = config.type || 'htmlmixed';
		options.indentUnit = 4;
		options.scrollbarStyle = 'simple';
		options.scrollPastEnd = true;
		options.extraKeys = { 'Cmd-D': findmatch, 'Ctrl-D': findmatch };

		if (config.tabs)
			options.indentWithTabs = true;

		if (config.type === 'markdown') {
			options.styleActiveLine = true;
			options.lineWrapping = true;
			options.matchBrackets = true;
		}

		if (config.theme) 
			options.theme = config.theme;
		if (config.readOnly) 
			options.readOnly = config.readOnly;
		if (config.keyMap) 
			options.keyMap = config.keyMap;
        if (config.brackets) {
            options.matchBrackets = true;
            options.autoCloseBrackets = true;
            options.lineWrapping = true;   
        };

		if (config.fullscreen) {
            options.extraKeys = { 	
            	"F11": function(cm) {
                   	cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                },
           		"Esc": function(cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                }
            }                      
        };
	
		options.showTrailingSpace = false;

		editor = CodeMirror(container[0], options);
		self.editor = editor;

		editor.on('keydown', function(editor, e) {

			if (e.shiftKey && e.ctrlKey && (e.keyCode === 40 || e.keyCode === 38)) {
				var tmp = editor.getCursor();
				editor.doc.addSelection({ line: tmp.line + (e.keyCode === 40 ? 1 : -1), ch: tmp.ch });
				e.stopPropagation();
				e.preventDefault();
			}

			if (e.keyCode === 13) {
				var tmp = editor.getCursor();
				var line = editor.lineInfo(tmp.line);
				if ((/^\t+$/).test(line.text))
					editor.replaceRange('', { line: tmp.line, ch: 0 }, { line: tmp.line, ch: line.text.length });
				return;
			}

			if (e.keyCode === 27)
				e.stopPropagation();

		});

		if (config.height !== 'auto') {
			var is = typeof(config.height) === 'number';
			editor.setSize('100%', is ? (config.height + 'px') : (config.height || '200px'));
			!is && self.css('height', config.height);
		}

		if (config.disabled) {
			self.aclass('ui-disabled');
			editor.readOnly = true;
			editor.refresh();
		}

		var can = {};
		can['+input'] = can['+delete'] = can.undo = can.redo = can.paste = can.cut = can.clear = true;

		editor.on('change', function(a, b) {

			if (config.disabled || !can[b.origin])
				return;

			setTimeout2(self.id, function() {
				var val = editor.getValue();

				if (config.trim) {
					var lines = val.split('\n');
					for (var i = 0, length = lines.length; i < length; i++)
						lines[i] = lines[i].replace(/\s+$/, '');
					val = lines.join('\n').trim();
				}

				self.getter2 && self.getter2(val);
				self.change(true);
				self.rewrite(val, 2);
				config.required && self.validate2();
			}, 200);

		});
	};

	self.setter = function(value, path, type) {

		editor.setValue(value || '');
		editor.refresh();

		setTimeout(function() {
			editor.refresh();
			editor.scrollTo(0, 0);
			type && editor.setCursor(0);
		}, 200);

		setTimeout(function() {
			editor.refresh();
		}, 1000);

		setTimeout(function() {
			editor.refresh();
		}, 2000);
	};

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		container.tclass(cls + '-invalid', invalid);
	};
}, ['//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/codemirror.min.css', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/theme/monokai.min.css', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/codemirror.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/javascript/javascript.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/htmlmixed/htmlmixed.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/xml/xml.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/css/css.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/mode/markdown/markdown.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/keymap/sublime.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/addon/display/fullscreen.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.45.0/addon/edit/matchbrackets.min.js', '//cdnjs.cloudflare.com/ajax/libs/codemirror/5.54.0/addon/comment/comment.min.js', function(next) {

	CodeMirror.defineMode('totaljsresources', function() {
		var REG_KEY = /^[a-z0-9_\-.#]+/i;
		return {

			startState: function() {
				return { type: 0, keyword: 0 };
			},

			token: function(stream, state) {

				var m;

				if (stream.sol()) {

					var line = stream.string;
					if (line.substring(0, 2) === '//') {
						stream.skipToEnd();
						return 'comment';
					}

					state.type = 0;
				}

				m = stream.match(REG_KEY, true);
				if (m)
					return 'tag';

				if (!stream.string) {
					stream.next();
					return '';
				}

				var count = 0;

				while (true) {

					count++;
					if (count > 5000)
						break;

					var c = stream.peek();
					if (c === ':') {
						stream.skipToEnd();
						return 'def';
					}

					if (c === '(') {
						if (stream.skipTo(')')) {
							stream.eat(')');
							return 'variable-L';
						}
					}

				}

				stream.next();
				return '';
			}
		};
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {

		function Bar(cls, orientation, scroll) {
			var self = this;
			self.orientation = orientation;
			self.scroll = scroll;
			self.screen = self.total = self.size = 1;
			self.pos = 0;

			self.node = document.createElement('div');
			self.node.className = cls + '-' + orientation;
			self.inner = self.node.appendChild(document.createElement('div'));

			CodeMirror.on(self.inner, 'mousedown', function(e) {

				if (e.which != 1)
					return;

				CodeMirror.e_preventDefault(e);
				var axis = self.orientation == 'horizontal' ? 'pageX' : 'pageY';
				var start = e[axis], startpos = self.pos;

				function done() {
					CodeMirror.off(document, 'mousemove', move);
					CodeMirror.off(document, 'mouseup', done);
				}

				function move(e) {
					if (e.which != 1)
						return done();
					self.moveTo(startpos + (e[axis] - start) * (self.total / self.size));
				}

				CodeMirror.on(document, 'mousemove', move);
				CodeMirror.on(document, 'mouseup', done);
			});

			CodeMirror.on(self.node, 'click', function(e) {
				CodeMirror.e_preventDefault(e);
				var innerBox = self.inner.getBoundingClientRect(), where;
				if (self.orientation == 'horizontal')
					where = e.clientX < innerBox.left ? -1 : e.clientX > innerBox.right ? 1 : 0;
				else
					where = e.clientY < innerBox.top ? -1 : e.clientY > innerBox.bottom ? 1 : 0;
				self.moveTo(self.pos + where * self.screen);
			});

			function onWheel(e) {
				var moved = CodeMirror.wheelEventPixels(e)[self.orientation == 'horizontal' ? 'x' : 'y'];
				var oldPos = self.pos;
				self.moveTo(self.pos + moved);
				if (self.pos != oldPos) CodeMirror.e_preventDefault(e);
			}
			CodeMirror.on(self.node, 'mousewheel', onWheel);
			CodeMirror.on(self.node, 'DOMMouseScroll', onWheel);
		}

		Bar.prototype.setPos = function(pos, force) {
			var t = this;
			if (pos < 0)
				pos = 0;
			if (pos > t.total - t.screen)
				pos = t.total - t.screen;
			if (!force && pos == t.pos)
				return false;
			t.pos = pos;
			t.inner.style[t.orientation == 'horizontal' ? 'left' : 'top'] = (pos * (t.size / t.total)) + 'px';
			return true;
		};

		Bar.prototype.moveTo = function(pos) {
			var t = this;
			t.setPos(pos) && t.scroll(pos, t.orientation);
		};

		var minButtonSize = 10;

		Bar.prototype.update = function(scrollSize, clientSize, barSize) {
			var t = this;
			var sizeChanged = t.screen != clientSize || t.total != scrollSize || t.size != barSize;

			if (sizeChanged) {
				t.screen = clientSize;
				t.total = scrollSize;
				t.size = barSize;
			}

			var buttonSize = t.screen * (t.size / t.total);
			if (buttonSize < minButtonSize) {
				t.size -= minButtonSize - buttonSize;
				buttonSize = minButtonSize;
			}

			t.inner.style[t.orientation == 'horizontal' ? 'width' : 'height'] = buttonSize + 'px';
			t.setPos(t.pos, sizeChanged);
		};

		function SimpleScrollbars(cls, place, scroll) {
			var t = this;
			t.addClass = cls;
			t.horiz = new Bar(cls, 'horizontal', scroll);
			place(t.horiz.node);
			t.vert = new Bar(cls, 'vertical', scroll);
			place(t.vert.node);
			t.width = null;
		}

		SimpleScrollbars.prototype.update = function(measure) {
			var t = this;
			if (t.width == null) {
				var style = window.getComputedStyle ? window.getComputedStyle(t.horiz.node) : t.horiz.node.currentStyle;
				if (style)
					t.width = parseInt(style.height);
			}

			var width = t.width || 0;
			var needsH = measure.scrollWidth > measure.clientWidth + 1;
			var needsV = measure.scrollHeight > measure.clientHeight + 1;

			t.vert.node.style.display = needsV ? 'block' : 'none';
			t.horiz.node.style.display = needsH ? 'block' : 'none';

			if (needsV) {
				t.vert.update(measure.scrollHeight, measure.clientHeight, measure.viewHeight - (needsH ? width : 0));
				t.vert.node.style.bottom = needsH ? width + 'px' : '0';
			}

			if (needsH) {
				t.horiz.update(measure.scrollWidth, measure.clientWidth, measure.viewWidth - (needsV ? width : 0) - measure.barLeft);
				t.horiz.node.style.right = needsV ? width + 'px' : '0';
				t.horiz.node.style.left = measure.barLeft + 'px';
			}

			return {right: needsV ? width : 0, bottom: needsH ? width : 0};
		};

		SimpleScrollbars.prototype.setScrollTop = function(pos) {
			this.vert.setPos(pos);
		};

		SimpleScrollbars.prototype.setScrollLeft = function(pos) {
			this.horiz.setPos(pos);
		};

		SimpleScrollbars.prototype.clear = function() {
			var parent = this.horiz.node.parentNode;
			parent.removeChild(this.horiz.node);
			parent.removeChild(this.vert.node);
		};

		CodeMirror.scrollbarModel.simple = function(place, scroll) {
			return new SimpleScrollbars('CodeMirror-simplescroll', place, scroll);
		};
		CodeMirror.scrollbarModel.overlay = function(place, scroll) {
			return new SimpleScrollbars('CodeMirror-overlayscroll', place, scroll);
		};
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {
		CodeMirror.defineOption('showTrailingSpace', false, function(cm, val, prev) {
			if (prev == CodeMirror.Init)
				prev = false;
			if (prev && !val)
				cm.removeOverlay('trailingspace');
			else if (!prev && val) {
				cm.addOverlay({ token: function(stream) {
					for (var l = stream.string.length, i = l; i; --i) {
						if (stream.string.charCodeAt(i - 1) !== 32)
							break;
					}
					if (i > stream.pos) {
						stream.pos = i;
						return null;
					}
					stream.pos = l;
					return 'trailingspace';
				}, name: 'trailingspace' });
			}
		});
	});

	(function(mod) {
		mod(CodeMirror);
	})(function(CodeMirror) {

		CodeMirror.defineOption('scrollPastEnd', false, function(cm, val, old) {
			if (old && old != CodeMirror.Init) {
				cm.off('change', onChange);
				cm.off('refresh', updateBottomMargin);
				cm.display.lineSpace.parentNode.style.paddingBottom = '';
				cm.state.scrollPastEndPadding = null;
			}
			if (val) {
				cm.on('change', onChange);
				cm.on('refresh', updateBottomMargin);
				updateBottomMargin(cm);
			}
		});

		function onChange(cm, change) {
			if (CodeMirror.changeEnd(change).line == cm.lastLine())
				updateBottomMargin(cm);
		}

		function updateBottomMargin(cm) {
			var padding = '';

			if (cm.lineCount() > 1) {
				var totalH = cm.display.scroller.clientHeight - 30;
				var lastLineH = cm.getLineHandle(cm.lastLine()).height;
				padding = (totalH - lastLineH) + 'px';
			}

			if (cm.state.scrollPastEndPadding != padding) {
				cm.state.scrollPastEndPadding = padding;
				cm.display.lineSpace.parentNode.style.paddingBottom = padding;
				cm.off('refresh', updateBottomMargin);
				cm.setSize();
				cm.on('refresh', updateBottomMargin);
			}

		}
	});

	next();
}]);
/*CODEMIRROR*/
/*NOTIFY*/
COMPONENT('notify', 'timeout:3000;position:bottom', function(self, config) {

	var autoclosing;

	self.singleton();
	self.readonly();
	self.nocompile && self.nocompile();
	self.template = Tangular.compile('<div class="ui-notify ui-notify-{{ type }}" data-id="{{ id }}"><div class="ui-notify-icon"><i class="fa {{ icon }}"></i></div><div class="ui-notify-message">{{ message | raw }}</div>');
	self.items = {};

	self.make = function() {

		self.aclass('ui-notify-container');

		self.event('click', '.ui-notify', function() {
			var el = $(this);
			self.close(+el.attrd('id'));
			clearTimeout(autoclosing);
			autoclosing = null;
			self.autoclose();
		});
	};

	self.configure = function(key, value, init) {
		if (key === 'position') {
			var cls = 'ui-notify-container-';
			self.rclass2(cls).aclass(cls + value.replace(/_|\s/, '-'));
		}
	};

	self.close = function(id) {
		var obj = self.items[id];
		if (obj) {
			delete self.items[id];
			var item = self.find('div[data-id="{0}"]'.format(id));
			item.aclass('ui-notify-hide');
			setTimeout(function() {
				item.remove();
			}, 600);
		}
	};


	self.append = function(message, type) {

		if (!type)
			type = 1;

		switch (type) {
			case 'success':
				type = 1;
				break;
			case 'warning':
				type = 2;
				break;
			case 'info':
				type = 3;
				break;
		}

		// type 1: success
		// type 2: warning

		var obj = { id: Math.floor(Math.random() * 100000), message: message, type: type, icon: type === 1 ? 'fa-check-circle' : type === 2 ? 'fa-times-circle' : 'fa-info-circle' };
		self.items[obj.id] = obj;
		self.element.append(self.template(obj));
		self.autoclose();
	};

	self.autoclose = function() {

		if (autoclosing)
			return;

		autoclosing = setTimeout(function() {
			clearTimeout(autoclosing);
			autoclosing = null;
			var el = self.find('.ui-notify');
			el.length > 1 && self.autoclose();
			el.length && self.close(+el.eq(0).attrd('id'));
		}, config.timeout);
	};
});
/*NOTIFY*/
/*RADIOBUTTON*/
COMPONENT('radiobutton', 'inline:1', function(self, config, cls) {

	var cls2 = '.' + cls;
	var template = '<div data-value="{1}"><i></i><span>{0}</span></div>';

	self.nocompile();

	self.configure = function(key, value, init) {
		if (init)
			return;
		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', value);
				break;
			case 'required':
				self.find(cls2 + '-label').tclass(cls + '-label-required', value);
				break;
			case 'type':
				self.type = config.type;
				break;
			case 'label':
				self.find(cls2 + '-label').html(value);
				break;
			case 'items':
				self.find('div[data-value]').remove();
				var builder = [];
				value.split(',').forEach(function(item) {
					item = item.split('|');
					builder.push(template.format(item[0] || item[1], item[1] || item[0]));
				});
				self.append(builder.join(''));
				self.refresh();
				break;
			case 'datasource':
				self.datasource(value, self.bind);
				break;
		}
	};

	self.make = function() {
		var builder = [];
		var label = config.label || self.html();
		label && builder.push('<div class="' + cls + '-label{1}">{0}</div>'.format(label, config.required ? (' ' + cls + '-label-required') : ''));
		self.aclass(cls + (!config.inline ? (' ' + cls + '-block') : '') + (config.disabled ? ' ui-disabled' : ''));
		self.event('click', 'div[data-value]', function() {
			if (config.disabled)
				return;
			var value = self.parser($(this).attrd('value'));
			self.set(value);
			self.change(true);
		});
		self.html(builder.join(''));
		config.items && self.reconfigure('items:' + config.items);
		config.datasource && self.reconfigure('datasource:' + config.datasource);
		config.type && (self.type = config.type);
	};

	self.validate = function(value) {
		return config.disabled || !config.required ? true : !!value;
	};

	self.setter = function(value) {
		self.find('div[data-value]').each(function() {
			var el = $(this);
			var is = el.attrd('value') === (value == null ? null : value.toString());
			el.tclass(cls + '-selected', is);
			el.find('.fa').tclass('fa-circle-o', !is).tclass('fa-circle', is);
		});
	};

	self.bind = function(path, arr) {

		if (!arr)
			arr = EMPTYARRAY;

		var builder = [];
		var propText = config.text || 'name';
		var propValue = config.value || 'id';

		var type = typeof(arr[0]);
		var notObj = type === 'string' || type === 'number';

		for (var i = 0, length = arr.length; i < length; i++) {
			var item = arr[i];
			if (notObj)
				builder.push(template.format(item, item));
			else
				builder.push(template.format(item[propText], item[propValue]));
		}

		self.find('div[data-value]').remove();
		self.append(builder.join(''));
		self.refresh();
	};
});
/*RADIOBUTTON*/
/*TEXTAREA*/
COMPONENT('textarea', 'scrollbar:true', function(self, config) {

	var cls = 'ui-textarea';
	var cls2 = '.' + cls;
	var input, placeholder, content = null;

	self.nocompile && self.nocompile();

	self.validate = function(value) {
		if (config.disabled || !config.required || config.readonly)
			return true;
		if (value == null)
			value = '';
		else
			value = value.toString();
		return value.length > 0;
	};

	self.configure = function(key, value, init) {
		if (init)
			return;

		var redraw = false;

		switch (key) {
			case 'readonly':
				self.find('textarea').prop('readonly', value);
				break;
			case 'disabled':
				self.tclass('ui-disabled', value);
				self.find('textarea').prop('disabled', value);
				self.reset();
				break;
			case 'required':
				self.noValid(!value);
				!value && self.state(1, 1);
				self.tclass(cls + '-required', value);
				break;
			case 'placeholder':
				placeholder.html(value || '');
				break;
			case 'maxlength':
				input.prop('maxlength', value || 1000);
				break;
			case 'label':
				redraw = true;
				break;
			case 'autofocus':
				input.focus();
				break;
			case 'monospace':
				self.tclass(cls + '-monospace', value);
				break;
			case 'icon':
				redraw = true;
				break;
			case 'format':
				self.format = value;
				self.refresh();
				break;
			case 'height':
				self.find('textarea').css('height', (value > 0 ? value + 'px' : value));
				break;
		}

		redraw && setTimeout2('redraw' + self.id, function() {
			self.redraw();
			self.refresh();
		}, 100);
	};

	self.redraw = function() {

		var attrs = [];
		var builder = [];
		var placeholderelement = '';

		self.tclass('ui-disabled', !!config.disabled);
		self.tclass(cls + '-monospace', !!config.monospace);
		self.tclass(cls + '-required', !!config.required);

		config.placeholder && (placeholderelement = '<div class="{0}-placeholder">{1}</div>'.format(cls, config.placeholder));
		config.maxlength && attrs.attr('maxlength', config.maxlength);
		config.error && attrs.attr('error');
		attrs.attr('data-jc-bind', '');
		config.height && attrs.attr('style', 'height:{0}px'.format(config.height));
		config.autofocus === 'true' && attrs.attr('autofocus');
		config.disabled && attrs.attr('disabled');
		config.readonly && attrs.attr('readonly');
		builder.push('{1}<textarea {0}></textarea>'.format(attrs.join(' '), placeholderelement));

		var label = config.label || content;

		if (!label.length) {
			config.error && builder.push('<div class="{0}-helper"><i class="fa fa-warning" aria-hidden="true"></i> {1}</div>'.format(cls, config.error));
			self.aclass(cls + ' ' + cls + '-container');
			self.html(builder.join(''));
		} else {
			var html = builder.join('');
			builder = [];
			builder.push('<div class="' + cls + '-label">');
			config.icon && builder.push('<i class="fa fa-{0}"></i>'.format(config.icon));
			builder.push(label);
			builder.push(':</div><div class="{0}">{1}</div>'.format(cls, html));
			config.error && builder.push('<div class="{0}-helper"><i class="fa fa-warning" aria-hidden="true"></i> {1}</div>'.format(cls, config.error));
			self.html(builder.join(''));
			self.rclass(cls);
			self.aclass(cls + '-container');
		}

		input = self.find('textarea');
		placeholder = self.find(cls2 + '-placeholder');

		if (!config.scrollbar) {
			input.noscrollbar();
			input.css('padding-right', (SCROLLBARWIDTH() + 5) + 'px');
		}
	};

	self.make = function() {
		content = self.html();
		self.type = config.type;
		self.format = config.format;
		self.redraw();

		self.event('click', cls2 + '-placeholder', function() {
			if (!config.disabled) {
				placeholder.aclass('hidden');
				input.focus();
			}
		});

		self.event('focus', 'textarea', function() {
			placeholder.aclass('hidden');
		});

		self.event('blur', 'textarea', function() {
			if (!self.get() && config.placeholder)
				placeholder.rclass('hidden');
		});
	};

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		self.tclass(cls + '-invalid', invalid);
		config.error && self.find( cls2 + '-helper').tclass(cls + '-helper-show', invalid);
	};

	self.setter2 = function(value) {

		if (!config.placeholder)
			return;

		if (value)
			placeholder.aclass('hidden');
		else
			placeholder.rclass('hidden');
	};
});
/*TEXTAREA*/
/*ERROR*/
COMPONENT('error', function(self, config) {

    self.readonly();

    self.make = function() {
        self.aclass('ui-error hidden');
    };

    self.setter = function(value) {
        //if (!(value instanceof Array) || !value.length) {
	if (!value || !value.length) {
            self.tclass('hidden', true);
            return;
        }

        var builder = [];
	value = Array.isArray(value) ? value : [value];
        for (var i = 0, length = value.length; i < length; i++)
            builder.push('<div><span class="fa {1}"></span>{0}</div>'.format(value[i].error||value[i], 'fa-' + (config.icon || 'times-circle')));

        self.html(builder.join(''));
        self.tclass('hidden', false);
    };
});
/*GRID*/
COMPONENT('grid', 'filter:true;external:false;fillcount:50;filterlabel:Filtering values ...;boolean:true|on|yes;pluralizepages:# pages,# page,# pages,# pages;pluralizeitems:# items,# item,# items,# items;pagination:false;rowheight:30', function(self, config) {

    var tbody, thead, tbodyhead, container, pagination;
    var options = { columns: {}, items: [], indexer: 0, filter: {} };
    var isFilter = false;
    var ppages, pitems, cache, eheight, wheight, scroll, filtercache, filled = false;

    self.template = Tangular.compile('<td data-index="{{ index }}"{{ if $.cls }} class="{{ $.cls }}"{{ fi }}><div class="wrap{{ if align }} {{ align }}{{ fi }}"{{ if background }} style="background-color:{{ background }}"{{ fi }}>{{ value | raw }}</div></td>');
    self.options = options;
    self.readonly();
    self.nocompile && self.nocompile();

    self.make = function() {

        var meta = self.find('script').html();
        self.aclass('ui-grid-container' + (config.autosize ? '' : ' hidden'));
        self.html('<div class="ui-grid"><table class="ui-grid-header"><thead></thead></table><div class="ui-grid-scroller"><table class="ui-grid-data"><thead></thead><tbody></tbody></table></div></div>' + (config.pagination ? '<div class="ui-grid-footer hidden"><div class="ui-grid-meta"></div><div class="ui-grid-pagination"><button class="ui-grid-button" name="first"><i class="fa fa-angle-double-left"></i></button><button class="ui-grid-button" name="prev"><i class="fa fa-angle-left"></i></button><div class="page"><input type="text" maxlength="5" class="ui-grid-input" /></div><button class="ui-grid-button" name="next"><i class="fa fa-angle-right"></i></button><button class="ui-grid-button" name="last"><i class="fa fa-angle-double-right"></i></button></div><div class="ui-grid-pages"></div></div></div>' : ''));

        var body = self.find('.ui-grid-data');
        tbody = $(body.find('tbody')[0]);
        tbodyhead = $(body.find('thead')[0]);
        thead = $(self.find('.ui-grid-header').find('thead')[0]);
        container = $(self.find('.ui-grid-scroller')[0]);

        if (config.pagination) {
            var el = self.find('.ui-grid-footer');
            pagination = {};
            pagination.main = el;
            pagination.page = el.find('input');
            pagination.first = el.find('button[name="first"]');
            pagination.last = el.find('button[name="last"]');
            pagination.prev = el.find('button[name="prev"]');
            pagination.next = el.find('button[name="next"]');
            pagination.meta = el.find('.ui-grid-meta');
            pagination.pages = el.find('.ui-grid-pages');
        }

        meta && self.meta(meta);

        self.event('click', '.ui-grid-columnsort', function() {
            var obj = {};
            obj.columns = options.columns;
            obj.column = options.columns[+$(this).attrd('index')];
            self.sort(obj);
        });

        self.event('change', '.ui-grid-filter', function() {
            var el = $(this).parent();
            if (this.value)
                options.filter[this.name] = this.value;
            else
                delete options.filter[this.name];
            el.tclass('ui-grid-selected', !!this.value);
            scroll = true;
            self.filter();
        });

        self.event('change', 'input', function() {
            var el = this;
            if (el.type === 'checkbox') {
                el && !el.value && self.checked(el.checked);
                config.checked && EXEC(config.checked, el, self);
            }
        });

        self.event('click', '.ui-grid-button', function() {
            switch (this.name) {
                case 'first':
                    scroll = true;
                    cache.page = 1;
                    self.operation('pagination');
                    break;
                case 'last':
                    scroll = true;
                    cache.page = cache.pages;
                    self.operation('pagination');
                    break;
                case 'prev':
                    scroll = true;
                    cache.page -= 1;
                    self.operation('pagination');
                    break;
                case 'next':
                    scroll = true;
                    cache.page += 1;
                    self.operation('pagination');
                    break;
            }
        });

        self.event('change', '.ui-grid-input', function() {
            var page = (+this.value) >> 0;
            if (isNaN(page) || page < 0 || page > cache.pages || page === cache.page)
                return;
            scroll = true;
            cache.page = page;
            self.operation('pagination');
        });

        tbody.on('click', 'button', function() {
            var btn = $(this);
            var tr = btn.closest('tr');
            config.button && EXEC(config.button, btn, options.items[+tr.attrd('index')], self);
        });

        var ALLOWED = { INPUT: 1, SELECT: 1 };

        tbody.on('click', '.ui-grid-row', function(e) {
            !ALLOWED[e.target.nodeName] && config.click && EXEC(config.click, options.items[+$(this).attrd('index')], self);
        });

        self.on('resize', self.resize);
        config.init && EXEC(config.init);
        wheight = WH;
    };

    self.checked = function(value) {
        if (typeof(value) === 'boolean')
            self.find('input[type="checkbox"]').prop('checked', value);
        else
            return tbody.find('input:checked');
    };

    self.meta = function(html) {

        switch (typeof(html)) {
            case 'string':
                options.columns = new Function('return ' + html.trim())();
                break;
            case 'function':
                options.columns = html(self);
                break;
            case 'object':
                options.columns = html;
                break;
        }

        options.columns = options.columns.remove(function(column) {
            return !!(column.remove && FN(column.remove)());
        });

        options.customsearch = false;

        for (var i = 0; i < options.columns.length; i++) {
            var column = options.columns[i];

            if (typeof(column.header) === 'string')
                column.header = column.header.indexOf('{{') === -1 ? new Function('return \'' + column.header + '\'') : Tangular.compile(column.header);

            if (typeof(column.template) === 'string')
                column.template = column.template.indexOf('{{') === -1 ? new Function('a', 'b', 'return \'' + column.template + '\'') : Tangular.compile(column.template);

            if (column.search) {
                options.customsearch = true;
                column.search = column.search === true ? column.template : Tangular.compile(column.search);
            }
        }

        self.rebuild(true);
    };

    self.configure = function(key, value) {
        switch (key) {
            case 'pluralizepages':
                ppages = value.split(',').trim();
                break;
            case 'pluralizeitems':
                pitems = value.split(',').trim();
                break;
        }
    };

    self.cls = function(d) {
        var a = [];
        for (var i = 1; i < arguments.length; i++) {
            var cls = arguments[i];
            cls && a.push(cls);
        }
        return a.length ? ((d ? ' ' : '') + a.join(' ')) : '';
    };

    self.rebuild = function(init) {

        var data = ['<tr class="ui-grid-empty">'];
        var header = ['<tr>'];
        var filter = ['<tr>'];

        var size = 0;
        var columns = options.columns;
        var scrollbar = SCROLLBARWIDTH();

        for (var i = 0, length = columns.length; i < length; i++) {
            var col = columns[i];

            if (typeof(col.size) !== 'string')
                size += col.size || 1;

            col.sorting = null;

            if (typeof(col.render) === 'string')
                col.render = FN(col.render);

            if (typeof(col.header) === 'string')
                col.header = FN(col.header);

            col.cls = self.cls(0, col.classtd, col.class);
        }

        for (var i = 0, length = columns.length; i < length; i++) {
            var col = columns[i];
            var width = typeof(col.size) === 'string' ? col.size : ((((col.size || 1) / size) * 100).floor(2) + '%');

            data.push('<td style="width:{0}" data-index="{1}" class="{2}"></td>'.format(width, i, self.cls(0, col.classtd, col.class)));
            header.push('<th class="ui-grid-columnname{3}{5}" style="width:{0};text-align:center" data-index="{1}" title="{6}" data-name="{4}"><div class="wrap"><i class="fa hidden ui-grid-fa"></i>{2}</div></th>'.format(width, i, col.header ? col.header(col) : (col.text || col.name), self.cls(1, col.classth, col.class), col.name, col.sort === false ? '' : ' ui-grid-columnsort', col.title || col.text || col.name));
            if (col.filter === false)
                filter.push('<th class="ui-grid-columnfilterempty ui-grid-columnfilter{1}" style="width:{0}">&nbsp;</th>'.format(width, self.cls(1, col.classfilter, col.class)));
            else
                filter.push('<th class="ui-grid-columnfilter{4}" style="width:{0}"><input type="text" placeholder="{3}" name="{2}" autocomplete="off" class="ui-grid-filter" /></th>'.format(width, i, col.name, col.filter || config.filterlabel, self.cls(1, col.classfilter, col.class)));
        }

        if (scrollbar) {
            header.push('<th class="ui-grid-columnname ui-grid-scrollbar" style="width:{0}px"></th>'.format(scrollbar));
            filter.push('<th class="ui-grid-columnfilterempty ui-grid-scrollbar ui-grid-columnfilter{1}" style="width:{0}px">&nbsp;</th>'.format(scrollbar, self.cls(1, col.classtd, col.class)));
        }

        tbodyhead.html(data.join('') + '</tr>');
        thead.html(header.join('') + '</tr>' + (config.filter ? (filter.join('') + '</tr>') : ''));
        !init && self.refresh();
        isFilter = false;
        options.filter = {};
    };

    self.fill = function() {

        if (config.autosize === false || filled)
            return;

        filled = true;
        tbody.find('.emptyfill').remove();
        var builder = ['<tr class="emptyfill">'];

        var cols = options.columns;
        for (var i = 0, length = cols.length; i < length; i++) {
            var col = cols[i];
            if (!col.hidden) {
                var cls = self.cls(0, col.classtd, col.class);
                builder.push('<td{0}>'.format(cls ? (' class="' + cls + '"') : '') + (i ? '' : '<div class="wrap">&nbsp;</div>') + '</td>');
            }
        }

        builder.push('</tr>');
        builder = builder.join('');
        var buffer = [];
        for (var i = 0; i < config.fillcount; i++)
            buffer.push(builder);
        tbody.append(buffer.join(''));
    };

    self.resize = function(delay) {

        if (config.autosize === false) {
            self.hclass('hidden') && self.rclass('hidden');
            return;
        }

        setTimeout2(self.id + '.resize', function() {

            var parent = self.parent().height();
            if (parent < wheight / 3)
                return;

            var value = options.items;
            var height = parent - (config.padding || 0) - (config.pagination ? 105 : 74);

            if (height === eheight)
                return;

            container.height(height);
            eheight = height;

            var cls = 'ui-grid-noscroll';
            var count = (height / config.rowheight) >> 0;
            if (count > value.length) {
                self.fill(config.fillcount);
                self.aclass(cls);
            } else
                self.rclass(cls);

            pagination && pagination.main.rclass('hidden');
            eheight && self.rclass('hidden');
        }, typeof(delay) === 'number' ? delay : 50);
    };

    self.limit = function() {
        return Math.ceil(container.height() / config.rowheight);
    };

    self.filter = function() {
        isFilter = Object.keys(options.filter).length > 0;
        !config.external && self.refresh();
        self.operation('filter');
    };

    self.operation = function(type) {
        if (type === 'filter')
            cache.page = 1;
        config.exec && EXEC(config.exec, type, isFilter ? options.filter : null, options.lastsort ? options.lastsort : null, cache.page, self);
    };

    self.sort = function(data) {

        options.lastsortelement && options.lastsortelement.rclass('fa-caret-down fa-caret-up').aclass('hidden');

        if (data.column.sorting === 'desc') {
            options.lastsortelement.find('.ui-grid-fa').rclass('fa-caret-down fa-caret-up').aclass('hidden');
            options.lastsortelement = null;
            options.lastsort = null;
            data.column.sorting = null;

            if (config.external)
                self.operation('sort');
            else
                self.refresh();

        } else if (data.column) {
            data.column.sorting = data.column.sorting === 'asc' ? 'desc' : 'asc';
            options.lastsortelement = thead.find('th[data-name="{0}"]'.format(data.column.name)).find('.ui-grid-fa').rclass('hidden').tclass('fa-caret-down', data.column.sorting === 'asc').tclass('fa-caret-up', data.column.sorting === 'desc');
            options.lastsort = data.column;

            var name = data.column.name;
            var sort = data.column.sorting;

            !config.external && options.lastsort && options.items.quicksort(name, sort !== 'asc');
            self.operation('sort');
            self.redraw();
        }
    };

    self.can = function(row) {

        var keys = Object.keys(options.filter);

        for (var i = 0; i < keys.length; i++) {

            var column = keys[i];
            var filter = options.filter[column];
            var val2 = filtercache[column];
            var val = row['$' + column] || row[column];

            var type = typeof(val);

            if (val instanceof Array) {
                val = val.join(' ');
                type = 'string';
            }

            if (type === 'number') {

                if (val2 == null)
                    val2 = filtercache[column] = self.parseNumber(filter);

                if (val2.length === 1 && val !== val2[0])
                    return false;

                if (val < val2[0] || val > val2[1])
                    return false;

            } else if (type === 'string') {

                if (val2 == null) {
                    val2 = filtercache[column] = filter.split(/\/\|\\|,/).trim();
                    for (var j = 0; j < val2.length; j++)
                        val2[j] = val2[j].toSearch();
                }

                var is = false;
                var s = val.toSearch();

                for (var j = 0; j < val2.length; j++) {
                    if (s.indexOf(val2[j]) !== -1) {
                        is = true;
                        break;
                    }
                }

                if (!is)
                    return false;

            } else if (type === 'boolean') {
                if (val2 == null)
                    val2 = filtercache[column] = config.boolean.indexOf(filter.replace(/\s/g, '')) !== -1;
                if (val2 !== val)
                    return false;
            } else if (val instanceof Date) {

                val.setHours(0);
                val.setMinutes(0);

                if (val2 == null) {

                    val2 = filter.trim().replace(/\s-\s/, '/').split(/\/|\||\\|,/).trim();
                    var arr = filtercache[column] = [];

                    for (var j = 0; j < val2.length; j++) {
                        var dt = val2[j].trim();
                        var a = self.parseDate(dt);
                        if (a instanceof Array) {
                            if (val2.length === 2) {
                                arr.push(j ? a[1] : a[0]);
                            } else {
                                arr.push(a[0]);
                                if (j === val2.length - 1) {
                                    arr.push(a[1]);
                                    break;
                                }
                            }
                        } else
                            arr.push(a);
                    }

                    if (val2.length === 2 && arr.length === 2) {
                        arr[1].setHours(23);
                        arr[1].setMinutes(59);
                        arr[1].setSeconds(59);
                    }

                    val2 = arr;
                }

                if (val2.length === 1 && val.format('yyyyMMdd') !== val2[0].format('yyyyMMdd'))
                    return false;

                if (val < val2[0] || val > val2[1])
                    return false;
            } else
                return false;
        }

        return true;
    };

    self.parseDate = function(val) {
        var index = val.indexOf('.');
        if (index === -1) {
            if ((/[a-z]+/).test(val)) {
                var dt = NOW.add(val);
                return dt > NOW ? [NOW, dt] : [dt, NOW];
            }
            if (val.length === 4)
                return [new Date(+val, 0, 1), new Date(+val + 1, 0  , 1)];
        } else if (val.indexOf('.', index + 1) === -1) {
            var a = val.split('.');
            return new Date(NOW.getFullYear(), +a[1] - 1, +a[0]);
        }
        index = val.indexOf('-');
        if (index !== -1 && val.indexOf('-', index + 1) === -1) {
            var a = val.split('-');
            return new Date(NOW.getFullYear(), +a[0] - 1, +a[1]);
        }
        return val.parseDate();
    };

    self.parseNumber = function(val) {
        var arr = [];
        var num = val.replace(/\s-\s/, '/').replace(/\s/g, '').replace(/,/g, '.').split(/\/|\|\s-\s|\\/).trim();

        for (var i = 0, length = num.length; i < length; i++) {
            var n = num[i];
            arr.push(+n);
        }

        return arr;
    };

    self.reset = function() {
        options.filter = {};
        isFilter = false;
        thead.find('input').val('');
        thead.find('.ui-grid-selected').rclass('ui-grid-selected');
        options.lastsortelement && options.lastsortelement.rclass('fa-caret-down fa-caret-up');
        options.lastsortelement = null;
        if (options.lastsort)
            options.lastsort.sorting = null;
        options.lastsort = null;
    };

    self.redraw = function() {

        var items = options.items;
        var columns = options.columns;
        var builder = [];
        var m = {};

        for (var i = 0, length = items.length; i < length; i++) {
            builder.push('<tr class="ui-grid-row" data-index="' + i + '">');
            for (var j = 0, jl = columns.length; j < jl; j++) {
                var column = columns[j];
                var val = items[i][column.name];
                m.value = column.template ? column.template(items[i], column) : column.render ? column.render(val, column, items[i]) : val == null ? '' : Thelpers.encode((column.format ? val.format(column.format) : val));
                m.index = j;
                m.align = column.align;
                m.background = column.background;
                builder.push(self.template(m, column));
            }
            builder.push('</tr>');
        }

        tbody.find('.ui-grid-row').remove();
        tbody.prepend(builder.join(''));
        container.rclass('noscroll');
        scroll && container.prop('scrollTop', 0);
        scroll = false;
        eheight = 0;
        self.resize(0);
    };

    self.setter = function(value) {

        // value.items
        // value.limit
        // value.page
        // value.pages
        // value.count

        if (!value) {
            tbody.find('.ui-grid-row').remove();
            self.resize();
            return;
        }

        cache = value;

        if (config.pagination) {
            pagination.prev.prop('disabled', value.page === 1);
            pagination.first.prop('disabled', value.page === 1);
            pagination.next.prop('disabled', value.page >= value.pages);
            pagination.last.prop('disabled', value.page === value.pages);
            pagination.page.val(value.page);
            pagination.meta.html(value.count.pluralize.apply(value.count, pitems));
            pagination.pages.html(value.pages.pluralize.apply(value.pages, ppages));
        }

        if (options.customsearch) {
            for (var i = 0, length = value.items.length; i < length; i++) {
                var item = value.items[i];
                for (var j = 0; j < options.columns.length; j++) {
                    var col = options.columns[j];
                    if (col.search)
                        item['$' + col.name] = col.search(item);
                }
            }
        }

        if (config.external) {
            options.items = value.items;
        } else {
            options.items = [];
            filtercache = {};
            for (var i = 0, length = value.items.length; i < length; i++) {
                var item = value.items[i];
                if (isFilter && !self.can(item))
                    continue;
                options.items.push(item);
            }
            options.lastsort && options.items.quicksort(options.lastsort.name, options.lastsort.sorting === 'asc');
        }

        self.redraw();
        config.checked && EXEC(config.checked, null, self);
    };
});
/*GRID*/
/*ERROR*/
COMPONENT('fabric', function(self, config) {
    var meta = {};
    self.make = function() {                
        if (config.url) {
            AJAX('GET '+config.url, null, (resp, err)=>{                              
                self.append(resp.html);
                self.append('<script>'+resp.code+'</script>');                                
                meta.id = resp.id;                 
                meta.name = resp.name;                 
                meta.param = resp.param;                 
            });
        }    
    }    
});    

