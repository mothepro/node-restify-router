const Route = require('./Route')

/**
 * Generate a new route
 * @param routes array of routes to add
 * @param prefix path prefix to all routes in group
 * @constructor
 */
function Group (routes, prefix) {
  this.prefix = prefix || ''
  this.routes = []
  this.groups = []
  this.attached = false

  if (Array.isArray(routes))
    routes.forEach(Group.addRoute, this)

  if (this.handler.length === 0)
    throw new Error('No handler given in route')

  return this
}

/**
 * Add a prefix to a route
 * @param prefix
 */
Group.prototype.addPrefix = function (prefix) {
  this.prefix = Route.sum(prefix, this.prefix)
  return this
}

/**
 * Add a route or another group to the group
 * @param data route or group
 */
Group.prototype.addRoute = function (data) {
  if (data instanceof Route)
    this.routes.push(data)
  else if (data instanceof Group)
    this.groups.push(data)
  else
    throw new Error('Attempted to add something not a group, nor a route')

  return this
}

/**
 * Addes a route to the server
 * @param server to add route to
 */
Group.prototype.attach = function (server) {
  if (this.attached) return
  this.attached = true

  this.routes.forEach(function (route) {
    route
        .addPrefix(this.prefix)
        .attach(server)
  })

  this.groups.forEach(function (group) {
    group
        .addPrefix(this.prefix)
        .attach(server)
  })

  return this
}

module.exports = Group
