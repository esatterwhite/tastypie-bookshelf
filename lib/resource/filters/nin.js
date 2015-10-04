/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case sensitve filtering of records
 * @module tastypie-bookshelf/lib/resource/filters/nin
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires cage/string
 * @example ?foobar__nin=[1,2,3]
 */
module.exports = function nin(qb, field, term){
	term = Array.isArray( term ) ? term : term.split(',');
	return qb.whereNotIn(field, term );
};
