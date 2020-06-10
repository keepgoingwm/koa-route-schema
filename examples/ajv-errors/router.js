const Router = require('koa-better-router')
const schema = require('./schema')

const router = Router({ prefix: '/api' }).loadMethods()
router.schema = schema

router.get('/', (ctx, next) => {
  ctx.body = `Hello world! Prefix: ${ctx.query.type}`
  return next()
})

router.post('/foobar', function(ctx, next) {
  ctx.body = `Foo Bar Baz! ${ctx.request.body.content}`
  return next()
})

module.exports = router
