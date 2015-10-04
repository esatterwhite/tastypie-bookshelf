/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering case insensitive filtering of records
 * @module tastypie-bookshelf/lib/resource/filters/icontains
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires cage/string
 * @example ?foobar__icontains=igh
 */

module.exports = function icontains(qb, field, term){
	return qb.where(field , 'LIKE','%' + term + '%');
};