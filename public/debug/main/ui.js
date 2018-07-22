function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

Array.prototype.changeKey = function(o) {    
  var items_change = this.map(function(obj) {
      return _.mapKeys(obj, function(value, key) {
         if (o[key]) return o[key];
          else return key;                                            
      });
  });
  return items_change;
};

//request.answer | find("ID", 5, "R_ID") 
Tangular.register('find', function(arr, key, val, keyout) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] == val) {
            return arr[i][keyout];
        }
    }
    return '';
});

$.fn.ensureVisible = function() { $(this).each(function() { $(this)[0].scrollIntoView(); }); };

COMPONENT('click', function() {
    var self = this;

    self.readonly();

    self.click = function() {
        var value = self.attr('data-value');
        if (value) {
            self.set(self.parser(value));
            return;
        }
        self.get(self.attr('data-component-path'))(self);
    };

    self.make = function() {
        self.element.on('click', self.click);

        var enter = self.attr('data-enter');
        if (!enter)
            return;

        $(enter).on('keydown', 'input', function(e) {
            if (e.keyCode !== 13)
                return;
            setTimeout(function() {
                if (self.element.get(0).disabled === true)
                    return;
                self.click();
            }, 100);
        });
    };
});

COMPONENT('disable', function() {
    var self = this;
    var condition = self.attr('data-if');
    var selector = 'input,texarea,select';

    self.readonly();

    self.setter = function(value) {
        var is = true;

        if (condition)
            is = EVALUATE(self.path, condition);
        else
            is = value ? false : true;

        self.find(selector).each(function() {
            var el = $(this);
            el.prop('disabled', is);
            // Disable the line below when you don't use ui-textbox, ui-dropdown, etc..
            el.parent().parent().toggleClass('ui-disabled', is);
        });
    };

    self.state = function(type) {
        self.setter(self.get());
    };
});

COMPONENT('page', function() {
    var self = this;
    var isProcessed = false;
    var isProcessing = false;

    self.readonly();

    self.hide = function() {
        self.set('');
    };

    self.setter = function(value) {

        if (isProcessing)
            return;

        var el = self.element;
        var is = el.attr('data-if') == value;
        var reload = self.attr('data-reload');

        if (isProcessed || !is) {
            el.toggleClass('hidden', !is);
            is && reload && self.get(reload)();
            return;
        }

        SETTER('loading', 'show');
        isProcessing = true;

        INJECT(el.attr('data-template'), el, function() {
            isProcessing = false;

            var init = el.attr('data-init');
            if (init) {
                var fn = GET(init || '');
                typeof(fn) === 'function' && fn(self);
            }

            reload && self.get(reload)();
            isProcessed = true;
            setTimeout(function() {
                el.toggleClass('hidden', !is);
            }, 200);
            SETTER('loading', 'hide', 1000);
        });
    };
});

COMPONENT('ready', function() {
    var self = this;
    self.make = function() {
        setTimeout(function() {
            self.element.removeClass('ui-ready-preloader');
            self.element.find('div:first-child').removeClass('ui-ready-hidden');
        }, 500);
    };

    // Better performance
    self.setter = null;
    self.getter = null;
});

COMPONENT('length', function() {
    var self = this;

    self.readonly();

    self.setter = function(value) {
        var key = self.attr('data-key');
        var val = self.attr('data-value');

        if (typeof value === 'undefined') {
            self.element.html('');
            return;
        }

        if (!key && !val) {
            self.html(value.length);
            return;
        }

        var count = 0;

        value.forEach(function(item) {
            Object.keys(item).forEach(function(k) {
                if (k !== key)
                    return;
                if (val) {
                    if (item[k] == val)
                        count++;
                } else
                    count++;
            });
        });

        self.html(count);
    };
});

COMPONENT('textbox', function(self, config) {

    var input, container, content = null;

    self.validate = function(value) {

        if (!config.required || config.disabled)
            return true;

        if (self.type === 'date')
            return value instanceof Date && !isNaN(value.getTime());

        if (value == null)
            value = '';
        else
            value = value.toString();

        EMIT('reflow', self.name);

        switch (self.type) {
            case 'email':
                return value.isEmail();
            case 'url':
                return value.isURL();
            case 'currency':
            case 'number':
                return value > 0;
        }

        return config.validation ? self.evaluate(value, config.validation, true) ? true : false : value.length > 0;
    };

    self.make = function() {

        content = self.html();

        self.type = config.type;
        self.format = config.format;

        self.event('click', '.fa-calendar', function(e) {
            if (config.disabled)
                return;
            if (config.type === 'date') {
                e.preventDefault();
                window.$calendar && window.$calendar.toggle(self.element, self.find('input').val(), function(date) {
                    self.set(date);
                });
            }
        });

        self.event('click', '.fa-caret-up,.fa-caret-down', function() {
            if (config.disabled)
                return;
            if (config.increment) {
                var el = $(this);
                var inc = el.hasClass('fa-caret-up') ? 1 : -1;
                self.change(true);
                self.inc(inc);
            }
        });

        self.event('click', '.ui-textbox-control-icon', function() {
            if (config.disabled)
                return;
            if (self.type === 'search') {
                self.$stateremoved = false;
                $(this).rclass('fa-times').aclass('fa-search');
                self.set('');
            }
        });

        self.redraw();
    };

    self.redraw = function() {

        var attrs = [];
        var builder = [];
        var tmp;

        if (config.type === 'password')
            tmp = 'password';
        else
            tmp = 'text';

        self.tclass('ui-disabled', config.disabled === true);
        self.type = config.type;
        attrs.attr('type', tmp);
        config.placeholder && attrs.attr('placeholder', config.placeholder);
        config.maxlength && attrs.attr('maxlength', config.maxlength);
        config.keypress != null && attrs.attr('data-jc-keypress', config.keypress);
        config.delay && attrs.attr('data-jc-keypress-delay', config.delay);
        config.disabled && attrs.attr('disabled');
        config.error && attrs.attr('error');
        attrs.attr('data-jc-bind', '');

        config.autofill && attrs.attr('name', self.path.replace(/\./g, '_'));
        config.align && attrs.attr('class', config.align); //ui-
        config.autofocus && attrs.attr('autofocus');

        builder.push('<input {0} />'.format(attrs.join(' ')));

        var icon = config.icon;
        var icon2 = config.icon2;

        if (!icon2 && self.type === 'date')
            icon2 = 'calendar';
        else if (self.type === 'search') {
            icon2 = 'search ui-textbox-control-icon';
            self.setter2 = function(value) {
                if (self.$stateremoved && !value)
                    return;
                self.$stateremoved = value ? false : true;
                self.find('.ui-textbox-control-icon').tclass('fa-times', value ? true : false).tclass('fa-search', value ? false : true);
            };
        }

        icon2 && builder.push('<div><span class="fa fa-{0}"></span></div>'.format(icon2));
        config.increment && !icon2 && builder.push('<div><span class="fa fa-caret-up"></span><span class="fa fa-caret-down"></span></div>');

        if (config.label)
            content = config.label;

        if (content.length) {
            var html = builder.join('');
            builder = [];
            builder.push('<div class="ui-textbox-label{0}">'.format(config.required ? ' ui-textbox-label-required' : ''));
            icon && builder.push('<span class="fa fa-{0}"></span> '.format(icon));
            builder.push(content);
            builder.push(':</div><div class="ui-textbox">{0}</div>'.format(html));
            config.error && builder.push('<div class="ui-textbox-helper"><i class="fa fa-warning" aria-hidden="true"></i> {0}</div>'.format(config.error));
            self.html(builder.join(''));
            self.aclass('ui-textbox-container');
            input = self.find('input');
            container = self.find('.ui-textbox');
        } else {
            config.error && builder.push('<div class="ui-textbox-helper"><i class="fa fa-warning" aria-hidden="true"></i> {0}</div>'.format(config.error));
            self.aclass('ui-textbox ui-textbox-container');
            self.html(builder.join(''));
            input = self.find('input');
            container = self.element;
        }
    };

    self.configure = function(key, value, init) {

        if (init)
            return;

        var redraw = false;

        switch (key) {
            case 'disabled':
                self.tclass('ui-disabled', value);
                self.find('input').prop('disabled', value);
                break;
            case 'format':
                self.format = value;
                self.refresh();
                break;
            case 'required':
                self.noValid(!value);
                !value && self.state(1, 1);
                self.find('.ui-textbox-label').tclass('ui-textbox-label-required', value);
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
                content = value;
                redraw = true;
                break;
            case 'type':
                self.type = value;
                if (value === 'password')
                    value = 'password';
                else
                    self.type = 'text';
                redraw = true;
                break;
            case 'align':
                input.rclass(input.attr('class')).aclass('ui-' + value || 'left');
                break;
            case 'autofocus':
                input.focus();
                break;
            case 'icon':
            case 'icon2':
            case 'increment':
                redraw = true;
                break;
        }

        redraw && setTimeout2('redraw.' + self.id, function() {
            self.redraw();
            self.refresh();
        }, 100);
    };

    self.state = function(type) {
        if (!type)
            return;
        var invalid = config.required ? self.isInvalid() : false;
        if (invalid === self.$oldstate)
            return;
        self.$oldstate = invalid;
        container.tclass('ui-textbox-invalid', invalid);
        config.error && self.find('.ui-box-helper').tclass('ui-box-helper-show', invalid);
    };
});

