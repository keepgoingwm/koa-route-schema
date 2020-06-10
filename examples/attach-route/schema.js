const RouteSchema = require('../../index')
const schemaOptions = require('./schemaOptions')

const schema = new RouteSchema({
  prefix: 'api',
  schemaOptions
})

module.exports = schema
