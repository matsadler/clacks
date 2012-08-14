var PathTemplate = require("path-template");
var URL = require("url");
var EventEmitter = require("events").EventEmitter;
var commonLog = require("./clacks/common-log").commonLog;

var VERBS = ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

function Clacks() {
	this.handlers = {
		any: {}
	};
	for (var i = 0; i < VERBS.length; i++) {
		this.handlers[VERBS[i]] = {};
	}
	this.routes = [];
	this.dispatcher = this.dispatch.bind(this);
	this.on("responseEnd", function (req, res) {
		console.error(commonLog(req, res));
	});
	this.parentScope = this;
}

module.exports = Clacks;

Clacks.prototype = new EventEmitter();
Clacks.prototype.constructor = Clacks;

Clacks.prototype.scope = function () {
	var scope = new Clacks.Scope(this);
	var args = Array.prototype.slice.call(arguments);
  Clacks.Scope.apply(scope, [this].concat(args));
  scope.doBlock();
}

Clacks.prototype.add = function (path, handler, method) {
	var handlers = method ? this.handlers[method] : this.handlers.any;
	this.routes.push(PathTemplate.parse(path));
	handlers[path] = handler;
};

for (var i = 0; i < VERBS.length; i++) {
	(function(verb) {
		Clacks.prototype[verb.toLowerCase()] = function() {
			Clacks.prototype.add.apply(this, Array.prototype.slice.call(arguments).concat(verb));
		};
	})(VERBS[i]);
}

Clacks.prototype.del = function (path, handler) {
	console.warn("deprecation warning: " +
		"Clacks.prototype.del will be removed from future versions" +
		", use Clacks.prototype.delete");
	this.add(path, handler, "DELETE");
};

Clacks.prototype.notFound = function (req, res) {
	var body = "resource '" + URL.parse(req.url).pathname + "' not found\n",
		head = {"Content-Length": body.length, "Content-Type": "text/plain"};
	res.writeHead(404, head);
	res.end(body);
};

Clacks.prototype.error = function (req, res) {
	var body = "internal server error\n",
		head = {"Content-Length": body.length, "Content-Type": "text/plain"};
	res.writeHead(500, head);
	res.end(body);
};

Clacks.prototype.dispatch = function (req, res) {
	var start = new Date(),
		app = this,
		handler = this.notFound,
		url,
		match,
		templateString;
	try {
		url = URL.parse(req.url);
		match = PathTemplate.match(this.routes, url.pathname);
		if (match) {
			templateString = PathTemplate.inspect(match.template);
			handler = this.handlers[req.method][templateString] ||
				this.handlers.any[templateString] || handler;
			req.path = match;
		}
	} catch (error) {
		this.emit("error", error);
		handler = this.error;
	}
	res.end = function () {
		var result = this.constructor.prototype.end.apply(this, arguments);
		app.emit("responseEnd", req, res, new Date() - start);
		return result;
	};
	try {
		handler.call(this, req, res);
	} catch (appError) {
		this.emit("error", appError);
		res.end();
	}
};

Clacks.Scope = function(parent /*, [pathPrefix], [wrapperFn, wrapperFn, ...], block */) {
	this.parentScope = parent;
	var args = Array.prototype.slice.call(arguments);
	this.block = args.slice(-1)[0];
	this.funcs = args.slice(1, -1);
	if ( typeof this.funcs[0] == 'string' ) {
		this.pathPrefix = this.funcs.shift();
	} else {
		this.pathPrefix = '';
	}
};

Clacks.Scope.prototype.doBlock = function () {
	this.block(this);
}

Clacks.Scope.prototype.add = function(path, handler, method) {
	this.parentScope.add(this.pathPrefix + path, this.functionChain(handler), method);
};

for (var i = 0; i < VERBS.length; i++) {
	(function(verb) {
		Clacks.Scope.prototype[verb.toLowerCase()] = function() {
			Clacks.Scope.prototype.add.apply(this, Array.prototype.slice.call(arguments).concat(verb));
		};
	})(VERBS[i]);
}

Clacks.Scope.prototype.functionChain = function(handler) {
  var func = handler;
  for (var i = 0; i < this.funcs.length; i++) {
	  debugger;
  	func = this.funcs[i](func);
  }
  debugger;
  return func;
};
