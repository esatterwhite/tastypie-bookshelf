/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case sensitve filtering of the end of a string
 * @module tastypie-bookshelf/lib/resource/filters/iendswith
 * @author Eric Satterwhite
 * @since 1.0.0
 * @example ?foobar__iendswith=igh
 */
module.exports = function iendswith(qb, field, term){
	let cmp = qb.client.config.client === 'mysql' ? 'like' :'ilike';
	return qb.where( field, cmp, `%${term}`);
};