COMPONENT('textarea', function() {

    var self = this;
    var isRequired = self.attr('data-required') === 'true';

    this.validate = function(value) {
        var is = false;
        var t = typeof(value);

        if (t === 'undefined' || t === 'object')
            value = '';
        else
            value = value.toString();

        is = isRequired ? self.type === 'number' ? value > 0 : value.length > 0 : true;
        return is;
    };

    self.make = function() {

        var attrs = [];

        function attr(name) {
            var a = self.attr(name);
            if (!a)
                return;
            attrs.push(name.substring(name.indexOf('-') + 1) + '="' + a + '"');
        }

        attr('data-placeholder');
        attr('data-maxlength');
        attr('data-rows');

        var element = self.element;
        var height = element.attr('data-height');
        var align = element.attr('data-align');
        var icon = element.attr('data-icon');
        var content = element.html();
        var html = '<textarea data-component-bind=""' + (attrs.length > 0 ? ' ' + attrs.join('') : '') + (height ? ' style="height:' + height + '"' : '') + (align ? ' class="' + align + '"' : '') + (element.attr('data-autofocus') === 'true' ? ' autofocus="autofocus"' : '') + '></textarea>';

        if (content.length === 0) {
            element.addClass('ui-textarea');
            element.append(html);
            return;
        }

        element.empty();
        element.append('<div class="ui-textarea-label' + (isRequired ? ' ui-textarea-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div>');
        element.append('<div class="ui-textarea">' + html + '</div>');
    };

    self.state = function(type) {
        self.element.find('.ui-textarea').toggleClass('ui-textarea-invalid', self.isInvalid());
    };
});

COMPONENT('dropdown', function(self, config) {

    var select, container, condition, content, datasource = null;
    var render = '';

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
            case 'condition':
                condition = value ? FN(value) : null;
                break;
            case 'required':
                self.find('.ui-dropdown-label').tclass('ui-dropdown-label-required', value);
                self.state(1, 1);
                break;
            case 'datasource':
                datasource && self.unwatch(value, self.bind);
                self.watch(value, self.bind, true);
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
                break;
        }

        redraw && setTimeout2(self.id + '.redraw', 100);
    };

    self.bind = function(path, arr) {

        if (!arr)
            arr = EMPTYARRAY;

        var builder = [];
        var value = self.get();
        var template = '<option value="{0}"{1}>{2}</option>';
        var propText = config.text || 'name';
        var propValue = config.value || 'id';
        if (config.placeholder) builder.push('<option value="" disabled selected>{0}</option>'.format(config.placeholder));

        config.empty !== undefined && builder.push('<option value="">{0}</option>'.format(config.empty));

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i];
            if (condition && !condition(item))
                continue;
            if (item.length)
                builder.push(template.format(item, value === item ? ' selected="selected"' : '', item));
            else
                builder.push(template.format(item[propValue], value === item[propValue] ? ' selected="selected"' : '', item[propText]));
        }

        render = builder.join('');
        select.html(render);
    };

    self.redraw = function() {
        var html = '<div class="ui-dropdown"><span class="fa fa-sort"></span><select data-jc-bind="">{0}</select></div>'.format(render);
        var builder = [];
        var label = content || config.label;
        if (label) {
            builder.push('<div class="ui-dropdown-label{0}">{1}{2}:</div>'.format(config.required ? ' ui-dropdown-label-required' : '', config.icon ? '<span class="fa fa-{0}"></span> '.format(config.icon) : '', label));
            builder.push('<div class="ui-dropdown-values">{0}</div>'.format(html));
            self.html(builder.join(''));
        } else
            self.html(html).aclass('ui-dropdown-values');
        select = self.find('select');
        container = self.find('.ui-dropdown');
        if (config.align) select.attr('class', config.align);
        render && self.refresh();
        config.disabled && self.reconfigure('disabled:true');
    };

    self.make = function() {
        self.type = config.type;
        content = self.html();
        self.aclass('ui-dropdown-container');
        self.redraw();
        config.items && self.reconfigure({ items: config.items });
        config.datasource && self.reconfigure('datasource:' + config.datasource);
    };

    self.state = function(type) {
        if (!type)
            return;
        var invalid = config.required ? self.isInvalid() : false;
        if (invalid === self.$oldstate)
            return;
        self.$oldstate = invalid;
        container.tclass('ui-dropdown-invalid', invalid);
    };
});

COMPONENT('select', function() {

    var self = this;
    var element = self.element;
    var isRequired = element.attr('data-required') === 'true';
    var isEmpty = element.attr('data-empty') === 'true';
    var datasource = '';

    this.validate = function(value) {
        var is = false;
        var t = typeof(value);
        if (t === 'undefined' || t === 'object')
            value = '';
        else
            value = value.toString();
        is = isRequired ? self.type === 'number' ? value > 0 : value.length > 0 : true;
        return is;
    };

    self.optText = element.attr('data-source-text') || 'name';
    self.optValue = element.attr('data-source-value') || 'id';

    self.render = function(arr) {
        var el = element.find('select').empty();
        var builder = [];
        var kk = self.optText;
        var kv = self.optValue;
        var value = self.get();

        if (element.attr('data-placeholder'))
            builder.push('<option value="" disabled selected>' + element.attr('data-placeholder') + '</option>');

        if (isEmpty)
            builder.push('<option value=""></option>');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i];
            if (typeof(item) === 'string')
                builder.push('<option value="' + item + '"' + (value == item ? ' selected="selected"' : '') + '>' + item + '</option>');
            else
                builder.push('<option value="' + item[kv] + '"' + (value == item[kv] ? ' selected="selected"' : '') + '>' + item[kk] + '</option>');
        }

        el.html(builder.join(''));
    };

    this.make = function() {

        var options = [];
        var element = self.element;
        var arr = (element.attr('data-options') || '').split(';');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i].split('|');
            options.push('<option value="' + (item[1] === undefined ? item[0] : item[1]) + '">' + item[0] + '</option>');
        }

        var content = element.html();
        var icon = element.attr('data-icon');
        var align = element.attr('data-align');
        var multiple = element.attr('data-multiple');
        var size = element.attr('data-size');
        var style = element.attr('data-style');
        var html = '<select data-component-bind=""' + (align ? ' class="' + align + '"' : '') + (multiple ? ' multiple="' + multiple + '"' : '') + (size ? ' size="' + size + '"' : '') + (style ? ' style="' + style + '"' : '') + '>' + options.join('') + '</select>';

        if (content.length > 0) {
            element.empty();
            element.append('<div class="ui-dropdown-label' + (isRequired ? ' ui-dropdown-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div>');
            element.append('<div class="ui-dropdown-container">' + html + '</div>');
        } else {
            element.addClass('ui-dropdown-container');
            element.append(html);
        }

        var path = element.attr('data-source');
        datasource = path;

        if (!path)
            return;

        var prerender = function(path) {
            var value = self.get(datasource);
            if (value === undefined || value === null)
                value = [];
            self.render(value);
        };

        self.on('watch', path, prerender);
        prerender(null, self.get(path));
    };

    this.state = function(type) {
        element.find('.ui-dropdown').toggleClass('ui-dropdown-invalid', self.isInvalid());
    };
});

