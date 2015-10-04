/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case sensitve filtering of records
 * @module tastypie-bookshelf/lib/resource/filters/contains
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires cage/string
 * @example ?foobar__icontains=igh
 */
var util      = require('util');
module.exports = function contains(qb, field, term){
	// MySQL string matching is case insensitive
	// neither bookshelf nor knex provide a way to do case sensitive matching
	// This is how you do it with mySQL. Thanks knex 
	return qb.whereRaw(util.format("%s LIKE BINARY '%s'",field, '%' + term + '%'));
};
