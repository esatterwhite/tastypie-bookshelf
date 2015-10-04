/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering filtering of records where the value is less than the given value
 * @module tastypie-bookshelf/lib/resource/filters/lt
 * @author Eric Satterwhite
 * @since 1.0.0
 * @example ?foobar__lt=1
 */

module.exports = function lt(qb, field, term){
	return qb.where(field, '<', Number( term ) );
};
