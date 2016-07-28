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
  this.method = config.method || 'get'
  this.handler = Array.isArray(config.handler) ? config.handler : [config.handler]

  this.method = this.method.toLowerCase()
  this.path = this.path.trim()

  if (this.handler.length === 0)
    throw new Error('No handler given in route')

  this.attached = false
}

/**
 * Add a prefix to a route
 * @param prefix
 */
Route.prototype.addPrefix = function (prefix) {
  this.path = Route.sum(prefix, this.path)
  return this
}

/**
 * Addes a route to the server
 * @param server to add route to
 */
Route.prototype.attach = function (server) {
  if (this.attached) return
  this.attached = true

  try {
    var data = this.handler

    data.unshift({
      path: this.path,
      version: this.version,
      name: this.name,
    })

    server.log.info('registering %s at uri %s', this.method.toUpperCase(), this.path)

    server[ this.method ].apply(server, data)
  } catch (e) {
    this.attached = false
    throw Error('Unable to add route ' + JSON.stringify(this), e)
  }
}

Route.sum = function (prefix, current) {
  // remove trailing slash
  prefix = prefix.trim().replace(/\/+$/g, '')

  // remove starting slash
  current = current.trim().replace(/^\/+/g, '')

  // merge
  return prefix + '/' + current
}

module.exports = Route
