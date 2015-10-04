/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case sensitve filtering of records
 * @module tastypie-bookshelf/lib/resource/filters/lte
 * @author Eric Satterwhite
 * @since 1.0.0
 * @example ?foobar__lte=1
 */

module.exports = function lte(qb, field, term){
	return qb.where(field, '<=', Number( term ));
};
