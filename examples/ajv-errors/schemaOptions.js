module.exports = [{
  route: '/',
  method: 'GET',
  schema: {
    type: 'object',
    properties: { type: { type: 'string', title: '类型', minLength: 1, maxLength: 20, enum: ['example', 'hexo', 'weibo'] } },
    required: ['type'],
    additionalProperties: false,
    errorMessage: 'should be an object with an string property type only'
  }
},
{
  route: '/foobar',
  method: 'POST',
  schema: {
    type: 'object',
    properties: { content: { type: 'string', title: '内容', minLength: 0, maxLength: 5000 }, type: { type: 'string', title: '类型', mock: { mock: '@string' }, minLength: 1, maxLength: 20, enum: ['example', 'hexo', 'weibo'] } },
    required: ['content', 'type'],
    errorMessage: {
      type: 'should be an object', // will not replace internal "type" error for the property "foo"
      required: {
        content: 'should have an string property "content"',
        type: 'should have a property "type" in [example, hexo, weibo]'
      }
    }
  }
}]
