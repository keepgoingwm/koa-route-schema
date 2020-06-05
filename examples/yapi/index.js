const Koa = require('koa')
const koaBody = require('koa-body')
const routeschema = require('./schema')

let app = new Koa()

app.use(koaBody({
  onError: (err, ctx) => {
    ctx.throw('body parse error', 422)
  }
}))
app.use(routeschema.middleware())
app.use((ctx, next) => {
  ctx.body = 'succ'
})

app.listen(3002)