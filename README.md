# koa-route-schema

koa middleware to apply jsonschema with route

## Install

Install with [npm](https://www.npmjs.com/)

```cmd
npm install koa-route-schema --save
```

or install using [yarn](https://yarnpkg.com)

```cmd
yarn add koa-route-schema
```

## Features

+ built-in route handle, validate schema for each route stand-alone
+ validate data in query/body, auto select base on HTTP METHOD, or 
+ work fine with other route system, support [koa-rest-router](https://github.com/tunnckocore/koa-rest-router) and [koa-better-router](https://github.com/tunnckoCore/koa-better-router) by default
+ also supported: add schema to each route handle separately
+ use ajv-errors, ajv-keywords easily, optionally

## Usage

### use schema validation globally

[examples](https://github.com/keepgoingwm/koa-route-schema/tree/master/examples/yapi)

trans schema list to `schemaOptions` and new `KoaRouteSchema` instance.

```js
let routeschema = KoaRouteSchema({
  prefix: "v1",
  locale: 'en',
  schemaOptions: [
    {
      route: "/docs/:id",
      method: "GET",
      schema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            title: "type",
            minLength: 0,
            maxLength: 5,
          },
        },
      },
    },
    {
      route: "/docs",
      method: "POST",
      schema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            title: "content",
            minLength: 0,
            maxLength: 5000,
          },
          type: {
            type: "string",
            title: "type",
            mock: { mock: "@string" },
            minLength: 1,
            maxLength: 20,
            enum: ["example", "hexo", "weibo"],
          },
        },
        required: ["content", "type"],
      },
    },
  ],
});
```

```js
// standalone mode
this.app.use(routeschema.middleware());
```

```js
// attach mode
routeschema.attachToRouter(router /* router like koa-better-router */);
```

### add schema to each route

[examples](https://github.com/keepgoingwm/koa-route-schema/tree/master/examples/each-route)

```js
// schema.js

const RouteSchema = require('../../index')
const schema = new RouteSchema({
  prefix: 'v1'
})

module.exports = schema

```

```js
// router.js

const compose = require('koa-compose')

const router = Router({ prefix: '/api' }).loadMethods()
router.schema = schema

router.get('/', compose([
  router.schema.routeQueryMiddleware({ type: 'object', properties: { type: { type: 'string', title: '类型', minLength: 1, maxLength: 20, enum: ['example', 'hexo', 'weibo'] } }, required: ['type'] }),
  (ctx, next) => {
    ctx.body = `Hello world! Prefix: ${ctx.query.type}`
    return next()
  }
]))

// can use generator middlewares
router.post('/foobar', compose([
  router.schema.routeBodyMiddleware({ type: 'object', properties: { content: { type: 'string', title: '内容', minLength: 0, maxLength: 5000 }, type: { type: 'string', title: '类型', mock: { mock: '@string' }, minLength: 1, maxLength: 20, enum: ['example', 'hexo', 'weibo'] } }, required: ['content', 'type'] }),
  function(ctx, next) {
    ctx.body = `Foo Bar Baz! ${ctx.request.body.content}`
    return next()
  }
]))
```

## Options

```js
var options = {
  prefix: 'v1',
  ajv: {},  // options passed to ajv constructor
  ajvErrors: undefined, // options directly pass to ajv-errors, you can also call ajv-errors to [instance].ajv
  ajvKeywords: undefined, // options directly pass to ajv-keywords, you can also call ajv-keywords to [instance].ajv
  locale: undefined, // local pass to ajv-i18n
  schemaOptions: []

  parseSchemaOptions: null,  // [function]-parse real schemaOptions
  getRoute: function(o) {   // [function]-get route from each schemaOption item
    return o.route
  },
  getMethod: function(o) {  // [function]-get method from each schemaOption item
    return o.method
  },
  getSchema: function(o) {  // [function]-get schema from each schemaOption item
    return o.schema
  },
  getBodySchema: null,  // [function]-get bodySchema from each schemaOption item
  getQuerySchema: null, // [function]-get querySchema from each schemaOption item

  getData: null,  // [function]-get data to validate from koa context

  attachRoute: null,  // [function]-attach middleware to router item, support koa-better-route and koa-rest-router by default

  bodyErrorPrefix: 'body: ',
  queryErrorPrefix: 'query: ',

  onError: null // [function]-handle validate error
}
```

## API

### KoaRouteSchema.prototype.loadSchemaOptions

load schema

### KoaRouteSchema.prototype.middleware

get middleware globally, built-in route check, can work without other route system

### KoaRouteSchema.prototype.attachToRouter

attach validate to appropriate route, accept one argument stand for router instance
use `options.attachRoute` to define how to mix validation into supplied router system

### KoaRouteSchema.prototype.routeMiddleware

get middleware used with route middleware, to validate supplied schema

### KoaRouteSchema.prototype.routeBodyMiddleware

get middleware used with route middleware, to validate body schema

### KoaRouteSchema.prototype.routeQueryMiddleware

get middleware used with route middleware, to validate query schema

## Advanced

### handle validate error

default handler is:

```js
var defaultAjvOnError = function(err, ctx, errorsText) {
  if (err.message === 'RouteSchemaErrors') {
    ctx.throw(400, errorsText)
  } else {
    throw err
  }
}

var errorsText = _this.ajv.errorsText(validate.errors, { separator: '\n', dataVar: errorPrefix })
```

you can use custom handler by pass `onError` options.

```js
new RouteSchema({
  onError: function (err, ctx, errorsText) {/* something */}
})
```

more validate information placed at `ctx.routeSchemaErrors` and `ctx.routeSchemaValidate`

```js
ctx.routeSchemaErrors = validate.errors
ctx.routeSchemaValidate = validate
```