COMPONENT('autocomplete', function(self, config) {

    var container, old, onSearch, searchtimeout, searchvalue, blurtimeout, onCallback, datasource, offsetter = null;
    var is = false;
    var margin = {};

    self.template = Tangular.compile('<li{{ if index === 0 }} class="selected"{{ fi }} data-index="{{ index }}"><span>{{ name }}</span><span>{{ type }}</span></li>');
    self.readonly();
    self.singleton();

    self.make = function() {
        self.aclass('ui-autocomplete-container hidden');
        self.html('<div class="ui-autocomplete"><ul></ul></div>');
        container = self.find('ul');

        self.event('click', 'li', function(e) {
            e.preventDefault();
            e.stopPropagation();
            onCallback && onCallback(datasource[+$(this).attr('data-index')], old);
            self.visible(false);
        });

        self.event('mouseenter mouseleave', 'li', function(e) {
            $(this).tclass('selected', e.type === 'mouseenter');
        });

        $(document).on('click', function() {
            is && self.visible(false);
        });

        $(window).on('resize', function() {
            self.resize();
        });
    };

    function keydown(e) {
        var c = e.which;
        var input = this;

        if (c !== 38 && c !== 40 && c !== 13) {
            if (c !== 8 && c < 32)
                return;
            clearTimeout(searchtimeout);
            searchtimeout = setTimeout(function() {
                var val = input.value;
                if (!val)
                    return self.render(EMPTYARRAY);
                if (searchvalue === val)
                    return;
                searchvalue = val;
                self.resize();
                onSearch(val, function(value) { self.render(value); });
            }, 200);
            return;
        }

        var current = self.find('.selected');

        if (c === 13) {
            self.visible(false);
            if (current.length) {
                onCallback(datasource[+current.attr('data-index')], old);
                e.preventDefault();
                e.stopPropagation();
            }
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (current.length) {
            current.rclass('selected');
            current = c === 40 ? current.next() : current.prev();
        }

        if (!current.length)
            current = self.find('li:{0}-child'.format(c === 40 ? 'first' : 'last'));
        current.aclass('selected');
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

    self.attach = function(input, search, callback, top, left, width) {
        self.attachelement(input, input, search, callback, top, left, width);
    };

    self.attachelement = function(element, input, search, callback, top, left, width) {

        clearTimeout(searchtimeout);

        if (input.setter)
            input = input.find('input');
        else
            input = $(input);

        if (old) {
            old.removeAttr('autocomplete');
            old.off('blur', blur);
            old.off('keydown', keydown);
        }

        input.on('keydown', keydown);
        input.on('blur', blur);
        input.attr({ 'autocomplete': 'off' });

        old = input;
        margin.left = left;
        margin.top = top;
        margin.width = width;

        offsetter = $(element);
        self.resize();
        self.refresh();
        searchvalue = '';
        onSearch = search;
        onCallback = callback;
        self.visible(false);
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
            builder.push(self.template(obj));
        }

        container.empty().append(builder.join(''));
        self.visible(true);
    };
});


COMPONENT('validation', function() {

    var self = this;
    var path;
    var elements;

    self.readonly();

    self.make = function() {
        elements = self.find(self.attr('data-selector') || 'button');
        elements.prop({ disabled: true });
        self.evaluate = self.attr('data-if');
        path = self.path.replace(/\.\*$/, '');
        self.watch(self.path, self.state, true);
    };

    self.state = function() {
        var disabled = jC.disabled(path);
        if (disabled && self.evaluate)
            disabled = !EVALUATE(self.path, self.evaluate);

        elements.prop({ disabled: disabled });
    };
});

COMPONENT('confirm', function() {
    var self = this;
    var is = false;
    var visible = false;
    var timer;

    self.readonly();
    self.singleton();

    self.make = function() {
        self.element.addClass('ui-confirm hidden');
        self.element.on('click', 'button', function() {
            self.hide($(this).attr('data-index').parseInt());
        });
    };

    self.confirm = function(message, buttons, fn) {
        self.callback = fn;

        var builder = [];

        buttons.forEach(function(item, index) {
            builder.push('<button data-index="{1}">{0}</button>'.format(item, index));
        });

        self.content('ui-confirm-warning', '<div class="ui-confirm-message">{0}</div>{1}'.format(message.replace(/\n/g, '<br />'), builder.join('')));

        $(window).on('keyup', function(e) {
            if (!visible)
                return;
            if (e.keyCode === 27)
                self.hide();
        });
    };

    self.hide = function(index) {

        if (self.callback)
            self.callback(index);

        self.element.removeClass('ui-confirm-visible');
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(function() {
            visible = false;
            self.element.addClass('hidden');
        }, 1000);
    };

    self.content = function(cls, text) {

        if (!is)
            self.html('<div><div class="ui-confirm-body"></div></div>');

        if (timer)
            clearTimeout(timer);

        visible = true;
        self.element.find('.ui-confirm-body').empty().append(text);
        self.element.removeClass('hidden');
        setTimeout(function() {
            self.element.addClass('ui-confirm-visible');
        }, 5);
    };
});

COMPONENT('visible', function() {
    var self = this;
    var processed = false;
    var template = self.attr('data-template');
    self.readonly();
    self.setter = function(value) {

        var is = true;
        var condition = self.attr('data-if');

        if (condition)
            is = self.evaluate(condition);
        else
            is = value ? true : false;

        if (is && template && !processed) {
            IMPORT(template, self);
            processed = true;
        }

        self.toggle('hidden', !is);
    };
});

COMPONENT('checkbox', function(self, config) {

    self.validate = function(value) {
        return (config.disabled || !config.required) ? true : (value === true || value === 'true' || value === 'on');
    };

    self.configure = function(key, value, init) {
        if (init)
            return;
        switch (key) {
            case 'label':
                self.find('span').html(value);
                break;
            case 'required':
                self.find('span').tclass('ui-checkbox-label-required', value);
                break;
            case 'disabled':
                self.tclass('ui-disabled', value);
                break;
            case 'checkicon':
                self.find('i').rclass().aclass('fa fa-' + value);
                break;
        }
    };

    self.make = function() {
        self.aclass('ui-checkbox');
        self.html('<div><i class="fa fa-{2}"></i></div><span{1}>{0}</span>'.format(config.label || self.html(), config.required ? ' class="ui-checkbox-label-required"' : '', config.checkicon || 'check'));
        self.event('click', function() {
            if (config.disabled)
                return;
            self.dirty(false);
            self.getter(!self.get(), 2, true);
        });
    };

    self.setter = function(value) {
        self.toggle('ui-checkbox-checked', value ? true : false);
    };
});

COMPONENT('template', function() {

    var self = this;

    self.make = function(template) {
        if (template) {
            self.template = Tangular.compile(template);
            return;
        }
        var script = self.element.find('script');
        self.template = Tangular.compile(script.html());
        script.remove();
    };

    self.setter = function(value) {
        if (!value && !self.element.attr('data-error'))
            return self.element.hide();
        self.element.html(self.template(value)).show();
    };
});

COMPONENT('radiobutton', function() {
    var self = this;
    var required;

    self.make = function() {
        var options = self.attr('data-options').split(';');
        var builder = [];
        var html = self.html();

        required = self.attr('data-required') === 'true';

        if (html)
            builder.push('<div class="ui-radiobutton-label{1}">{0}</div>'.format(html, required ? ' ui-radiobutton-label-required' : ''));

        options.forEach(function(item) {
            item = item.split('|');
            builder.push('<span data-value="{0}"><i class="fa fa-circle-o"></i>{1}</span>'.format(item[0] || item[1], item[1] || item[0]));
        });

        self.element.addClass('ui-radiobutton');
        self.element.on('click', 'span', function(e) {
            var value = self.parser($(this).attr('data-value'));
            self.dirty(false, true);
            self.getter(value, 2);
        });

        self.html(builder.join(''));
    };

    self.validate = function(value) {
        if (!required)
            return true;
        return value ? true : false;
    };

    self.setter = function(value, path) {
        self.element.find('span').each(function() {
            var el = $(this);
            var is = el.attr('data-value') === (value === null || value === undefined ? null : value.toString());
            el.toggleClass('ui-radiobutton-selected', is);
            el.find('.fa').toggleClass('fa-circle-o', !is).toggleClass('fa-circle', is);
        });
    };
});


COMPONENT('repeater', function() {

    var self = this;
    self.make = function() {

        var element = self.element.find('script');
        var html = element.html();
        //	console.log(html);
        element.remove();
        self.template = Tangular.compile(html);
    };

    self.getter = null;
    self.setter = function(value) {

        if (!value || value.length === 0) {
            self.element.html('');
            return;
        }

        var builder = '';
        for (var i = 0, length = value.length; i < length; i++) {
            var item = value[i];
            item.index = i;
            builder += self.template(item).replace(/\$index/g, i.toString()).replace(/\$/g, self.path + '[' + i + ']');
        }

        /*if (self.element.attr('data-output')) {
	  var output = self.get(self.attr('data-output'));       
          self.html(output(value));
        }*/

        self.element.empty().append(builder);

        if (builder.indexOf('data-component="') !== -1)
            $.components.compile();
        else $.components();
    };

    self.prerender = function(index) {
        if (index === undefined) return false;
        var item = self.get()[index];
        self.element.find('tr[data-index="{0}"]'.format(index)).replaceWith(self.template(item).replace(/\$index/g, index.toString()).replace(/\$/g, self.path + '[' + index + ']'));
        return self;
    };

    //    if (self.attr('data-td-click')) {
    //      console.log('да');   
    /*      self.element.on('click', 'td', function(e) {
    	if (!$(e.target).closest('.btn-group, .btn, a').length) {                               
    //		console.log(self.attr('data-click'));
            	var fn = self.get(self.attr('data-click'));
    //		console.log(fn);
    	        if (fn) {
            	     fn(this);
    	        } 
    	}
          });*/
    //    }
});

COMPONENT('error', function(self, config) {
    self.readonly();
    self.make = function() {
        self.aclass('ui-error hidden');
    };

    self.setter = function(value) {

        if (!(value instanceof Array) || !value.length) {
            self.tclass('hidden', true);
            return;
        }

        var builder = [];
        for (var i = 0, length = value.length; i < length; i++)
            builder.push('<div><span class="fa {1}"></span>{0}</div>'.format(value[i].error, 'fa-' + (config.icon || 'times-circle')));

        self.html(builder.join(''));
        self.tclass('hidden', false);
    };
});

COMPONENT('dropdowncheckbox', function() {
    var self = this;
    var required = self.element.attr('data-required') === 'true';
    var datasource = '';
    var container;
    var data = [];
    var values;

    if (!window.$dropdowncheckboxtemplate)
        window.$dropdowncheckboxtemplate = Tangular.compile('<div><label><input type="checkbox" value="{{ index }}" /><span>{{ text }}</span></label></div>');

    var template = window.$dropdowncheckboxtemplate;

    self.validate = function(value) {
        return required ? value && value.length > 0 : true;
    };

    self.make = function() {

        var options = [];
        var element = self.element;
        var arr = (element.attr('data-options') || '').split(';');

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i].split('|');
            var value = item[1] === undefined ? item[0] : item[1];
            if (self.type === 'number')
                value = parseInt(value);
            var obj = { value: value, text: item[0], index: i };
            options.push(template(obj));
            data.push(obj);
        }

        var content = element.html();
        var icon = element.attr('data-icon');
        var html = '<div class="ui-dropdowncheckbox"><span class="fa fa-sort"></span><div class="ui-dropdowncheckbox-selected"></div></div><div class="ui-dropdowncheckbox-values hidden">' + options.join('') + '</div>';

        if (content.length > 0) {
            element.empty();
            element.append('<div class="ui-dropdowncheckbox-label' + (required ? ' ui-dropdowncheckbox-label-required' : '') + '">' + (icon ? '<span class="fa ' + icon + '"></span> ' : '') + content + ':</div>');
            element.append(html);
        } else
            element.append(html);

        self.element.addClass('ui-dropdowncheckbox-container');
        container = self.element.find('.ui-dropdowncheckbox-values');
        values = self.element.find('.ui-dropdowncheckbox-selected');

        self.element.on('click', '.ui-dropdowncheckbox', function(e) {

            var el = $(this);
            if (el.hasClass('ui-disabled'))
                return;

            container.toggleClass('hidden');

            if (window.$dropdowncheckboxelement) {
                window.$dropdowncheckboxelement.addClass('hidden');
                window.$dropdowncheckboxelement = null;
            }

            if (!container.hasClass('hidden'))
                window.$dropdowncheckboxelement = container;

            e.stopPropagation();
        });

        self.element.on('click', 'input,label', function(e) {

            e.stopPropagation();

            var is = this.checked;
            var index = parseInt(this.value);
            var value = data[index];

            if (value === undefined)
                return;

            value = value.value;

            var arr = self.get();
            if (!(arr instanceof Array))
                arr = [];

            var index = arr.indexOf(value);

            if (is) {
                if (index === -1)
                    arr.push(value);
            } else {
                if (index !== -1)
                    arr.splice(index, 1);
            }

            self.reset(true);
            self.set(arr, undefined, 2);
        });

        var ds = self.attr('data-source');

        if (!ds)
            return;

        self.watch(ds, prepare);
        setTimeout(function() {
            prepare(ds, GET(ds));
        }, 500);
    };

    function prepare(path, value) {

        if (NOTMODIFIED(path, value))
            return;

        var clsempty = 'ui-dropdowncheckbox-values-empty';

        if (!value) {
            container.addClass(clsempty).empty().html(self.attr('data-empty'));
            return;
        }

        var kv = self.attr('data-source-value') || 'id';
        var kt = self.attr('data-source-text') || 'name';
        var builder = '';

        data = [];
        for (var i = 0, length = value.length; i < length; i++) {
            var isString = typeof(value[i]) === 'string';
            var item = { value: isString ? value[i] : value[i][kv], text: isString ? value[i] : value[i][kt], index: i };
            data.push(item);
            builder += template(item);
        }

        if (builder)
            container.removeClass(clsempty).empty().append(builder);
        else
            container.addClass(clsempty).empty().html(self.attr('data-empty'));

        self.setter(self.get());
    }

    self.setter = function(value) {

        if (NOTMODIFIED(self.id, value))
            return;

        var label = '';
        var empty = self.attr('data-placeholder');

        if (value && value.length) {
            var remove = [];
            for (var i = 0, length = value.length; i < length; i++) {
                var selected = value[i];
                var index = 0;
                var is = false;

                while (true) {
                    var item = data[index++];
                    if (item === undefined)
                        break;
                    if (item.value != selected)
                        continue;
                    label += (label ? ', ' : '') + item.text;
                    is = true;
                }

                if (!is)
                    remove.push(selected);
            }

            var refresh = false;

            while (true) {
                var item = remove.shift();
                if (item === undefined)
                    break;
                value.splice(value.indexOf(item), 1);
                refresh = true;
            }

            if (refresh)
                MAN.set(self.path, value);
        }

        container.find('input').each(function() {
            var index = parseInt(this.value);
            var checked = false;
            if (!value || !value.length)
                checked = false;
            else if (data[index])
                checked = data[index];
            if (checked)
                checked = value.indexOf(checked.value) !== -1;
            this.checked = checked;
        });

        if (!label && value) {
            // invalid data
            // it updates model without notification
            MAN.set(self.path, []);
        }

        if (!label && empty) {
            values.html('<span>{0}</span>'.format(empty));
            return;
        }

        values.html(label);
    };

    self.state = function(type) {
        self.element.find('.ui-dropdowncheckbox').toggleClass('ui-dropdowncheckbox-invalid', self.isInvalid());
    };

    if (window.$dropdowncheckboxevent)
        return;

    window.$dropdowncheckboxevent = true;
    $(document).on('click', function(e) {
        if (!window.$dropdowncheckboxelement)
            return;
        window.$dropdowncheckboxelement.addClass('hidden');
        window.$dropdowncheckboxelement = null;
    });
});

