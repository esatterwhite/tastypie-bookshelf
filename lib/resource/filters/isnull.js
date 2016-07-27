/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering based null values
 * @module tastypie-bookshelf/lib/resource/filters/isnull
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires mout/string/typecast
 * @example ?foo__isnull=true&bar__isnull=false
 */

var typecast = require('mout/string/typecast');

module.exports = function isnull(qb, field, term){
	term = typeof term === 'string' ? !!typecast(term) : term
	return  term ? qb.whereNull( field ) : qb.whereNotNull( field );
};
