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

  if (typeof this.path === 'string')
    this.path = this.path.trim()
  else if (!(this.path instanceof RegExp))
    throw new Error('Path must be a string or regular expression')

  // for later
  this.attached = false
  this.solved = false
  this.routes = []
}

/**
 * Set a path
 * @param path
 * @returns {Route}
 */
Route.prototype.setPath = function (path) {
  if (typeof path === 'string')
    this.path = path.trim()
  else if (path instanceof RegExp)
    this.path = path
  else
    throw new Error('Path must be a string or regular expression')

  return this
}

/**
 * Add a name to the route
 * @param name
 * @returns {Route}
 */
Route.prototype.setName = function (name) {
  this.name = name
  return this
}

/**
 * Sets the version which work with this route
 * @param version
 * @returns {Route}
 */
Route.prototype.setVersion = function (version) {
  this.version = version
  return this
}

/**
 * Addes a new handler to the Route callback stack
 * @param handler
 * @returns {Route}
 */
Route.prototype.addHandler = function (handler) {
  this.handler.push(handler)
  return this
}

var methodShortcut = function (method) {
  return function (path) {
    this.method = method
    return this.setPath(path)
  }
}

/**
 * @param path
 * @returns {Route}
 */
Route.prototype.get = methodShortcut('get')

/**
 * @param path
 * @returns {Route}
 */
Route.prototype.post = methodShortcut('post')

/**
 * @param path
 * @returns {Route}
 */
Route.prototype.put = methodShortcut('put')

/**
 * @param path
 * @returns {Route}
 */
Route.prototype.del = Route.prototype.delete = methodShortcut('del')

/**
 * @param path
 * @returns {Route}
 */
Route.prototype.patch = methodShortcut('patch')

/**
 * @param path
 * @returns {Route}
 */
Route.prototype.head = methodShortcut('head')

/**
 * @param path
 * @returns {Route}
 */
Route.prototype.opts = Route.prototype.options = methodShortcut('opts')

/**
 * Add a route or another group to the group
 * @param data route or group
 * @returns {Route}
 */
Route.prototype.addRoute = function (data) {
  if (!(data instanceof Route))
    throw new Error('Attempted to add something not a group, nor a route')

  this.routes.push(data)
  return this
}

/**
 * @TODO unsolve newly added routes
 *
 * Adds an array of routes to the group
 * @param data route or list of them
 * @returns {Route}
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
 * @returns {string|RegExp}
 */
Route.mergePaths = function (prefix, current) {
  if (prefix instanceof RegExp || current instanceof RegExp) {
    if (typeof prefix === 'string')
      prefix = new RegExp(prefix)

    if (typeof current === 'string')
      current = new RegExp(current)

    return new RegExp(Route.mergePaths(
      prefix.source.replace(/\$?$/, '').replace(/\\\/*/g, '/'),
      current.source.replace(/^\^?/, '').replace(/\\\/*/g, '/')
    ))
  } else {
    // remove trailing slash
    prefix = prefix.trim().replace(/\/+$/g, '')

    // remove starting slash
    current = current.trim().replace(/^\/+/g, '')

    // merge
    return prefix + '/' + current
  }
}

/**
 * Adds a route to the server
 * @param server to add route to
 * @returns {Route}
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
    // Fix child route if it hasn't been already
    if (!route.solved) {
      route.path = Route.mergePaths(this.path, route.path)
      this.handler.slice().reverse().forEach(function (x) {
        route.handler.unshift(x)
      })
      route.solved = true
    }

    route.attach(server)
  }, this)

  // allow to be attached to another server
  this.attached = false
  return this
}

module.exports = Route