COMPONENT('tabmenu', function() {
    var self = this;
    self.readonly();
    self.make = function() {
        self.element.on('click', 'li', function() {
            var el = $(this);
            !el.hasClass('selected') && self.set(el.attr('data-value'));
        });
    };
    self.setter = function(value) {
        var cl = self.element.find('li[data-value="' + value + '"]').attr('data-class') || '';
        //self.element.find('.selected').removeClass('selected');
        self.element.find('.selected').removeClass();
        self.element.find('li[data-value="' + value + '"]').addClass('selected bold ' + cl);
    };
});

COMPONENT('resource', function(self) {

    self.readonly();
    self.blind();

    self.init = function() {
        window.RESOURCEDB = {};
        window.RESOURCE = function(name, def) {
            return RESOURCEDB[name] || def || name;
        };
    };

    self.download = function(url, callback) {
        AJAX('GET ' + url, function(response) {
            if (!response) {
                callback && callback();
                return;
            }

            if (typeof(response) !== 'string')
                response = response.toString();
            self.prepare(response);
            callback && callback();
        });
    };

    self.prepare = function(value) {
        var w = window;
        value.split('\n').forEach(function(line) {

            var clean = line.trim();
            if (clean.substring(0, 2) === '//')
                return;

            var index = clean.indexOf(':');
            if (index === -1)
                return;

            var key = clean.substring(0, index).trim();
            var value = clean.substring(index + 1).trim();

            w.RESOURCEDB[key] = value;
        });
        return self;
    };

    self.make = function() {
        var el = self.find('script');
        self.prepare(el.html());
        el.remove();
    };
});

