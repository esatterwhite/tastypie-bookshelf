/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering greather or equal to a given value
 * @module tastypie-bookshelf/lib/resource/filters/ne
 * @author Eric Satterwhite
 * @since 1.0.0
 * @example ?foobar__ne=4
 */

// Knex doesn't support multipl where nots.
module.exports = function ne(qb, field, term){
	return qb.whereNot(field, term );
};
