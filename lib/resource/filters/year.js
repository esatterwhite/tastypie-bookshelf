/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Restricts a date field to a specific year
 * @module tastypie-bookshelf/lib/resource/filters/year
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires joi
 * @requires boom
 * @example ?foobar__year=2015-10-01
 * @example ?foobar__year=2015
 */
var joi       = require('joi')
  , boom      = require('boom')
  , date      = require('mout/date')
  , range     = require('./range')
  , validator
  ;

validator = joi.alternatives().try([joi.date().format('YYYY-MM-DD' ), joi.date().format('YYYY') ])

module.exports = function range(qb, field, term){
	let result;
	result = validator.validate( term );
	if( result.error ){
		throw result.error;
	}

	return range( qb, field, [result.value, date.incr( result.value, 'year', 1 ) ] );
}