COMPONENT('binder', function() {

    var self = this;
    var keys;
    var keys_unique;

    self.readonly();
    self.blind();

    self.make = function() {
        self.watch('*', self.autobind);
        self.scan();

        self.on('component', function() {
            setTimeout2(self.id, self.scan, 200);
        });

        self.on('destroy', function() {
            setTimeout2(self.id, self.scan, 200);
        });
    };

    self.autobind = function(path, value) {
        var mapper = keys[path];
        var template = {};
        mapper && mapper.forEach(function(item) {
            var value = self.get(item.path);
            template.value = value;
            item.classes && classes(item.element, item.classes(value));
            item.visible && item.element.toggleClass('hidden', item.visible(value) ? false : true);
            item.html && item.element.html(item.html(value));
            item.template && item.element.html(item.template(template));
        });
    };

    function classes(element, val) {
        var add = '';
        var rem = '';
        val.split(' ').forEach(function(item) {
            switch (item.substring(0, 1)) {
                case '+':
                    add += (add ? ' ' : '') + item.substring(1);
                    break;
                case '-':
                    rem += (rem ? ' ' : '') + item.substring(1);
                    break;
                default:
                    add += (add ? ' ' : '') + item;
                    break;
            }
        });
        rem && element.removeClass(rem);
        add && element.addClass(add);
    }

    function decode(val) {
        return val.replace(/\&\#39;/g, '\'');
    }

    self.scan = function() {
        keys = {};
        keys_unique = {};
        self.find('[data-binder]').each(function() {

            var el = $(this);
            var path = el.attr('data-binder');
            var arr = path.split('.');
            var p = '';

            var classes = el.attr('data-binder-class');
            var html = el.attr('data-binder-html');
            var visible = el.attr('data-binder-visible');
            var obj = el.data('data-binder');

            keys_unique[path] = true;

            if (!obj) {
                obj = {};
                obj.path = path;
                obj.element = el;
                obj.classes = classes ? FN(decode(classes)) : undefined;
                obj.html = html ? FN(decode(html)) : undefined;
                obj.visible = visible ? FN(decode(visible)) : undefined;

                var tmp = el.find('script[type="text/html"]');
                var str = '';
                if (tmp.length)
                    str = tmp.html();
                else
                    str = el.html();

                if (str.indexOf('{{') !== -1) {
                    obj.template = Tangular.compile(str);
                    tmp.length && tmp.remove();
                }

                el.data('data-binder', obj);
            }

            for (var i = 0, length = arr.length; i < length; i++) {
                p += (p ? '.' : '') + arr[i];
                if (keys[p])
                    keys[p].push(obj);
                else
                    keys[p] = [obj];
            }

        });

        Object.keys(keys_unique).forEach(function(key) {
            self.autobind(key, self.get(key));
        });

        return self;
    };

});

COMPONENT('contextmenu', function() {
    var self = this;
    var $window = $(window);
    var is = false;
    var timeout;
    var container;
    var arrow;

    function disable_scroll() {
        document.ontouchmove = function(e) {
            e.preventDefault();
        }
    }

    function enable_scroll() {
        document.ontouchmove = function(e) {
            return true;
        }
    }

    self.template = Tangular.compile('<div data-value="{{ value }}"{{ if selected }} class="selected"{{ fi }}><i class="fa {{ icon }}"></i><span>{{ name | raw }}</span></div>');
    self.singleton();
    self.readonly();
    self.callback = null;

    self.make = function() {

        self.element.addClass('ui-contextmenu');
        self.element.append('<span class="ui-contextmenu-arrow fa fa-caret-up"></span><div class="ui-contextmenu-items"></div>');
        container = self.element.find('.ui-contextmenu-items');
        arrow = self.element.find('.ui-contextmenu-arrow');

        self.element.on('touchstart mousedown', 'div[data-value]', function(e) {
            self.callback && self.callback($(this).attr('data-value'), $(self.target));
            self.hide();
            e.preventDefault();
            e.stopPropagation();
        });

        $(document).on('touchstart mousedown', function(e) {
            FIND('contextmenu').hide();
        });

        $(document).on('keyup', function(e) {
            if (e.keyCode === 27) self.hide();
        });

        $(document).on('mousewheel', function(e) {
            self.hide();
        });

    };

    self.show = function(orientation, target, items, callback) {
        if (is) {
            clearTimeout(timeout);
            var obj = target instanceof jQuery ? target.get(0) : target;
            if (self.target === obj) {
                self.hide(0);
                return;
            }
        }

        target = $(target);
        var type = typeof(items);
        var item;

        if (type === 'string')
            items = self.get(items);
        else if (type === 'function') {
            callback = items;
            items = (target.attr('data-options') || '').split(';');
            for (var i = 0, length = items.length; i < length; i++) {
                item = items[i];
                if (!item)
                    continue;
                var val = item.split('|');
                items[i] = { name: val[0], icon: val[1], value: val[2] || val[0] };
            }
        }

        if (!items) {
            self.hide(0);
            return;
        }

        self.callback = callback;

        var builder = [];
        for (var i = 0, length = items.length; i < length; i++) {
            item = items[i];
            item.index = i;
            if (!item.value)
                item.value = item.name;
            if (!item.icon)
                item.icon = 'fa-caret-right';
            builder.push(self.template(item));
        }

        self.target = target.get(0);
        var offset = target.offset();

        container.html(builder);

        switch (orientation) {
            case 'left':
                arrow.css({ left: '15px' });
                break;
            case 'right':
                arrow.css({ left: '210px' });
                break;
            case 'center':
                arrow.css({ left: '107px' });
                break;
        }
        if (offset.top + target.innerHeight() + self.element.height() + 10 > $(document).height()) {
            var options = { left: orientation === 'center' ? Math.ceil((offset.left - self.element.width() / 2) + (target.innerWidth() / 2)) : orientation === 'left' ? offset.left - 8 : (offset.left - self.element.width()) + target.innerWidth(), top: offset.top - self.element.height() - 10 };
            container.html(builder.reverse());
            arrow.removeClass('fa-caret-up');
            arrow.addClass('fa-caret-down');
            arrow.css({ top: self.element.height() - 10 + 'px' });
        } else {
            var options = { left: orientation === 'center' ? Math.ceil((offset.left - self.element.width() / 2) + (target.innerWidth() / 2)) : orientation === 'left' ? offset.left - 8 : (offset.left - self.element.width()) + target.innerWidth(), top: offset.top + target.innerHeight() + 10 };
            arrow.css({ top: '-20px' });
        }
        options.position = 'fixed';        
        self.element.css(options);

        if (is)
            return;

        self.element.show();
        setTimeout(function() {
            self.element.addClass('ui-contextmenu-visible');
            self.emit('contextmenu', true, self, self.target);
        }, 100);

        is = true;
    };

    self.hide = function(sleep) {
        if (!is)
            return;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            self.element.hide().removeClass('ui-contextmenu-visible');
            self.emit('contextmenu', false, self, self.target);
            self.callback = null;
            self.target = null;
            is = false;
        }, sleep ? sleep : 100);
    };
});

