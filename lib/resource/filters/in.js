/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case sensitve filtering of records
 * @module tastypie-bookshelf/lib/resource/filters/in
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires cage/string
 * @example ?foobar__in=[1,2,3]
 */
module.exports = function(qb, field, term){
	term = Array.isArray( term ) ? term: term.split(',');
	return qb.whereIn(field, term );
};
