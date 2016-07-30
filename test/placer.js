const Route = require('..')

var getPlace = new Route({
  path: ':place',
  method: 'get'
})

module.exports = getPlace
