const RouteSchema = require('../../index')
const schemaOptions = require('./schemaOptions')

const schema = new RouteSchema({
  prefix: 'api',
  schemaOptions,
  ajvErrors: {},
  locale: 'en',
  onError: function(err, ctx, errorsText) {
    if (err.message === 'RouteSchemaErrors') {
      console.log(ctx.routeSchemaErrors, ctx.routeSchemaValidate)
      ctx.throw(400, errorsText)
    } else {
      throw err
    }
  },
  ajvKeywords: 'instanceof'
})

module.exports = schema
