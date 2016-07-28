/**
 * Generate a new route
 * @param config
 * @constructor
 */
function Route (config) {
  config = config || {}

  this.name = config.name || ''
  this.version = config.version || ''
  this.path = config.path || ''
  this.method = config.method || ''
  this.handler = Array.isArray(config.handler) ? config.handler : []

  if (typeof config.handler === 'function')
    this.handler.push(config.handler)

  if (typeof this.method !== 'string')
    throw new Error('Method must be a string')

  this.method = this.method.toLowerCase()

  if (typeof this.path !== 'string' && !(this.path instanceof RegExp))
    throw new Error('Path must be a string or regular expression')

  this.path = this.path.trim()

  // for later
  this.attached = false
  this.routes = []
}

/**
 * Add a route or another group to the group
 * @param data route or group
 */
Route.prototype.addRoute = function (data) {
  if (!(data instanceof Route))
    throw new Error('Attempted to add something not a group, nor a route')

  this.routes.push(data)
  return this
}

/**
 * Adds an array of routes to the group
 * @param data route or list of them
 */
Route.prototype.addRoutes = function (data) {
  if (Array.isArray(data))
    data.forEach(this.addRoute, this)

  if (data instanceof Route)
    this.addRoute(data)

  return this
}

/**
 * Static call to adding routes
 * @param data
 * @returns {Route}
 */
Route.addRoutes = function (data) {
  // if (typeof data === 'string')
  //   data = require(data)

  return new Route().addRoutes(data)
}

/**
 * Merge paths
 * @param prefix
 * @param current
 * @returns {string}
 */
Route.mergePaths = function (prefix, current) {
  // remove trailing slash
  prefix = prefix.trim().replace(/\/+$/g, '')

  // remove starting slash
  current = current.trim().replace(/^\/+/g, '')

  // merge
  return prefix + '/' + current
}

/**
 * Adds a route to the server
 * @param server to add route to
 */
Route.prototype.attach = function (server) {
  // cycle prevention
  if (this.attached) return
  this.attached = true

  // attempt to attach myself to server
  try {
    if (this.method.length) {
      var data = this.handler.slice()

      data.unshift({
        path: this.path,
        version: this.version,
        name: this.name,
      })

      server.log.info('Attaching %s %s', this.method.toUpperCase(), this.path)
      server[ this.method ].apply(server, data)
    }
  } catch (e) {
    this.attached = false
    throw Error('Unable to add route ' + JSON.stringify(this))
  }

  // attach children, merge routes & handlers
  this.routes.forEach(function (route) {
    route.path = Route.mergePaths(this.path, route.path)
    this.handler.slice().reverse().forEach(function (x) { route.handler.unshift(x) })
    route.attach(server)
  }, this)
}

module.exports = Route
