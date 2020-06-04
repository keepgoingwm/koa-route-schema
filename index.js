'use strict'

var Ajv = require('ajv')
var utils = require('./utils')

var defaultOptions = {
  attach: false,

  parseSchemaOptions: null,
  getRoute: function(o) {
    return o.route
  },
  getMethod: function(o) {
    return o.method
  },
  getSchema: function(o) {
    return o.schema
  },

  getData: function(ctx) {
    if (ctx.method === 'GET') {
      return ctx.query
    } else {
      return ctx.request.body
    }
  },

  attachRoute: function(router, route) {
    var routes = router.routes

    for (var i = 0, len = routes.length; i < len; i++) {
      var targetRoute = routes[i]

      if (targetRoute.method !== route.method) {
        continue
      }

      if (targetRoute.route !== route.route) {
        continue
      }

      targetRoute.middlewares.unshift(route.validateMiddleware)
    }
  }
}

/**
 *
 *
 * @param {Object} options
 * @returns
 */
function KoaRouteSchema(options) {
  if (!(this instanceof KoaRouteSchema)) {
    return new KoaRouteSchema(options)
  }

  this.options = utils.extend(defaultOptions, options)
  this.ajv = new Ajv(this.options.ajv || {})
  this.route = utils.pathMatch({ prefix: '/' })
  this.routes = []

  if (this.options.attach) {

  }
}

KoaRouteSchema.prototype.genMiddlewareFromSchema = function(schema) {
  var _this = this
  var validate = this.ajv.compile(schema)

  return function(ctx, next) {
    var valid = validate(_this.options.getData(ctx))
    if (!valid) {
      ctx.routeSchemaErrors = validate.errors
      throw new Error('RouteSchemaErrors')
    }

    next()
  }
}

/**
 * load schema 
 * ```
 *  schema.loadSchemaOptions([{
 *    route: 'test/:id',
 *    method: 'POST',
 *    schema: {"type":"object","properties":{"content":{"type":"string","title":"内容","minLength":0,"maxLength":5000},"type":{"type":"string","title":"类型","mock":{"mock":"@string"},"minLength":1,"maxLength":20,"enum":["example","hexo","weibo"]}},"required":["content","type"]}
 *  }])
 * ```
 * 
 * @param {Object} schemaOptions
 */
KoaRouteSchema.prototype.loadSchemaOptions = function(schemaOptions) {
  var options = schemaOptions
  var _this = this
  if (this.options.parseSchemaOptions) {
    options = this.options.parseSchemaOptions(options)
  }

  options.forEach(function(option) {
    var route = _this.options.getRoute(option)
    var method = _this.options.getMethod(option) || 'GET'
    var schema = _this.options.getSchema(option)
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema)
      } catch (e) {
        schema = null
      }
    }

    var prefixed = utils.createPrefix(_this.options.prefix, route)
    if (route && schema) {
      _this.routes.push({
        route: route,
        method: method.toUpperCase(),
        schema: schema,
        match: _this.route(prefixed),
        validateMiddleware: _this.genMiddlewareFromSchema(schema)
      })
    }
  })
}

/** 
 * ######################################
 * mode one: standalone middleware
 * low performance
 * 
 */
KoaRouteSchema.prototype.middleware = function middleware() {
  var _this = this

  return function(ctx, next) {
    for (var i = 0, len = _this.routes.length; i < len; i++) {
      var route = _this.routes[i]

      if (ctx.method !== route.method) {
        continue
      }

      // - if there's a match and no params it will be empty object!
      // - if there are some params they will be here
      // - if path not match it will be boolean `false`
      var match = route.match(ctx.path, ctx.params)

      if (!match) {
        continue
      }

      return route.validateMiddleware(ctx, next)
    }

    // called when request path not found on routes
    // ensure calling next middleware which is after the router
    return typeof _this.options.notFound === 'function' ?
      _this.options.notFound(ctx, next) :
      next()
  }
}

/** 
 * ######################################
 * mode tow: attach to other router middleware
 * high performance, need `route in attached router` be same with `route in schemaOptions` exactly
 * 
 */

KoaRouteSchema.prototype.attachToRouter = function(router) {
  var _this = this

  this.routes.forEach(function(route) {
    _this.options.attachRoute(router, route)
  })
}

/**
 * > Explicitly use this method when want
 * to use the router on **Koa@1**,
 * otherwise use [.middleware](#middleware) method!
 *
 * **Example**
 *
 * ```js
 * ```
 *
 * @return {GeneratorFunction} old [koa][] v1 middleware
 * @api public
 */

KoaRouteSchema.prototype.legacyMiddleware = function legacyMiddleware() {
  var _this = this
  return utils.convert.back(_this.middleware())
}

module.exports = KoaRouteSchema