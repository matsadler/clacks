# Clacks

Clacks is a simple HTTP/URL path router for the Node.js HTTP Server.

## Installation

    npm install clacks

## Usage

    var Clacks = require("clacks");
    var http = require("http");

    var app = new Clacks();

    app.get("/", function(req, res) {
        res.end("Hello world!");
    });

    app.get("/examples/:exampleID", function (req, res) {
        res.end(req.path.exampleID);
    });

    http.createServer(app.dispatcher).listen(9292, "127.0.0.1");

### Clacks()

Constructor

    var app = new Clacks();

### app.add(path, handler[, method])

Set up a handler for path and method.

handler should be a function, path a rails/sinatra-style url path, and method an
uppercased HTTP method. If method is omitted, handler will be invoked whenever
path matches, regardless of the HTTP method.

    app.add("/foo", function (req, res) {
        res.end("you requested /foo with GET");
    }, "GET");

    app.add("/bar", function (req, res) {
        res.end("you POSTed to /bar");
    }, "POST");

    app.add("/baz", function (req, res) {
        res.end("/baz doesn't care what method you use");
    });

handler will be called with two arguments, a request object and a response
object. These are the standard Node.js HTTP server request and response objects.
The request object has an additional 'path' attribute, which is an object
holding path variables.

    app.add("/users/:userID", function (req, res) {
        res.end("you asked for user " + req.path.userID);
    });

### app.head(path, handler)

Shortcut for `app.add(path, handler, "HEAD")`.

### app.get(path, handler)

Shortcut for `app.add(path, handler, "GET")`.

### app.post(path, handler)

Shortcut for `app.add(path, handler, "POST")`.

### app.put(path, handler)

Shortcut for `app.add(path, handler, "PUT")`.

### app.del(path, handler)

Shortcut for `app.add(path, handler, "DELETE")`.

### app.patch(path, handler)

Shortcut for `app.add(path, handler, "PATCH")`.

### app.scope([path], [scopeHandler, scopeHandler, ...], scopeBlock)

Allows you to specify a scope for multiple routes in a Rails router style if the
first argument is a string:

    app.get("/users", someHandler);
    app.scope("/users/:id", function(users) {
        users.get("", getUser);
        users.get("/profile", userProfile);
    });

Also allows you to wrap your scoped handlers in filter functions. These
functions must accept the function as an argument, and return a new function
that accepts req and res and (optionally) calls the original function. For example:

    function withValidUser(func) {
        return function(req, res) {
            if (validUser(req.path.id)) {
                func(req, res);
            } else {
                res.writeHead(401);
                res.end();
            }
        }
    }
    app.scope("/users/:id", withValidUser, function(users) {
        users.get("", getUser);
    });

### app.notFound(req, res)

Invoked when no handler is found. It is unlikely you will need to call this
function, but you can set the notFound property of your app to a custom function
to implement your own not found handler.

### app.dispatch(req, res)

Dispatch req and res to the appropriate handler. You're unlikely to need to call
this function directly, though it may come in handy when testing or debugging.

### app.dispatcher

Dispatcher function bound to app. Indented to be handed to http.createServer.

## TODO

- Nested scopes
- Test scopes