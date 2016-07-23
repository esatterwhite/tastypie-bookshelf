/*jshint node:true, laxcomma: true, smarttabs: true*/
'use strict';
/**
 * Tastypie-bookshelf
 * @module tastypie-bookshelf
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires tastypie-bookshelf/lib/resource/bookshelf
 * @requires tastypie-bookshelf/lib/resource/filters
 */
module.exports = require('./resource');
module.exports.filters = require('./resource/filters');
module.exports.constants = require('./resource/constants')