# koa-route-schema

koa middleware to apply jsonschema with route

## Install

Install with [npm](https://www.npmjs.com/)

```
$ npm install koa-route-schema --save
```

or install using [yarn](https://yarnpkg.com)

```
$ yarn add koa-route-schema
```

## Usage

trans schema list to `schemaOptions` and new `KoaRouteSchema` instance.

```js
let routeschema = KoaRouteSchema({
  prefix: "v1",
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

## Options

```js
var options = {
  prefix: 'v1',
  ajv: {},  // options passed to ajv constructor
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

  attachRoute: null,  // [function]-attach middleware to router item

  bodyErrorPrefix: 'body: ',
  queryErrorPrefix: 'query: ',

  onError: null // [function]-handle validate error
}
```

## API

### KoaRouteSchema.prototype.loadSchemaOptions

### KoaRouteSchema.prototype.middleware

### KoaRouteSchema.prototype.attachToRouter
