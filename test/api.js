const Route = require('..')

var nameHandler = function (req, res, next) {
  res.write(req.params.name)
  next()
}
nameHandler.handlerName = 'namer'

var placeHandler = function (req, res, next) {
  res.write(req.params.place)
  next()
}
placeHandler.handlerName = 'placer'

var api = new Route({
  name: 'api',
  path: '/api',
  handler: function (req, res, next) {
    next()
    res.end()
  }
})

var getName = new Route({
  path: ':name',
  method: 'get',
  handler: nameHandler
})

var getOther = new Route({
  path: '/other/:name/:place/',
  method: 'get',
  handler: [nameHandler, placeHandler]
})

api.addRoutes([getName, getOther])

var getPlace = require('./placer')
getPlace.addHandler(placeHandler)

getName.addRoute(getPlace)

module.exports = api
