/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Restricts a date field to a specific month
 * @module tastypie-bookshelf/lib/resource/filters/month
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires joi
 * @requires boom
 * @example ?foobar__month=2015-10-01
 */
var joi       = require('joi')
  , boom      = require('boom')
  , date      = require('mout/date')
  , range     = require('./range')
  , validator
  ;

validator = joi.date().format('YYYY-MM-DD' );

module.exports = function month(qb, field, term){
	let result, end;
	result = validator.validate( term );
	if( result.error ){
		throw result.error;
	}
	// set it back to the first
	end = date.clone( result.value );
	end.setDate(1);
	return range( qb, field, [result.value, date.incr( end, 'month', 1 ) ] );
}
