/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering on values greater than a given value
 * @module tastypie-bookshelf/lib/resource/filters/gt
 * @author Eric Satterwhite
 * @since 1.0.0
 * @example ?foobar__gt=4
 */

module.exports = function gt(qb, field, term){
	return qb.where(field, '>', Number( term ) );
};
