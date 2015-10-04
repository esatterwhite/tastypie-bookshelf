/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case sensitve filtering of records
 * @module tastypie-bookshelf/lib/resource/filters/exact
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires cage/string
 * @example ?foobar__exact=igh
 */
module.exports = function exact(qb, field, term){
	return qb.where(field, term);
};
