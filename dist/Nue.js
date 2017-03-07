'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Administrator on 2017/3/5.
 */

var hasOwnProperty = Object.prototype.hasOwnProperty;
var isFunction = function isFunction(func) {
    return Object.prototype.toString.call(func) === '[object Function]';
};
var setPropertyByPath = function setPropertyByPath(obj, path, property, value) {
    if (arguments.length === 3) {
        value = property;
        property = undefined;
    }

    var propertyChain = path.split(/\./);
    var rs = obj;
    if (property === undefined) {
        for (var key1 = 0, length = propertyChain.length; key1 < length - 1; key1++) {
            if (hasOwnProperty.call(propertyChain, key1)) {
                rs[propertyChain[key1]] = rs[propertyChain[key1]] === undefined ? {} : rs[propertyChain[key1]];
                rs = rs[propertyChain[key1]];
            }
        }
        rs[propertyChain[key1]] = value;
        return;
    }

    for (var key in propertyChain) {
        if (hasOwnProperty.call(propertyChain, key)) {
            rs[propertyChain[key]] = rs[propertyChain[key]] === undefined ? {} : rs[propertyChain[key]];
            rs = rs[propertyChain[key]];
        }
    }

    rs[property] = value;
};

var getPropertyByPath = function getPropertyByPath(obj, path, property) {
    var propertyChain = path.split(/\./);
    var rs = obj;
    for (var key in propertyChain) {
        if (hasOwnProperty.call(propertyChain, key)) {
            rs = rs && rs[propertyChain[key]];
        }
    }
    if (property === undefined) return rs;
    return rs[property];
};

var Nue = function () {
    function Nue(ops) {
        _classCallCheck(this, Nue);

        this.$ele = document.querySelector(ops.el);
        this.$data = ops.data;
        this.$methods = ops.methods;

        this.reflectDirectives = {};
        this._init();
        this._compile(this.$ele);
    }

    _createClass(Nue, [{
        key: '_init',


        /**
         * 构建ioc双向绑定模型
         * @private
         */
        value: function _init() {
            if (_typeof(this.$data) !== 'object') {
                throw new Error('data property must be passed to the options');
            }
            for (var i in this.$data) {
                var _context;

                if ((_context = this.$data, hasOwnProperty).call(_context, i)) {
                    var val = this.$data[i];
                    this.convertData(i, val, this.$data, i);
                }
            }

            this._bindFunction(this.$methods);
        }
    }, {
        key: 'convertData',
        value: function convertData(i, val, object) {
            var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

            if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
                for (var key in val) {
                    if (hasOwnProperty.call(val, key)) {
                        var value = val[key];
                        var path1 = path + '.' + key;

                        this.convertData(key, value, val, path1);
                    }
                }
            }
            this._defineProperty(object, i, val, path);
            setPropertyByPath(this.reflectDirectives, path, 'directives', []);
        }
    }, {
        key: '_defineProperty',
        value: function _defineProperty(object, key, val, path) {
            console.log(arguments);
            var $this = this;
            Object.defineProperty(object, key, {
                configurable: true,
                enumerable: true,
                get: function get() {
                    console.log('get ' + val);
                    return val;
                },
                set: function set(_value) {
                    if ((typeof _value === 'undefined' ? 'undefined' : _typeof(_value)) === 'object') {
                        for (var i in _value) {
                            if (hasOwnProperty.call(_value, i)) {
                                val[i] = _value[i];
                            }
                        }
                    } else {
                        if (val !== _value) {
                            console.log('set ' + _value);
                            val = _value;
                            getPropertyByPath($this.reflectDirectives, path, 'directives').forEach(function (v) {
                                v.update();
                            });
                        }
                    }
                }
            });
        }

        /**
         * 为method 绑定this 指向$data
         * @param methods
         * @private
         */

    }, {
        key: '_bindFunction',
        value: function _bindFunction(methods) {
            for (var key in methods) {
                if (hasOwnProperty.call(methods, key)) {
                    if (_typeof(methods[key]) === 'object') {
                        this._bindFunction(methods[key]);
                    } else if (isFunction(methods[key])) {
                        methods[key] = methods[key].bind(this.$data);
                    } else {
                        throw new Error(ley + ' of the methods property must be a function');
                    }
                }
            }
        }
    }, {
        key: '_compile',
        value: function _compile(root) {
            var _this = this;

            var $this = this;
            for (var index = 0, length = root.children.length; index < length; index++) {
                var node = root.children[index];
                if (node.children && node.children.length) {
                    this._compile(node);
                }
                if (node.hasAttribute(Nue.config.prefix + '-click')) {
                    (function () {
                        var invokeName = node.getAttribute(Nue.config.prefix + '-click');

                        /**
                         * todo
                         * @type {Array}
                         */
                        var aArguments = [];
                        if (invokeName.match(/\((.*)\)/)) {
                            var args = RegExp['$1'];
                            aArguments = args.split(/,/);
                            invokeName = invokeName.replace(/\(.*\)/, '');
                        }
                        node.addEventListener('click', function (ev) {
                            getPropertyByPath($this.$methods, invokeName).apply(undefined, _toConsumableArray(aArguments));
                        });
                    })();
                }

                if (node.hasAttribute(Nue.config.prefix + '-bind')) {
                    var invokeName = node.getAttribute(Nue.config.prefix + '-bind');
                    getPropertyByPath(this.reflectDirectives, invokeName, 'directives').push(new Directive({
                        ele: node,
                        changeProp: 'innerHTML',
                        component: this,
                        path: invokeName
                    }));
                }

                if (node.hasAttribute(Nue.config.prefix + '-modal') && node.tagName.toUpperCase() === 'INPUT' || node.tagName.toUpperCase() === 'TEXTAREA') {
                    (function () {
                        var invokeName = node.getAttribute(Nue.config.prefix + '-modal');
                        getPropertyByPath(_this.reflectDirectives, invokeName, 'directives').push(new Directive({
                            ele: node,
                            changeProp: 'value',
                            component: _this,
                            path: invokeName
                        }));
                        node.addEventListener('input', function (ev) {
                            setPropertyByPath($this.$data, invokeName, this.value);
                        });
                    })();
                }
            }
        }
    }]);

    return Nue;
}();

Nue.config = {
    prefix: 'n'
};

var Directive = function () {
    function Directive(options) {
        _classCallCheck(this, Directive);

        this.ele = options.ele;
        this.component = options.component;
        this.changeProp = options.changeProp;
        this.path = options.path;
        this.update();
    }

    _createClass(Directive, [{
        key: 'update',
        value: function update() {
            this.ele[this.changeProp] = getPropertyByPath(this.component.$data, this.path);
        }
    }]);

    return Directive;
}();