COMPONENT('websocket', function() {

    var reconnect_timeout;
    var self = this;
    var ws;
    var url;

    self.online = false;
    self.readonly();

    self.make = function() {
        reconnect_timeout = (self.attr('data-reconnect') || '2000').parseInt();
        url = self.attr('data-url');
        if (!url.match(/^(ws|wss)\:\/\//))
            url = (location.protocol.length === 6 ? 'wss' : 'ws') + '://' + location.host + (url.substring(0, 1) !== '/' ? '/' : '') + url;
        setTimeout(self.connect, 500);
        self.destroy = self.close;
    };

    self.send = function(obj) {
        ws && ws.send(JSON.stringify(obj));
        return self;
    };

    self.close = function(isClosed) {
        if (!ws)
            return self;
        self.online = false;
        ws.onopen = ws.onclose = ws.onmessage = null;
        !isClosed && ws.close();
        ws = null;
        return self;
    };

    function onClose(e) {
        self.set('close');
        self.close(true);
        setTimeout(function() {
            self.connect();
        }, reconnect_timeout);
    }

    function onError(e) {
        self.set('error');
        self.close(true);
        setTimeout(function() {
            self.connect();
        }, reconnect_timeout);
    }

    function onMessage(e) {
        try {
            self.set(JSON.parse(decodeURIComponent(e.data)));
        } catch (e) {
            window.console && console.warn('WebSocket "{0}": {1}'.format(url, e.toString()));
        };
    }

    function onOpen() {
        self.set('open');
        self.online = true;
    }

    self.connect = function() {
        ws && self.close();
        timeout = setTimeout(function() {
            ws = new WebSocket(url);
            ws.onopen = onOpen;
            ws.onclose = onClose;
            ws.onerror = onError;
            ws.onmessage = onMessage;
        }, 100);
        return self;
    };
});

COMPONENT('form', function() {

    var self = this;
    var autocenter;

    if (!MAN.$$form) {
        window.$$form_level = window.$$form_level || 1000;
        MAN.$$form = true;
        $(document).on('click', '.ui-form-button-close', function() {
            SET(FIND('#' + $(this).attr('data-id')).path, '');
            window.$$form_level--;
        });

        $(window).on('resize', function() {
            FIND('form', true).forEach(function(component) {
                !component.element.hasClass('hidden') && component.resize();
            });
        });

        $(document).on('click', '.ui-form-container', function(e) {
            var el = $(e.target);
            if (!(el.hasClass('ui-form-container-padding') || el.hasClass('ui-form-container')))
                return;
            var form = $(this).find('.ui-form');
            var cls = 'ui-form-animate-click';
            form.addClass(cls);
            setTimeout(function() {
                form.removeClass(cls);
            }, 300);
        });
    }

    self.readonly();
    self.submit = function(hide) { self.hide(); };
    self.cancel = function(hide) { self.hide(); };
    self.onHide = function() {};

    var hide = self.hide = function() {
        self.set('');
        self.onHide();
    };

    self.resize = function() {
        if (!autocenter)
            return;
        var ui = self.find('.ui-form');
        var fh = ui.innerHeight();
        var wh = $(window).height();
        var r = (wh / 2) - (fh / 2);
        if (r > 30)
            ui.css({ marginTop: (r - 15) + 'px' });
        else
            ui.css({ marginTop: '20px' });
    };

    self.title = function(value) {
        self.find('.ui-form-title-value').html(value);
        return self;
    };

    self.wtype = function(value) {
        var $el = self.find('.ui-form-container-padding');
        $el.removeClass("success danger").addClass(value);
        return self;
    };


    self.make = function() {
        var width = self.attr('data-width') || '800px';
        var submit = self.attr('data-submit');
        var enter = self.attr('data-enter');
        var type = self.attr('data-type') || '';
        autocenter = self.attr('data-autocenter') === 'true';
        self.condition = self.attr('data-if');

        $(document.body).append('<div id="{0}" class="hidden ui-form-container"><div class="ui-form-container-padding {5}"><div class="ui-form" style="max-width:{1}"><div class="ui-form-title"><span class="fa fa-times ui-form-button-close" data-id="{2}"></span><span class="ui-form-title-value">{3}</span></div>{4}</div></div>'.format(self._id, width, self.id, self.attr('data-title'), '', type));

        var el = $('#' + self._id);
        el.find('.ui-form').get(0).appendChild(self.element.get(0));
        self.element.removeClass('hidden');
        self.element = el;

        self.element.on('scroll', function() {
            EXEC('$calendar.hide');
        });

        self.element.find('button').on('click', function(e) {
            window.$$form_level--;
            switch (this.name) {
                case 'submit':
                    self.submit(hide);
                    break;
                case 'cancel':
                    !this.disabled && self[this.name](hide);
                    break;
            }
        });

        enter === 'true' && self.element.on('keydown', 'input', function(e) {
            e.keyCode === 13 && !self.element.find('button[name="submit"]').get(0).disabled && self.submit(hide);
        });

        return true;
    };

    self.getter = null;
    self.setter = function(value) {

        setTimeout2('noscroll', function() {
            $('html').toggleClass('noscroll', $('.ui-form-container').not('.hidden').length ? true : false);
        }, 50);

        var isHidden = !EVALUATE(self.path, self.condition);
        self.element.toggleClass('hidden', isHidden);
        EXEC('$calendar.hide');
        if (isHidden) {
            self.element.find('.ui-form').removeClass('ui-form-animate');
            return;
        }

        $(window).on('keyup', function(e) {
            if (isHidden) return;
            if (e.keyCode === 27)
                self.hide();
        });

        self.resize();
        var el = self.element.find('input,select,textarea');
        el.length > 0 && el.eq(0).focus();
        window.$$form_level++;
        self.element.css('z-index', window.$$form_level * 5);
        self.element.animate({ scrollTop: 0 }, 0, function() {
            setTimeout(function() {
                self.element.find('.ui-form').addClass('ui-form-animate');
            }, 300);
        });
    };
});
//NATIFICATIONS
COMPONENT('notifications', function() {
    var self = this;
    var autoclosing;

    self.singleton();
    self.readonly();
    self.template = Tangular.compile('<div class="ui-notification {{ type }}" data-id="{{ id }}"{{ if callback }} style="cursor:pointer"{{ fi }}><i class="fa fa-times-circle"></i><div class="ui-notification-icon">{{if icon }}<i class="fa {{ icon }}"></i>{{fi}}{{if image }}{{ image | raw }}{{fi}}</div><div class="ui-notification-message"><div class="ui-notification-datetime">{{ date | format(\'{0}\') }}</div>{{ message | raw }}</div></div>'.format(self.attr('data-date-format') || 'yyyy-MM-dd HH:mm'));
    self.items = {};

    self.make = function() {

        self.element.addClass('ui-notification-container');

        self.element.on('click', '.fa-times-circle', function() {
            var el = $(this).closest('.ui-notification');
            self.close(+el.attr('data-id'));
            clearTimeout(autoclosing);
            autoclosing = null;
            self.autoclose();
        });

        self.element.on('click', 'a,button', function() {
            e.stopPropagation();
        });

        self.element.on('click', '.ui-notification', function(e) {
            var el = $(this);
            var id = +el.attr('data-id');
            var obj = self.items[id];
            if (!obj || !obj.callback)
                return;
            obj.callback();
            self.close(id);
        });
    };

    self.close = function(id) {
        var obj = self.items[id];
        if (!obj)
            return;
        obj.callback = null;
        delete self.items[id];
        self.find('div[data-id="{0}"]'.format(id)).remove();
    };
    //icon, message, date
    self.append = function(o, callback) {
        type = (o.t) ? o.t : '';
        icon = (o.ic) ? 'fa-' + o.ic : null;
        image = (o.im) ? "<img class='img-rounded img-responsive' src='" + o.im + "'>" : null;

        if (typeof(o.dt) === 'function') {
            callback = o.d;
            o.d = null;
        }

        var obj = { id: Math.floor(Math.random() * 100000), type: type, icon: icon, image: image, message: o.m, date: o.d || new Date(), callback: callback };
        self.items[obj.id] = obj;
        self.element.append(self.template(obj));
        self.autoclose();
    };

    self.timeout = function(value) {
        self.attr('data-timeout', value);
        return self;
    };

    self.autoclose = function() {
        if (autoclosing)
            return self;
        autoclosing = setTimeout(function() {
            clearTimeout(autoclosing);
            autoclosing = null;
            var el = self.find('.ui-notification');
            if (el.length > 1)
                self.autoclose();
            if (el.length)
                self.close(+el.eq(0).attr('data-id'));
        }, +self.attr('data-timeout') || 5000);
    };
});

COMPONENT('audio', function() {
    var self = this;
    var can = false;
    var volume = 0.5;

    self.items = [];
    self.readonly();
    self.singleton();

    self.make = function() {
        var audio = document.createElement('audio');
        if (audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, ''))
            can = true;
    };

    self.play = function(url, loop) {

        if (!can)
            return;

        var audio = new window.Audio();

        audio.src = url;
        audio.volume = volume;
        audio.loop = (loop) ? true : false;
        audio.play();

        audio.onended = function() {
            audio.$destroy = true;
            self.cleaner();
        };

        audio.onerror = function() {
            audio.$destroy = true;
            self.cleaner();
        };

        audio.onabort = function() {
            audio.$destroy = true;
            self.cleaner();
        };

        self.items.push(audio);
        return self;
    };

    self.cleaner = function() {
        var index = 0;
        while (true) {
            var item = self.items[index++];
            if (item === undefined)
                return self;
            if (!item.$destroy)
                continue;
            item.pause();
            item.onended = null;
            item.onerror = null;
            item.onsuspend = null;
            item.onabort = null;
            item = null;
            index--;
            self.items.splice(index, 1);
        }
        return self;
    };

    self.stop = function(url) {
        if (!url) {
            self.items.forEach(function(item) {
                item.$destroy = true;
            });
            return self.cleaner();
        }

        var index = self.items.findIndex(function(item) {
            var pos = 0;
            url.indexOf(item.src, pos);
            if (pos > -1) return true;
        });

        if (index === -1)
            return self;
        self.items[index].$destroy = true;
        return self.cleaner();
    };

    self.setter = function(value) {

        if (value === undefined)
            value = 0.5;
        else
            value = (value / 100);

        if (value > 1)
            value = 1;
        else if (value < 0)
            value = 0;

        volume = value ? +value : 0;
        for (var i = 0, length = self.items.length; i < length; i++) {
            var a = self.items[i];
            if (!a.$destroy)
                a.volume = value;
        }
    };
});
//Exec
COMPONENT('exec', function() {
    var self = this;
    self.readonly();
    self.blind();
    self.make = function() {
        self.event('click', self.attr('data-selector') || '.exec', function() {
            var el = $(this);
            var attr = el.attr('data-exec');
            var path = el.attr('data-path');
            attr && EXEC(attr, el);
            path && SET(path, new Function('return ' + el.attr('data-value'))());
        });
    };
});
//counter
COMPONENT('counter', function() {
    var self = this;
    self.readonly();
    self.class = function(value) {
        if (!value) return;
        self.element.removeClass();
        self.element.addClass('label ' + value);
        return self;
    };
    self.setter = function(value) {
        if (!value || value == 0) value = null;
        var cl = self.element.attr('data-opt');
        self.element.removeClass();
        self.element.addClass('label ' + cl);
        self.html(value);
    };
});

COMPONENT('range', function() {
    var self = this;
    var required = self.attr('data-required');

    self.noValid();

    self.make = function() {
        var name = self.html();
        if (name)
            name = '<div class="ui-range-label{1}">{0}</div>'.format(name, required ? ' ui-range-label-required' : '');
        var attrs = [];
        attrs.attr('step', self.attr('data-step'));
        attrs.attr('max', self.attr('data-max'));
        attrs.attr('min', self.attr('data-min'));
        self.classes('ui-range');
        self.html('{0}<input type="range" data-jc-bind=""{1} />'.format(name, attrs.length ? ' ' + attrs.join(' ') : ''));
    };
});

COMPONENT('checkboxlist', function() {

    var self = this;
    var isRequired = self.attr('data-required');
    var template = Tangular.compile('<div class="{0} ui-checkboxlist-checkbox"><label><input type="checkbox" value="{{ id }}"><span>{{ name }}</span></label></div>'.format(self.attr('data-class')));

    self.validate = function(value) {
        return isRequired ? value && value.length > 0 : true;
    };

    self.required = function(value) {
        isRequired = value;
        return self;
    };

    !isRequired && self.noValid();

    self.make = function() {

        self.event('click', 'input', function() {
            var arr = self.get() || [];
            var value = self.parser(this.value);
            var index = arr.indexOf(value);
            if (index === -1)
                arr.push(value);
            else
                arr.splice(index, 1);
            self.set(arr);
        });

        self.event('click', '.ui-checkboxlist-selectall', function() {
            var arr = [];
            var inputs = self.find('input');
            var value = self.get();

            if (value && inputs.length === value.length) {
                self.set(arr);
                return;
            }

            inputs.each(function() {
                arr.push(self.parser(this.value));
            });

            self.set(arr);
        });

        var datasource = self.attr('data-source');
        datasource && self.watch(datasource, function(path, value) {
            if (!value)
                value = [];
            self.redraw(value);
        }, true);

        var options = self.attr('data-options');
        if (!options)
            return;

        var arr = options.split(';');
        var datasource = [];

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i].split('|');
            datasource.push({ id: item[1] === undefined ? item[0] : item[1], name: item[0] });
        }

        self.redraw(datasource);
    };

    self.setter = function(value) {
        self.find('input').each(function() {
            this.checked = value && value.indexOf(self.parser(this.value)) !== -1;
        });
    };

    self.redraw = function(arr) {
        var builder = [];
        var kn = self.attr('data-source-text') || 'name';
        var kv = self.attr('data-source-value') || 'id';

        for (var i = 0, length = arr.length; i < length; i++) {
            var item = arr[i];
            if (typeof(item) === 'string')
                builder.push(template({ id: item, name: item }));
            else
                builder.push(template({ id: item[kv] === undefined ? item[kn] : item[kv], name: item[kn] }));
        }

        if (!builder.length)
            return;

        var btn = self.attr('data-button') || '';
        if (btn)
            btn = '<div class="ui-checkboxlist-selectall"><a href="javascript:void(0)"><i class="fa fa-check-square-o mr5"></i>{0}</a></div>'.format(btn);

        builder.push('<div class="clearfix"></div>' + btn);
        self.html(builder.join(''));
        return self;
    };
});

