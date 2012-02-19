var PathTemplate = require("path-template");
var URL = require("url");

function Clacks() {
	this.handlers = {
		HEAD: {},
		GET: {},
		POST: {},
		PUT: {},
		DELETE: {},
		PATCH: {},
		any: {}
	};
	this.routes = [];
	this.dispatcher = this.dispatch.bind(this);
}

module.exports = Clacks;

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

Clacks.prototype.del = function (path, handler) {
	this.add(path, handler, "DELETE");
};

Clacks.prototype.patch = function (path, handler) {
	this.add(path, handler, "PATCH");
};

Clacks.prototype.notFound = function (req, res) {
	console.log("404 " + req.url);
	var body = "resource '" + URL.parse(req.url).pathname + "' not found\n",
		head = {"Content-Length": body.length, "Content-Type": "text/plain"};
	res.writeHead(404, head);
	res.end(body);
};

Clacks.prototype.dispatch = function (req, res) {
	var url = URL.parse(req.url),
		match = PathTemplate.match(this.routes, url.pathname),
		templateString,
		handler = this.notFound;
	if (match) {
		templateString = PathTemplate.inspect(match.template);
		handler = this.handlers[req.method][templateString] ||
			this.handlers.any[templateString] || handler;
		req.path = match;
	}
	handler.call(this, req, res);
};
