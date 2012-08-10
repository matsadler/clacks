var PathTemplate = require("path-template");
var URL = require("url");
var EventEmitter = require("events").EventEmitter;
var commonLog = require("./clacks/common-log").commonLog;

function Clacks() {
	this.handlers = {
		HEAD: {},
		GET: {},
		POST: {},
		PUT: {},
		DELETE: {},
		PATCH: {},
		OPTIONS: {},
		any: {}
	};
	this.routes = [];
	this.dispatcher = this.dispatch.bind(this);
	this.on("responseEnd", function (req, res) {
		console.error(commonLog(req, res));
	});
}

module.exports = Clacks;

Clacks.prototype = new EventEmitter();
Clacks.prototype.constructor = Clacks;

Clacks.prototype.add = function (path, handler, method) {
	var handlers = method ? this.handlers[method] : this.handlers.any;
	this.routes.push(PathTemplate.parse(path));
	handlers[path] = handler;
};

Clacks.prototype.head = function (path, handler) {
	this.add(path, handler, "HEAD");
};

Clacks.prototype.get = function (path, handler) {
	this.add(path, handler, "GET");
};

Clacks.prototype.post = function (path, handler) {
	this.add(path, handler, "POST");
};

Clacks.prototype.put = function (path, handler) {
	this.add(path, handler, "PUT");
};

Clacks.prototype["delete"] = function (path, handler) {
	this.add(path, handler, "DELETE");
};

Clacks.prototype.del = function (path, handler) {
	console.warn("deprecation warning: " +
		"Clacks.prototype.del will be removed from future versions" +
		", use Clacks.prototype.delete");
	this.add(path, handler, "DELETE");
};

Clacks.prototype.patch = function (path, handler) {
	this.add(path, handler, "PATCH");
};

Clacks.prototype.options = function (path, handler) {
	this.add(path, handler, "OPTIONS");
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