COMPONENT('suggestion', function(self, config) {

    var container, arrow, timeout, input = null;
    var is = false;

    self.items = null;
    self.keys = null;
    self.template = Tangular.compile('<li data-index="{{ $.index }}"{{ if selected }} class="selected"{{ fi }}>{{ name | raw }} <span>{{value}}</span></li>');
    //self.template = Tangular.compile('<li data-index="{{ $.index }}"{{ if selected }} class="selected"{{ fi }}>{{ name | raw }} </li>');
    self.callback = null;
    self.readonly();
    self.singleton();

    self.configure = function(key, value, init) {        
        if (init) return;
        switch (key) {
            case 'placeholder':
                self.find('input').prop('placeholder', value);
                break;            
        }
    };    

    self.make = function() {

        self.aclass('ui-suggestion');
        self.append('<i class="ui-suggestion-arrow fa fa-caret-up"></i><div class="ui-suggestion-search"><span><i class="fa fa-search"></i></span><div><input type="text" placeholder="{0}" class="ui-suggestion-search-input" /></div></div><div class="ui-suggestion-container"><ul></ul></div>'.format(config.placeholder));
        container = self.find('ul');
        arrow = self.find('.ui-suggestion-arrow');
        input = self.find('input');

        self.event('touchstart mousedown', 'li[data-index]', function(e) {
            self.callback && self.callback(self.items[+this.getAttribute('data-index')], $(self.target));
            self.hide();
            e.preventDefault();
            e.stopPropagation();
        });

        $(document).on('touchstart mousedown', function(e) {
            is && !$(e.target).hasClass('ui-suggestion-search-input') && self.hide(0);
        });

        $(window).on('resize', function() {
            is && self.hide(0);
        });

        self.event('keyup', 'input', function() {
            setTimeout2(self.id, self.search, 100, null, this.value);
        });
    };

    self.search = function(value) {

        if (!value) {
            container.find('li').removeClass('hidden');
            return;
        }
        //console.log(value);
        value = value.toSearch();                
        container.find('li').each(function() {
            var el = $(this);            
            var val = this.innerText.toSearch();
            el.tclass('hidden', val.indexOf(value) === -1);
        });
    };

    self.show = function(orientation, target, items, callback) {

        if (is) {
            clearTimeout(timeout);
            var obj = target instanceof jQuery ? target.get(0) : target;
            if (self.target === obj) {
                self.hide(0);
                return;
            }
        }

        target = $(target);
        var type = typeof(items);
        var item;

        if (type === 'string')
            items = self.get(items);
        else if (type === 'function') {
            callback = items;
            items = (target.attr('data-options') || '').split(';');
            for (var i = 0, length = items.length; i < length; i++) {
                item = items[i];
                if (!item)
                    continue;
                var val = item.split('|');
                items[i] = { name: val[0], value: val[2] == null ? val[0] : val[2] };
            }
        }
        //изменим тип ключей
        if (config.item_value || config.item_name) {
            self.keys = {};
            self.keys[config.item_value] = 'value';
            self.keys[config.item_name] = 'name';        
        }
        
        if (self.keys) {                                    
            var items_change = items.map(function(obj) {
                return _.mapKeys(obj, function(value, key) {
                    if (self.keys[key]) return self.keys[key];
                     else return key;                                            
                });
            }); 
            items = items_change;   
        }           

        if (!items) {
            self.hide(0);
            return;
        }

        self.items = items;
        self.callback = callback;
        input.val('');

        var builder = [];
        var indexer = {};

        for (var i = 0, length = items.length; i < length; i++) {
            item = items[i];
            indexer.index = i;
            !item.value && (item.value = item.name);
            builder.push(self.template(item, indexer));
        }

        self.target = target.get(0);
        var offset = target.offset();

        container.html(builder);

        switch (orientation) {
            case 'left':
                arrow.css({ left: '15px' });
                break;
            case 'right':
                arrow.css({ left: '210px' });
                break;
            case 'center':
                arrow.css({ left: '107px' });
                break;
        }

        //var options = { left: orientation === 'center' ? Math.ceil((offset.left - self.element.width() / 2) + (target.innerWidth() / 2)) : orientation === 'left' ? offset.left - 8 : (offset.left - self.element.width()) + target.innerWidth(), top: offset.top + target.innerHeight() + 10 };
        if (offset.top + target.innerHeight() + self.element.height() + 10 > $(document).height()) {
            var options = { left: orientation === 'center' ? Math.ceil((offset.left - self.element.width() / 2) + (target.innerWidth() / 2)) : orientation === 'left' ? offset.left - 8 : (offset.left - self.element.width()) + target.innerWidth(), top: offset.top - self.element.height() - 10 };
            arrow.removeClass('fa-caret-up');
            arrow.addClass('fa-caret-down');
            arrow.css({ top: self.element.height() - 10 + 'px' });
        } else {
            var options = { left: orientation === 'center' ? Math.ceil((offset.left - self.element.width() / 2) + (target.innerWidth() / 2)) : orientation === 'left' ? offset.left - 8 : (offset.left - self.element.width()) + target.innerWidth(), top: offset.top + target.innerHeight() + 10 };         
            arrow.css({ top: '-20px' });
        }
        options.position = 'fixed';
        self.css(options);

        if (is)
            return;

        self.element.show();
        setTimeout(function() {
            self.aclass('ui-suggestion-visible');
            self.emit('suggestion', true, self, self.target);
        }, 100);

        !isMOBILE && setTimeout(function() {
            input.focus();
        }, 500);

        is = true;
    };

    self.hide = function(sleep) {
        if (!is)
            return;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            self.element.hide().rclass('ui-suggestion-visible');
            self.emit('suggestion', false, self, self.target);
            self.callback = null;
            self.target = null;
            is = false;
        }, sleep ? sleep : 100);
    };

});  

COMPONENT('inlineform', function(self, config) {

    var W = window;
    var header = null;
    var dw = 300;
    var arrow;

    if (!W.$$inlineform) {
        W.$$inlineform = true;
        $(document).on('click', '.ui-inlineform-close', function() {
            SETTER('inlineform', 'hide');
        });
        $(window).on('resize', function() {
            SETTER('inlineform', 'hide');
        });
    }

    self.readonly();
    self.submit = function() {
        if (config.submit)
            EXEC(config.submit, self);
        else
            self.hide();
    };

    self.cancel = function() {
        config.cancel && EXEC(config.cancel, self);
        self.hide();
    };

    self.hide = function() {
        if (self.hclass('hidden'))
            return;
        self.release(true);
        self.aclass('hidden');
        self.find('.ui-inlineform').rclass('ui-inlineform-animate');
    };

    self.make = function() {

        var icon;

        if (config.icon)
            icon = '<i class="fa fa-{0}"></i>'.format(config.icon);
        else
            icon = '<i></i>';

        $(document.body).append('<div id="{0}" class="hidden ui-inlineform-container" style="max-width:{1}"><div class="ui-inlineform"><i class="ui-inlineform-arrow fa fa-caret-up"></i><div class="ui-inlineform-title"><button class="ui-inlineform-close"><i class="fa fa-times"></i></button>{4}<span>{3}</span></div></div></div>'.format(self._id, (config.width || dw) + 'px', self.path, config.title, icon));

        var el = $('#' + self._id);        
        el.find('.ui-inlineform').get(0).appendChild(self.element.get(0));
        self.rclass('hidden');
        self.replace(el);

        header = self.virtualize({ title: '.ui-inlineform-title > span', icon: '.ui-inlineform-title > i' });

        self.find('button').on('click', function() {
            var el = $(this);
            switch (this.name) {
                case 'submit':
                    if (el.hasClass('exec'))
                        self.hide();
                    else
                        self.submit(self.hide);
                    break;
                case 'cancel':
                    !this.disabled && self[this.name](self.hide);
                    break;
            }
        });        
        config.enter && self.event('keydown', 'input', function(e) {
	    console.log('нажата');	
            e.which === 13 && !self.find('button[name="submit"]').get(0).disabled && self.submit(self.hide);
        });
    };

    self.configure = function(key, value, init) {
        if (init)
            return;
        switch (key) {
            case 'icon':
                header.icon.rclass(header.icon.attr('class'));
                value && header.icon.aclass('fa fa-' + value);
                break;
            case 'title':
                header.title.html(value);
                break;
        }
    };

    self.toggle = function(target, position) {
        if (self.hclass('hidden'))
            self.show(target, position);
        else
            self.hide();
    };

    self.show = function(target, position) {

        SETTER('inlineform', 'hide');

        self.rclass('hidden');
        self.release(false);
        target = $(target);    
        self.target = target.get(0);
        arrow = self.find('.ui-inlineform-arrow');
        var offset = target.offset();        
        var w = config.width || dw;
        var ma = 35;

        /*switch (orientation) {
            case 'left':
                arrow.css({ left: '15px' });
                break;
            case 'right':
                arrow.css({ left: '210px' });
                break;
            case 'center':
                arrow.css({ left: '107px' });
                break;
        }*/        

        if (position === 'right') {
            offset.left -= w - target.width();
            ma = w - 35;
        } else if (position === 'center') {
            ma = (w / 2);
            offset.left -= ma - (el.target() / 2);
            ma -= 12;
        }
        arrow.css({ 'margin-left': ma });
        if (offset.top + target.innerHeight() + self.element.height() + 10 > $(document).height()) {            
            offset.top =  offset.top - self.element.height() - 10;
            arrow.removeClass('fa-caret-up');
            arrow.addClass('fa-caret-down');
            arrow.css({ top: self.element.height() + 10 + 'px' });    
        } else {            
            offset.top = offset.top + target.innerHeight() + 10;    
            arrow.addClass('fa-caret-up');
            arrow.css({ top: '0px' });    
        }
        offset.position = 'fixed';     
        config.reload && EXEC(config.reload, self);        
        self.css(offset);
        var el = self.find('input[type="text"],select,textarea');
        !isMOBILE && el.length && el.eq(0).focus();
        setTimeout(function() {
            self.find('.ui-inlineform').aclass('ui-inlineform-animate');
        }, 300);
    };
});


