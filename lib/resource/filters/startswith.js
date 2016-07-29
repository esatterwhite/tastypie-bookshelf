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
	let cmp = qb.client.config === 'mysql' ? 'LIKE BINARY' :'LIKE';
	qb.whereRaw(`${field} ${cmp} '${term}%'`);
	return qb
};
