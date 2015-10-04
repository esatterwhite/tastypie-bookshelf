/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering greather or equal to a given value
 * @module tastypie-bookshelf/lib/resource/filters/gte
 * @author Eric Satterwhite
 * @since 1.0.0
 * @example ?foobar__gte=4
 */

module.exports = function gte(qb, field, term){
	return qb.where(field, '>=', Number( term ) );
};
