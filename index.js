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
  this.handler = Array.isArray(config.handler) ? config.handler : [config.handler]

  if (typeof this.method !== 'string')
    throw new Error('Method must be a string')

  this.method = this.method.toLowerCase()

  if (typeof this.path !== 'string' && !(this.path instanceof RegExp))
    throw new Error('Path must be a string or regular expression')

  this.path = this.path.trim()

  if (this.handler.length === 0)
    throw new Error('No handler given in route')

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
 * @param data route or group
 */
Route.prototype.addRoutes = function (data) {
  if (Array.isArray(data))
    data.forEach(this.addRoute, this)

  return this
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
      var data = this.handler

      data.unshift({
        path: this.path,
        version: this.version,
        name: this.name,
      })

      server.log.info('Attaching [%s]%s', this.method.toUpperCase(), this.path)
      server[ this.method ].apply(server, data)
    }
  } catch (e) {
    this.attached = false
    throw Error('Unable to add route ' + JSON.stringify(this))
  }

  // attach children
  this.routes.forEach(function (route) {
    route.path = Route.mergePaths(this.path, route.path)
    route.attach(server)
  }, this)
}

module.exports = Route
