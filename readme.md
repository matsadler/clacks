[![build status](https://secure.travis-ci.org/matsadler/clacks.png)](http://travis-ci.org/matsadler/clacks)
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

### app.notFound(req, res)

Invoked when no handler is found. It is unlikely you will need to call this
function, but you can set the notFound property of your app to a custom function
to implement your own not found handler.

### app.dispatch(req, res)

Dispatch req and res to the appropriate handler. You're unlikely to need to call
this function directly, though it may come in handy when testing or debugging.

### app.dispatcher

Dispatcher function bound to app. Indented to be handed to http.createServer.
