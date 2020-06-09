const Koa = require('koa')
const koaBody = require('koa-body')
const routeschema = require('./schema')

const app = new Koa()

app.use(koaBody({
  onError: (err, ctx) => {
    console.log(err)
    ctx.throw('body parse error', 422)
  }
}))
app.use(routeschema.middleware())
app.use((ctx, next) => {
  ctx.body = 'succ'
})

app.listen(3002)

console.log('App listen on http://localhost:3002')
