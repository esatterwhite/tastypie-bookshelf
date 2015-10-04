/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case sensitve filtering of the end of a string 
 * @module tastypie-bookshelf/lib/resource/filters/startswith
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires util
 * @example ?foobar__startswith=igh
 */
var util = require('util');
module.exports = function startswith(qb, field, term){
	return qb.whereRaw(util.format( '%s LIKE BINARY \'%s\'', field, term + '%'  ) );
};
