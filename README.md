# A Better Restify Router
> A clean way to organize routes for the restify router

[![Build Status](https://travis-ci.org/mothepro/node-restify-router.svg?branch=master)](https://travis-ci.org/mothepro/node-restify-router)
[![npm version](https://img.shields.io/npm/v/restify-better-router.svg)](https://www.npmjs.com/package/restify-better-router)
[![license](https://img.shields.io/npm/l/restify-better-router.svg)](http://spdx.org/licenses/ISC)


## Installation
```
$ npm i -S restify-better-router
```
Command not working? Follow [this tutorial](https://www.npmjs.com/package/restify-better-router/tutorial).

## Motivation
This package allows you to define your routes using a Route object, making it very easy to attach routes to your restify server. In larger applications which have many routes organizing routes off of file structure may be more optimal than one large file.

## Example
File `user.js`
```
const Route = require('restify-better-router')

module.exports.name = new Route()
    .get('/name/:name')
    .addHandler(function (req, res, next) {
        res.send('Hello ' + req.params.name)
        next()
    })
```

File `place.js`
```
const Route = require('restify-better-router')

module.exports.name = new Route()
    .get('/place/:place')
    .addHandler(function (req, res, next) {
        res.send('Hello from ' + req.params.place)
        next()
    })
```

File `api.js`
```
const restify = require('restify');
const Route = require('restify-better-router')

var server = restify.createServer()

// sub routes
const name = require('./name')
const place = require('./place')

var api = new Route()
    .setPath('/api')
    .addRoutes([name, place])
    .attach(server)

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
```

## Creating a route
A router object is an isolated instance of routes. The router interface matches the interface for adding routes to a restify server:
```
var Router = require('restify-router').Router;
var routerInstance = new  Router();
var restify = require('restify');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

// add a route like you would on a restify server instance
routerInstance.get('/hello/:name', respond);

var server = restify.createServer();
// add all routes registered in the router to this server instance
routerInstance.applyRoutes(server);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
```

## Usage
Upon creating a new route an object can be given as a shortcut to the chainable methods
```
new Route({
    name:       Given route name
    version:    Version require for route
    path:       Path for a route
    method:     GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS
    handler:    A handler function, or Array of handler functions
})
```

If you prefer, fluent methods can be used instead of the object.
Assuming we create a route object like this `var r = new Route()`.

One can set path and method using...
+ `r.setPath(path)` Sets the path for route as `path`
+ `r.get(path)` Sets GET method, with a specified `path`
+ `r.post(path)` Sets POST method, with a specified `path`
+ `r.put(path)` Sets PUT method, with a specified `path`
+ `r.patch(path)` Sets PATCH method, with a specified `path`
+ `r.head(path)` Sets HEAD method, with a specified `path`
+ `r.del(path)` or `r.delete(path)` Sets DELETE method, with a specified `path`
+ `r.opts(path)` or `r.options(path)` Sets OPTIONS method, with a specified `path`

One can modify the route's other attributes using...
+ `r.setName(name)` Given route the name `name`
+ `r.setVersion(verion)` Sets a route's version to `version` (can be an array of versions)
+ `r.addHandler(handler)` Adds `handler` as the route's function to the route
+ `r.addRoute(route)` Adds a child route to be prefixed by this route's path
+ `r.addRoutes(routes)` Adds an array of children routes
+ `r.attach(server)` Attachés this route and its children to `server`

## Attaching routes to a server
Once you have made and grouped your routes however you like
you can attach them to the restify server to become live.
```
const Route = require('restify-better-router')
const restify = require('restify')

var r = new Route({
    name: 'route',
    method: 'get',
    handler: function (req, res, next) {
        res.send('Hello World!')
        next()
    }
})

var server = restify.createServer()

// r will now be seen by the server
r.attach(server)

// start server
server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
```

---

Influenced by [restify-router](https://www.npmjs.com/package/restify-router).
