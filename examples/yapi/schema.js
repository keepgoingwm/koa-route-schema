const RouteSchema = require('../../index')
const yapiParseOptions = require('koa-route-schema-yapi')
const yapiSchemaOptions = require('./schemaOptions')

let routeschema = new RouteSchema({
  ...yapiParseOptions,
  prefix: 'v1',
  schemaOptions: yapiSchemaOptions
})
module.exports = routeschema