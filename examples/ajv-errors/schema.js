const RouteSchema = require('../../index')
const schemaOptions = require('./schemaOptions')

const schema = new RouteSchema({
  prefix: 'api',
  schemaOptions,
  ajvErrors: {},
  ajvKeywords: 'instanceof'
})

module.exports = schema
