const Route = require('..')

var nameHandler = function (req, res, next) {
  res.send(req.params.name)
  next()
}

var placeHandler = function (req, res, next) {
  res.send(req.params.place)
  next()
}

var api = new Route({
  name: 'api',
  path: '/api',
})

var getName = new Route({
  path: ':name',
  method: 'get',
  handler: nameHandler
})

var getPlace = new Route({
  path: ':place',
  method: 'get',
  handler: [nameHandler, placeHandler]
})

api.addRoute(getName)
getName.addRoute(getPlace)

module.exports = api