COMPONENT('selectbox', function(self, config) {

    var Eitems, Eselected, datasource = null;

    self.datasource = EMPTYARRAY;
    self.template = Tangular.compile('<li data-search="{{ search }}" data-index="{{ index }}">{{icon|raw}} {{ text }} <small style="color:#A0A0A0">{{ext}}</small></li>');

    self.validate = function(value) {
        return config.disabled || !config.required ? true : value && value.length > 0;
    };

    self.configure = function(key, value, init) {
        if (init)
            return;

        var redraw = false;

        switch (key) {
            case 'type':
                self.type = value;
                break;
            case 'disabled':
                self.tclass('ui-disabled', value);
                self.find('input').prop('disabled', value);
                if (value)
                    self.rclass('ui-selectbox-invalid');
                else if (config.required)
                    self.state(1, 1);
                break;
            case 'required':
                !value && self.state(1, 1);
                break;
            case 'height':
            case 'search':
                redraw = true;
                break;
            case 'items':
                var arr = [];
                value.split(',').forEach(function(item) {
                    item = item.trim().split('|');
                    var obj = {};
                    obj.name = item[0].trim();
                    obj.id = (item[1] == null ? item[0] : item[1]).trim();
                    if (config.type === 'number')
                        obj.id = +obj.id;
                    arr.push(obj);
                });
                self.bind('', arr);
                break;
            case 'datasource':
                datasource && self.unwatch(datasource, self.bind);
                self.watch(value, self.bind, true);
                datasource = value;
                break;
        }

        redraw && self.redraw();
    };

    self.search = function() {
        var search = config.search ? self.find('input').val().toSearch() : '';
        Eitems.find('li').each(function() {
            var el = $(this);
            el.toggleClass('hidden', el.attr('data-search').indexOf(search) === -1);
        });
        self.find('.ui-selectbox-search-icon').toggleClass('fa-search', search.length === 0).toggleClass('fa-times', search.length > 0);
    };

    self.redraw = function() {
        self.html((typeof(config.search) === 'string' ? '<div class="ui-selectbox-search"><span><i class="fa fa-search ui-selectbox-search-icon"></i></span><div><input type="text" placeholder="{0}" /></div></div><div>'.format(config.search) : '') + '<div style="height:{0}px"><ul></ul><ul style="height:{0}px"></ul></div>'.format(config.height || '200'));
        self.find('ul').each(function(index) {
            if (index)
                Eselected = $(this);
            else
                Eitems = $(this);
        });
    };

    self.bind = function(path, value) {

        var kt = config.text || 'name';
        var kv = config.value || 'id';
        var builder = [];        

        self.datasource = [];
        value && value.forEach(function(item, index) {

            var text;
            var value;

            if (typeof(item) === 'string') {
                text = item;
                value = self.parser(item);
            } else {
                text = item[kt];
                value = item[kv];
            }
            if (config.icon) {
                var icon = '<i class="fa fa-{0}" style="color:{1}"></i>'.format(config.icon, item.color||'#eee');
            }    
            var item = { icon: icon||'', text: text, value: value, ext: item.ext||'', index: index, search: text.toSearch()+item.ext };
            self.datasource.push(item);
            builder.push(self.template(item));
        });

        self.search();
        Eitems.empty().append(builder.join(''));
    };

    self.check_all = function(type) {        
        if (type) {
            var selected = self.get() || [];
            self.datasource.forEach((item, index)=>{
                if (selected.indexOf(item.value) === -1) {
                    selected.push(item.value);
                }                    
            });
        } else selected = [];    
        self.set(selected);
        self.change(true);
    },    

    self.make = function() {

        self.aclass('ui-selectbox');
        self.redraw();

        config.datasource && self.reconfigure('datasource:' + config.datasource);
        config.items && self.reconfigure('items:' + config.items);

        self.event('click', 'li', function() {
            if (config.disabled)
                return;
            var selected = self.get() || [];
            var index = +this.getAttribute('data-index');
            var value = self.datasource[index];

            if (selected.indexOf(value.value) === -1)
                selected.push(value.value);
            else
                selected = selected.remove(value.value);

            self.set(selected);
            self.change(true);
        });

        self.event('click', '.fa-times', function() {
            if (config.disabled)
                return;
            self.find('input').val('');
            self.search();
        });

        typeof(config.search) === 'string' && self.event('keydown', 'input', function() {
            if (config.disabled)
                return;
            setTimeout2(self.id, self.search, 500);
        });
    };   

    self.setter = function(value) {   
        var selected = {};
        var builder = [];

        var ds = self.datasource;
        var dsl = ds.length;

        if (value) {
            for (var i = 0, length = value.length; i < length; i++) {
                for (var j = 0; j < dsl; j++) {
                    if (ds[j].value === value[i]) {
                        selected[j] = true;
                        builder.push(self.template(ds[j]));
                    }
                }
            }
        }

        Eitems.find('li').each(function() {
            var el = $(this);
            var index = +el.attr('data-index');
            el.toggleClass('ui-selectbox-selected', selected[index] !== undefined);
        });

        Eselected.empty().append(builder.join(''));
        self.search();
    };

    self.state = function(type) {
        if (!type)
            return;
        var invalid = config.required ? self.isInvalid() : false;
        if (invalid === self.$oldstate)
            return;
        self.$oldstate = invalid;
        self.tclass('ui-selectbox-invalid', invalid);
    };
});

COMPONENT('codemirror', 'linenumbers:false', function(self, config) {

    var skipA = false;
    var skipB = false;
    var editor = null;

    self.getter = null;

    self.reload = function() {
        editor.refresh();
    };

    self.validate = function(value) {
        return config.disabled || !config.required ? true : value && value.length > 0;
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
                self.find('.ui-codemirror-label').tclass('ui-codemirror-label-required', value);
                break;
            case 'icon':
                self.find('i').rclass().aclass('fa fa-' + value);
                break;
        }

    };

    self.make = function() {
        var content = config.label || self.html();
        if (content) self.html('<div class="ui-codemirror-label' + (config.required ? ' ui-codemirror-label-required' : '') + '">' + (config.icon ? '<i class="fa fa-' + config.icon + '"></i> ' : '') + content + ':</div><div class="ui-codemirror"></div>');
         else self.html('<div class="ui-codemirror"></div>');
        var container = self.find('.ui-codemirror');
        var options = { lineNumbers: config.linenumbers, mode: config.type || 'htmlmixed', indentUnit: 4};
        if (config.theme) options.theme = config.theme;
        if (config.keyMap) options.keyMap = config.keyMap;
        if (config.profile) options.profile = config.profile;
        if (config.readOnly) options.readOnly = config.readOnly;
        if (config.brackets) {
            options.matchBrackets = true;
            options.autoCloseBrackets = true;
            options.lineWrapping = true;   
        };
        if (config.fullscreen) {
            options.extraKeys = { "F11": function(cm) {
                                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                                  },
                                  "Esc": function(cm) {
                                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                                  }
            }                      
        };
        console.log(options);
        editor = CodeMirror(container.get(0), options);     
        config.height !== 'auto' && editor.setSize('100%', (config.height || 200) + 'px');
        if (config.emmet && typeof emmetCodeMirror === 'function') emmetCodeMirror(editor);  
        if (config.disabled) {
            self.aclass('ui-disabled');
            editor.readOnly = true;
            editor.refresh();
        }

        editor.on('change', function(a, b) {

            if (config.disabled)
                return;

            if (skipB && b.origin !== 'paste') {
                skipB = false;
                return;
            }

            setTimeout2(self.id, function() {
                skipA = true;
                self.reset(true);
                self.dirty(false);
                self.set(editor.getValue());
            }, 200);
        });

        skipB = true;
    };

    self.setter = function(value) {

        if (skipA === true) {
            skipA = false;
            return;
        }

        skipB = true;
        editor.setValue(value || '');
        editor.refresh();
        skipB = true;

        CodeMirror.commands['selectAll'](editor);
        skipB = true;
        editor.setValue(editor.getValue());
        skipB = true;

        setTimeout(function() {
            editor.refresh();
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
        var invalid = self.isInvalid();
        if (invalid === self.$oldstate)
            return;
        self.$oldstate = invalid;
        self.find('.ui-codemirror').tclass('ui-codemirror-invalid', invalid);
    };
});