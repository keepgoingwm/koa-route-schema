const Koa = require('koa')
const koaBody = require('koa-body')
const router = require('./router')
const schema = require('./schema')

const app = new Koa()

app.use(koaBody({
  onError: (err, ctx) => {
    console.log(err)
    ctx.throw('body parse error', 422)
  }
}))
schema.attachToRouter(router)
app.use(router.middleware())

app.listen(3002)

console.log('App listen on http://localhost:3002')
// localhost:3002/api?type=hexo
// localhost:3002/api?type=hexos

// [post] localhost:3002/api/foobar  { "type": "example", "content": "safasdf" }
// [post] localhost:3002/api/foobar  { "type": "examples", "content": "safasdf" }
// [post] localhost:3002/api/foobar  { "type": "examplessssssssssssssssssss", "content": "safasdf" }
