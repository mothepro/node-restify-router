/**
 * Generate a new route
 * @param config
 * @constructor
 */
function Route (config) {
  config = config || {}

  this.name = config.name.trim() || ''
  this.version = config.version.trim() || ''
  this.path = config.path.trim() || ''
  this.method = config.method.toLowerCase() || 'get'
  this.handler = Array.isArray(config.handler) ? config.handler : [config.handler]

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
}

/**
 * Addes a route to the server
 * @param server to add route to
 */
Route.prototype.attach = function (server) {
  if (this.attached)
    return
  else
    this.attached = true

  try {
    var data = this.handler

    data.unshift({
      path: this.path,
      version: this.version,
      name: this.name,
    })

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
