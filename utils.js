'use strict'

var utils = require('lazy-cache')(require)
var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign, no-global-assign

/**
 * Lazily required module dependencies
 */

require('extend-shallow', 'extend')
require('path-match')
require('koa-compose', 'compose')
require('koa-convert', 'convert')
require('ajv-errors')
require('ajv-keywords')
require = fn // eslint-disable-line no-undef, no-native-reassign, no-global-assign


utils.createPrefix = function createPrefix(prefix, pathname) {
  var path = pathname.replace(/^\/|\/$/, '')
  var clean = prefix.replace(/^\/|\/$/, '')
  clean = clean.length > 0 ? '/' + clean : clean
  return clean + '/' + path
}

utils.parseString = function(str) {
  if (typeof str === 'string') {
    try {
      str = JSON.parse(str)
    } catch (e) {
      str = null
    }
  }

  return str
}

module.exports = utils