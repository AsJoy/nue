/**
 * Created by Administrator on 2017/3/5.
 */

const hasOwnProperty = Object.prototype.hasOwnProperty;
const isFunction = (func) => Object.prototype.toString.call(func)=== '[object Function]';
const setPropertyByPath = function(obj, path, property, value)  {
    if (arguments.length === 3) {
        value = property;
        property = undefined;
    }

    let propertyChain = path.split(/\./);
    let rs = obj;
    if (property === undefined) {
        for (var key1 = 0, length = propertyChain.length; key1 < length -1 ; key1 ++) {
            if (propertyChain::hasOwnProperty(key1)) {
                rs[propertyChain[key1]] = rs[propertyChain[key1]] === undefined ? {}:rs[propertyChain[key1]];
                rs = rs[propertyChain[key1]];
            }
        }
        rs[propertyChain[key1]] = value;
        return;
    }

    for (let key in propertyChain) {
        if (propertyChain::hasOwnProperty(key)) {
            rs[propertyChain[key]] = rs[propertyChain[key]] === undefined ? {}:rs[propertyChain[key]];
            rs = rs[propertyChain[key]];
        }
    }

    rs[property] = value;
}

const getPropertyByPath = (obj, path, property) => {
    let propertyChain = path.split(/\./);
    let rs = obj;
    for (let key in propertyChain) {
        if (propertyChain::hasOwnProperty(key)) {
            rs = rs && rs[propertyChain[key]];
        }
    }
    if (property === undefined) return rs;
    return rs[property]
}

class Nue {
    constructor(ops) {
        this.$ele = document.querySelector(ops.el);
        this.$data = ops.data;
        this.$methods = ops.methods;

        this.reflectDirectives = {};
        this._init();
        this._compile(this.$ele);
    }

    static config = {
        prefix: 'n'
    }

    /**
     * 构建ioc双向绑定模型
     * @private
     */
    _init() {
        if (typeof this.$data !== 'object') {
            throw new Error('data property must be passed to the options')
        }
        for (let i in this.$data) {
            if (this.$data::hasOwnProperty(i)) {
                let val = this.$data[i];
                this.convertData(i, val, this.$data, i);
            }
        }

        this._bindFunction(this.$methods)
    }

    convertData(i, val, object, path = '') {
        if (typeof val === 'object') {
            for (let key in val) {
                if (val::hasOwnProperty(key)) {
                    let value = val[key];
                    let path1 = `${path}.${key}`;

                    this.convertData(key, value, val, path1);
                }
            }
        }
        this._defineProperty(object, i, val, path);
        setPropertyByPath(this.reflectDirectives, path, 'directives', [])
    }

    _defineProperty(object, key, val, path) {
        console.log(arguments)
        let $this = this;
        Object.defineProperty(object, key, {
            configurable: true,
            enumerable: true,
            get: function () {
                console.log(`get ${val}`)
                return val;
            },
            set: function (_value) {
                if (typeof _value === 'object'){
                    for (let i in _value) {
                        if (_value::hasOwnProperty(i)) {
                            val[i] = _value[i];
                        }
                    }
                } else {
                    if (val !== _value) {
                        console.log(`set ${_value}`);
                        val = _value;
                        getPropertyByPath($this.reflectDirectives, path, 'directives').forEach((v) => {
                            v.update();
                        })

                    }
                }
            }
        })
    }

    /**
     * 为method 绑定this 指向$data
     * @param methods
     * @private
     */
    _bindFunction(methods) {
        for (let key in methods) {
            if (methods::hasOwnProperty(key)) {
                if(typeof methods[key] === 'object') {
                    this._bindFunction(methods[key])
                } else if (isFunction(methods[key])) {
                    methods[key] = methods[key].bind(this.$data)
                } else {
                    throw new Error(`${ley} of the methods property must be a function`)
                }
            }
        }
    }

    _compile(root) {
        let $this = this;
        for (let index=0, length = root.children.length; index < length; index ++ ) {
            let node = root.children[index]
            if (node.children && node.children.length) {
                this._compile(node);
            }
            if (node.hasAttribute(`${Nue.config.prefix}-click`)) {
                let invokeName = node.getAttribute(`${Nue.config.prefix}-click`);

                /**
                 * todo
                 * @type {Array}
                 */
                let aArguments = [];
                if (invokeName.match(/\((.*)\)/)) {
                    let args = RegExp['$1'];
                    aArguments = args.split(/,/)
                    invokeName = invokeName.replace(/\(.*\)/, '');
                }
                node.addEventListener('click', function (ev) {
                    getPropertyByPath($this.$methods, invokeName)(...aArguments)
                })
            }

            if (node.hasAttribute(`${Nue.config.prefix}-bind`)) {
                let invokeName = node.getAttribute(`${Nue.config.prefix}-bind`);
                getPropertyByPath(this.reflectDirectives, invokeName, 'directives').push(new Directive({
                    ele: node,
                    changeProp: 'innerHTML',
                    component: this,
                    path: invokeName
                }))
            }

            if (node.hasAttribute(`${Nue.config.prefix}-modal`) && node.tagName.toUpperCase()==='INPUT' || node.tagName.toUpperCase() === 'TEXTAREA') {
                let invokeName = node.getAttribute(`${Nue.config.prefix}-modal`);
                getPropertyByPath(this.reflectDirectives, invokeName, 'directives').push(new Directive({
                    ele: node,
                    changeProp: 'value',
                    component: this,
                    path: invokeName
                }))
                node.addEventListener('input', function (ev) {
                    setPropertyByPath($this.$data, invokeName, this.value )
                })

            }
        }
    }
}


class Directive {
    constructor(options) {
        this.ele = options.ele;
        this.component = options.component;
        this.changeProp = options.changeProp;
        this.path = options.path;
        this.update();
    }
    update() {
        this.ele[this.changeProp] = getPropertyByPath(this.component.$data, this.path);
    }
}

