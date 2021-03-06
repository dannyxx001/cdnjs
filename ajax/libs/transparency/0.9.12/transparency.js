;(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
(function() {
  var $, Context, Transparency, helpers,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  helpers = require('./helpers.coffee');

  Context = require('./context.coffee');

  Transparency = {};

  Transparency.render = function(context, models, directives, options) {
    var log, _base;
    if (models == null) {
      models = [];
    }
    if (directives == null) {
      directives = {};
    }
    if (options == null) {
      options = {};
    }
    log = options.debug && console ? helpers.consoleLogger : helpers.nullLogger;
    log("Transparency.render:", context, models, directives, options);
    if (!context) {
      return;
    }
    if (!helpers.isArray(models)) {
      models = [models];
    }
    context = (_base = helpers.data(context)).context || (_base.context = new Context(context, Transparency));
    return context.render(models, directives, options).el;
  };

  Transparency.matcher = function(element, key) {
    return element.el.id === key || __indexOf.call(element.classNames, key) >= 0 || element.el.name === key || element.el.getAttribute('data-bind') === key;
  };

  Transparency.clone = function(node) {
    return $(node).clone()[0];
  };

  Transparency.jQueryPlugin = helpers.chainable(function(models, directives, options) {
    var context, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      context = this[_i];
      _results.push(Transparency.render(context, models, directives, options));
    }
    return _results;
  });

  if ((typeof jQuery !== "undefined" && jQuery !== null) || (typeof Zepto !== "undefined" && Zepto !== null)) {
    $ = jQuery || Zepto;
    if ($ != null) {
      $.fn.render = Transparency.jQueryPlugin;
    }
  }

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    module.exports = Transparency;
  }

  if (typeof window !== "undefined" && window !== null) {
    window.Transparency = Transparency;
  }

  if (typeof define !== "undefined" && define !== null ? define.amd : void 0) {
    define(function() {
      return Transparency;
    });
  }

}).call(this);


},{"./helpers.coffee":2,"./context.coffee":3}],2:[function(require,module,exports){
(function() {
  var ElementFactory, expando, html5Clone, _getElements;

  ElementFactory = require('./elementFactory.coffee');

  exports.before = function(decorator) {
    return function(method) {
      return function() {
        decorator.apply(this, arguments);
        return method.apply(this, arguments);
      };
    };
  };

  exports.after = function(decorator) {
    return function(method) {
      return function() {
        method.apply(this, arguments);
        return decorator.apply(this, arguments);
      };
    };
  };

  exports.chainable = exports.after(function() {
    return this;
  });

  exports.onlyWith$ = function(fn) {
    if ((typeof jQuery !== "undefined" && jQuery !== null) || (typeof Zepto !== "undefined" && Zepto !== null)) {
      return (function($) {
        return fn(arguments);
      })(jQuery || Zepto);
    }
  };

  exports.getChildNodes = function(el) {
    var child, childNodes;
    childNodes = [];
    child = el.firstChild;
    while (child) {
      childNodes.push(child);
      child = child.nextSibling;
    }
    return childNodes;
  };

  exports.getElements = function(el) {
    var elements;
    elements = [];
    _getElements(el, elements);
    return elements;
  };

  _getElements = function(template, elements) {
    var child, _results;
    child = template.firstChild;
    _results = [];
    while (child) {
      if (child.nodeType === exports.ELEMENT_NODE) {
        elements.push(new ElementFactory.createElement(child));
        _getElements(child, elements);
      }
      _results.push(child = child.nextSibling);
    }
    return _results;
  };

  exports.ELEMENT_NODE = 1;

  exports.TEXT_NODE = 3;

  html5Clone = function() {
    return document.createElement('nav').cloneNode(true).outerHTML !== '<:nav></:nav>';
  };

  exports.cloneNode = (typeof document === "undefined" || document === null) || html5Clone() ? function(node) {
    return node.cloneNode(true);
  } : function(node) {
    var cloned, element, _i, _len, _ref;
    cloned = Transparency.clone(node);
    if (cloned.nodeType === exports.ELEMENT_NODE) {
      cloned.removeAttribute(expando);
      _ref = cloned.getElementsByTagName('*');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        element.removeAttribute(expando);
      }
    }
    return cloned;
  };

  expando = 'transparency';

  exports.data = function(element) {
    return element[expando] || (element[expando] = {});
  };

  exports.nullLogger = function() {};

  exports.consoleLogger = function() {
    return console.log(arguments);
  };

  exports.log = exports.nullLogger;

  exports.toString = Object.prototype.toString;

  exports.isArray = Array.isArray || function(obj) {
    return exports.toString.call(obj) === '[object Array]';
  };

  exports.isDate = function(obj) {
    return exports.toString.call(obj) === '[object Date]';
  };

  exports.isDomElement = function(obj) {
    return obj.nodeType === exports.ELEMENT_NODE;
  };

  exports.isPlainValue = function(obj) {
    var type;
    type = typeof obj;
    return (type !== 'object' && type !== 'function') || exports.isDate(obj);
  };

  exports.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

}).call(this);


},{"./elementFactory.coffee":4}],3:[function(require,module,exports){
(function() {
  var Context, Instance, helpers;

  helpers = require('./helpers.coffee');

  Instance = require('./instance.coffee');

  module.exports = Context = (function() {
    var attach, detach;

    detach = helpers.chainable(function() {
      this.parent = this.el.parentNode;
      if (this.parent) {
        this.nextSibling = this.el.nextSibling;
        return this.parent.removeChild(this.el);
      }
    });

    attach = helpers.chainable(function() {
      if (this.parent) {
        if (this.nextSibling) {
          return this.parent.insertBefore(this.el, this.nextSibling);
        } else {
          return this.parent.appendChild(this.el);
        }
      }
    });

    function Context(el, Transparency) {
      this.el = el;
      this.Transparency = Transparency;
      this.template = helpers.cloneNode(this.el);
      this.instances = [new Instance(this.el, this.Transparency)];
      this.instanceCache = [];
    }

    Context.prototype.render = helpers.before(detach)(helpers.after(attach)(helpers.chainable(function(models, directives, options) {
      var children, index, instance, model, _i, _len, _results;
      while (models.length < this.instances.length) {
        this.instanceCache.push(this.instances.pop().remove());
      }
      while (models.length > this.instances.length) {
        instance = this.instanceCache.pop() || new Instance(helpers.cloneNode(this.template), this.Transparency);
        this.instances.push(instance.appendTo(this.el));
      }
      _results = [];
      for (index = _i = 0, _len = models.length; _i < _len; index = ++_i) {
        model = models[index];
        instance = this.instances[index];
        children = [];
        _results.push(instance.prepare(model, children).renderValues(model, children).renderDirectives(model, index, directives).renderChildren(model, children, directives, options));
      }
      return _results;
    })));

    return Context;

  })();

}).call(this);


},{"./helpers.coffee":2,"./instance.coffee":5}],4:[function(require,module,exports){
(function() {
  var AttributeFactory, Checkbox, Element, ElementFactory, Input, Radio, Select, TextArea, VoidElement, helpers,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AttributeFactory = require('./attributeFactory.coffee');

  helpers = require('./helpers.coffee');

  module.exports = ElementFactory = {
    Elements: {
      input: {}
    },
    createElement: function(el) {
      var El, name;
      if ('input' === (name = el.nodeName.toLowerCase())) {
        El = ElementFactory.Elements[name][el.type.toLowerCase()] || Input;
      } else {
        El = ElementFactory.Elements[name] || Element;
      }
      return new El(el);
    }
  };

  Element = (function() {

    function Element(el) {
      this.el = el;
      this.attributes = {};
      this.childNodes = helpers.getChildNodes(this.el);
      this.nodeName = this.el.nodeName.toLowerCase();
      this.classNames = this.el.className.split(' ');
      this.originalAttributes = {};
    }

    Element.prototype.empty = function() {
      var child;
      while (child = this.el.firstChild) {
        this.el.removeChild(child);
      }
      return this;
    };

    Element.prototype.reset = function() {
      var attribute, name, _ref, _results;
      _ref = this.attributes;
      _results = [];
      for (name in _ref) {
        attribute = _ref[name];
        _results.push(attribute.set(attribute.templateValue));
      }
      return _results;
    };

    Element.prototype.render = function(value) {
      return this.attr('text', value);
    };

    Element.prototype.attr = function(name, value) {
      var attribute, _base;
      attribute = (_base = this.attributes)[name] || (_base[name] = AttributeFactory.createAttribute(this.el, name, value));
      if (value != null) {
        attribute.set(value);
      }
      return attribute;
    };

    Element.prototype.renderDirectives = function(model, index, attributes) {
      var directive, name, value, _results;
      _results = [];
      for (name in attributes) {
        if (!__hasProp.call(attributes, name)) continue;
        directive = attributes[name];
        if (!(typeof directive === 'function')) {
          continue;
        }
        value = directive.call(model, {
          element: this.el,
          index: index,
          value: this.attr(name).templateValue
        });
        if (value != null) {
          _results.push(this.attr(name, value));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Element;

  })();

  Select = (function(_super) {

    __extends(Select, _super);

    ElementFactory.Elements['select'] = Select;

    function Select(el) {
      Select.__super__.constructor.call(this, el);
      this.elements = helpers.getElements(el);
    }

    Select.prototype.render = function(value) {
      var option, _i, _len, _ref, _results;
      value = value.toString();
      _ref = this.elements;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        if (option.nodeName === 'option') {
          _results.push(option.attr('selected', option.el.value === value));
        }
      }
      return _results;
    };

    return Select;

  })(Element);

  VoidElement = (function(_super) {
    var VOID_ELEMENTS, nodeName, _i, _len;

    __extends(VoidElement, _super);

    function VoidElement() {
      return VoidElement.__super__.constructor.apply(this, arguments);
    }

    VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

    for (_i = 0, _len = VOID_ELEMENTS.length; _i < _len; _i++) {
      nodeName = VOID_ELEMENTS[_i];
      ElementFactory.Elements[nodeName] = VoidElement;
    }

    VoidElement.prototype.attr = function(name, value) {
      if (name !== 'text' && name !== 'html') {
        return VoidElement.__super__.attr.call(this, name, value);
      }
    };

    return VoidElement;

  })(Element);

  Input = (function(_super) {

    __extends(Input, _super);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    Input.prototype.render = function(value) {
      return this.attr('value', value);
    };

    return Input;

  })(VoidElement);

  TextArea = (function(_super) {

    __extends(TextArea, _super);

    function TextArea() {
      return TextArea.__super__.constructor.apply(this, arguments);
    }

    ElementFactory.Elements['textarea'] = TextArea;

    return TextArea;

  })(Input);

  Checkbox = (function(_super) {

    __extends(Checkbox, _super);

    function Checkbox() {
      return Checkbox.__super__.constructor.apply(this, arguments);
    }

    ElementFactory.Elements['input']['checkbox'] = Checkbox;

    Checkbox.prototype.render = function(value) {
      return this.attr('checked', Boolean(value));
    };

    return Checkbox;

  })(Input);

  Radio = (function(_super) {

    __extends(Radio, _super);

    function Radio() {
      return Radio.__super__.constructor.apply(this, arguments);
    }

    ElementFactory.Elements['input']['radio'] = Radio;

    return Radio;

  })(Checkbox);

}).call(this);


},{"./attributeFactory.coffee":6,"./helpers.coffee":2}],5:[function(require,module,exports){
(function() {
  var Instance, helpers,
    __hasProp = {}.hasOwnProperty;

  helpers = require('./helpers.coffee');

  module.exports = Instance = (function() {

    function Instance(template, Transparency) {
      this.Transparency = Transparency;
      this.queryCache = {};
      this.childNodes = helpers.getChildNodes(template);
      this.elements = helpers.getElements(template);
    }

    Instance.prototype.remove = helpers.chainable(function() {
      var node, _i, _len, _ref, _results;
      _ref = this.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(node.parentNode.removeChild(node));
      }
      return _results;
    });

    Instance.prototype.appendTo = helpers.chainable(function(parent) {
      var node, _i, _len, _ref, _results;
      _ref = this.childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(parent.appendChild(node));
      }
      return _results;
    });

    Instance.prototype.prepare = helpers.chainable(function(model) {
      var element, _i, _len, _ref, _results;
      _ref = this.elements;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        element.reset();
        _results.push(helpers.data(element.el).model = model);
      }
      return _results;
    });

    Instance.prototype.renderValues = helpers.chainable(function(model, children) {
      var element, key, value, _results;
      if (helpers.isDomElement(model) && (element = this.elements[0])) {
        return element.empty().el.appendChild(model);
      } else if (typeof model === 'object') {
        _results = [];
        for (key in model) {
          if (!__hasProp.call(model, key)) continue;
          value = model[key];
          if (value != null) {
            if (helpers.isPlainValue(value)) {
              _results.push((function() {
                var _i, _len, _ref, _results1;
                _ref = this.matchingElements(key);
                _results1 = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  element = _ref[_i];
                  _results1.push(element.render(value));
                }
                return _results1;
              }).call(this));
            } else if (typeof value === 'object') {
              _results.push(children.push(key));
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      }
    });

    Instance.prototype.renderDirectives = helpers.chainable(function(model, index, directives) {
      var attributes, element, key, _results;
      _results = [];
      for (key in directives) {
        if (!__hasProp.call(directives, key)) continue;
        attributes = directives[key];
        if (!(typeof attributes === 'object')) {
          continue;
        }
        if (typeof model !== 'object') {
          model = {
            value: model
          };
        }
        _results.push((function() {
          var _i, _len, _ref, _results1;
          _ref = this.matchingElements(key);
          _results1 = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            element = _ref[_i];
            _results1.push(element.renderDirectives(model, index, attributes));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    });

    Instance.prototype.renderChildren = helpers.chainable(function(model, children, directives, options) {
      var element, key, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        key = children[_i];
        _results.push((function() {
          var _j, _len1, _ref, _results1;
          _ref = this.matchingElements(key);
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            element = _ref[_j];
            _results1.push(this.Transparency.render(element.el, model[key], directives[key], options));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    });

    Instance.prototype.matchingElements = function(key) {
      var el, elements, _base;
      elements = (_base = this.queryCache)[key] || (_base[key] = (function() {
        var _i, _len, _ref, _results;
        _ref = this.elements;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          el = _ref[_i];
          if (this.Transparency.matcher(el, key)) {
            _results.push(el);
          }
        }
        return _results;
      }).call(this));
      helpers.log("Matching elements for '" + key + "':", elements);
      return elements;
    };

    return Instance;

  })();

}).call(this);


},{"./helpers.coffee":2}],6:[function(require,module,exports){
(function() {
  var Attribute, AttributeFactory, BooleanAttribute, Class, Html, Text, helpers,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  helpers = require('./helpers.coffee');

  module.exports = AttributeFactory = {
    Attributes: {},
    createAttribute: function(element, name) {
      var Attr;
      Attr = AttributeFactory.Attributes[name] || Attribute;
      return new Attr(element, name);
    }
  };

  Attribute = (function() {

    function Attribute(el, name) {
      this.el = el;
      this.name = name;
      this.templateValue = this.el.getAttribute(this.name) || '';
    }

    Attribute.prototype.set = function(value) {
      this.el[this.name] = value;
      return this.el.setAttribute(this.name, value.toString());
    };

    return Attribute;

  })();

  BooleanAttribute = (function(_super) {
    var BOOLEAN_ATTRIBUTES, name, _i, _len;

    __extends(BooleanAttribute, _super);

    BOOLEAN_ATTRIBUTES = ['hidden', 'async', 'defer', 'autofocus', 'formnovalidate', 'disabled', 'autofocus', 'formnovalidate', 'multiple', 'readonly', 'required', 'checked', 'scoped', 'reversed', 'selected', 'loop', 'muted', 'autoplay', 'controls', 'seamless', 'default', 'ismap', 'novalidate', 'open', 'typemustmatch', 'truespeed'];

    for (_i = 0, _len = BOOLEAN_ATTRIBUTES.length; _i < _len; _i++) {
      name = BOOLEAN_ATTRIBUTES[_i];
      AttributeFactory.Attributes[name] = BooleanAttribute;
    }

    function BooleanAttribute(el, name) {
      this.el = el;
      this.name = name;
      this.templateValue = this.el.getAttribute(this.name) || false;
    }

    BooleanAttribute.prototype.set = function(value) {
      this.el[this.name] = value;
      if (value) {
        return this.el.setAttribute(this.name, this.name);
      } else {
        return this.el.removeAttribute(this.name);
      }
    };

    return BooleanAttribute;

  })(Attribute);

  Text = (function(_super) {

    __extends(Text, _super);

    AttributeFactory.Attributes['text'] = Text;

    function Text(el, name) {
      var child;
      this.el = el;
      this.name = name;
      this.templateValue = ((function() {
        var _i, _len, _ref, _results;
        _ref = helpers.getChildNodes(this.el);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child.nodeType === helpers.TEXT_NODE) {
            _results.push(child.nodeValue);
          }
        }
        return _results;
      }).call(this)).join('');
      this.children = (function() {
        var _i, _len, _ref, _results;
        _ref = this.el.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child);
        }
        return _results;
      }).call(this);
      if (!(this.textNode = this.el.firstChild)) {
        this.el.appendChild(this.textNode = this.el.ownerDocument.createTextNode(''));
      } else if (this.textNode.nodeType !== helpers.TEXT_NODE) {
        this.textNode = this.el.insertBefore(this.el.ownerDocument.createTextNode(''), this.textNode);
      }
    }

    Text.prototype.set = function(text) {
      var child, _i, _len, _ref, _results;
      while (child = this.el.firstChild) {
        this.el.removeChild(child);
      }
      this.textNode.nodeValue = text;
      this.el.appendChild(this.textNode);
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(this.el.appendChild(child));
      }
      return _results;
    };

    return Text;

  })(Attribute);

  Html = (function(_super) {

    __extends(Html, _super);

    AttributeFactory.Attributes['html'] = Html;

    function Html(el) {
      var child;
      this.el = el;
      this.templateValue = '';
      this.children = (function() {
        var _i, _len, _ref, _results;
        _ref = this.el.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child);
        }
        return _results;
      }).call(this);
    }

    Html.prototype.set = function(html) {
      var child, _i, _len, _ref, _results;
      while (child = this.el.firstChild) {
        this.el.removeChild(child);
      }
      this.el.innerHTML = html + this.templateValue;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(this.el.appendChild(child));
      }
      return _results;
    };

    return Html;

  })(Attribute);

  Class = (function(_super) {

    __extends(Class, _super);

    AttributeFactory.Attributes['class'] = Class;

    function Class(el) {
      Class.__super__.constructor.call(this, el, 'class');
    }

    return Class;

  })(Attribute);

}).call(this);


},{"./helpers.coffee":2}]},{},[1])
;