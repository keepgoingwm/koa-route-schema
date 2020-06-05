'use strict'

var Ajv = require('ajv')
var utils = require('./utils')

var defaultOptions = {
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
  getBodySchema: null,
  getQuerySchema: null,

  getData: function(ctx, type) {
    if (type === 'query') {
      return ctx.query
    } else if (type === 'body') {
      return ctx.request.body
    } else {
      return ctx.request.body
    }
  },

  attachRoute: function(router, route) {
    var routes = router.routes
    var prefix = router.options.prefix

    for (var i = 0, len = routes.length; i < len; i++) {
      var targetRoute = routes[i]

      if (targetRoute.method !== route.method) {
        continue
      }

      var prefixed = utils.createPrefix(prefix, targetRoute.route)
      if (!route.match(prefixed)) {
        continue
      }

      targetRoute.middlewares.unshift(route.validateMiddleware)
    }
  },

  bodyErrorPrefix: 'body: ',
  queryErrorPrefix: 'query: ',

  onError: function(err, ctx) {
    if (err.message === 'RouteSchemaErrors') {
      ctx.throw(400, ctx.routeSchemaErrors.map(function(e) { return e.message }).join(', '))
    } else {
      throw err
    }
  }
}

/**
 * KoaRouteSchema class
 *
 * @param {Object} options
 * @param {Object} options.ajv ajv options
 * @param {Object} options.schemaOptions provide schemaOptions in constructor
 */
function KoaRouteSchema(options) {
  if (!(this instanceof KoaRouteSchema)) {
    return new KoaRouteSchema(options)
  }

  this.options = utils.extend(defaultOptions, options)
  this.ajv = new Ajv(this.options.ajv || {})
  this.route = utils.pathMatch({ prefix: '/' })
  this.routes = []

  if (this.options.schemaOptions) {
    this.loadSchemaOptions(this.options.schemaOptions)
  }
}

/**
 * generate schema validate middleware
 *
 * handle errors Example
 * ```js
 * ```
 */
KoaRouteSchema.prototype.genMiddlewareFromSchema = function(bodySchema, querySchema) {
  var _this = this
  var bodyValidate
  var queryValidate
  if (bodySchema) {
    bodyValidate = this.ajv.compile(bodySchema)
  }
  if (querySchema) {
    queryValidate = this.ajv.compile(querySchema)
  }

  return function(ctx, next) {
    function callValidate(validate, type) {
      if (!validate) {
        return
      }

      var valid = validate(_this.options.getData(ctx, type))

      if (!valid) {
        var errorPrefix = type === 'body' ? _this.options.bodyErrorPrefix : _this.options.queryErrorPrefix
        ctx.routeSchemaErrors = validate.errors.map(function(err) {
          err.message = errorPrefix + err.message
          return err
        })

        if (typeof _this.options.onError === 'function') {
          _this.options.onError(new Error('RouteSchemaErrors'), ctx)
        } else {
          throw new Error('RouteSchemaErrors')
        }
      }
    }

    callValidate(bodyValidate, 'body')
    callValidate(queryValidate, 'query')

    return next()
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

    // handle both body and query schema validate,
    // apply validating only if the corresponding schema exists
    var bodySchema
    var querySchema
    if (_this.options.getBodySchema) {
      bodySchema = utils.parseString(_this.options.getBodySchema(option))
    }
    if (_this.options.getQuerySchema) {
      querySchema = utils.parseString(_this.options.getQuerySchema(option))
    }

    // get default schema
    if (!bodySchema && !querySchema) {
      if (/POST|PUT|PATCH/.test(method)) {
        bodySchema = utils.parseString(_this.options.getSchema(option))
      } else {
        querySchema = utils.parseString(_this.options.getSchema(option))
      }
    }

    var prefixed = utils.createPrefix(_this.options.prefix, route)
    if (route && (bodySchema || querySchema)) {
      _this.routes.push({
        route: route,
        method: method.toUpperCase(),
        bodySchema: bodySchema,
        querySchema: querySchema,
        match: _this.route(prefixed),
        validateMiddleware: _this.genMiddlewareFromSchema(bodySchema, querySchema)
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
    return typeof _this.options.notFound === 'function'
      ? _this.options.notFound(ctx, next)
      : next()
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
