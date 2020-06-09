const Router = require('koa-better-router')
const schema = require('./schema')
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

module.exports = router
