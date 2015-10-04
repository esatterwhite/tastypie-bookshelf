/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Restricts a date value between a finite boundry
 * @module tastypie-bookshelf/lib/resource/filters/range
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires joi
 * @requires boom
 * @example ?foobar__range=2015-04-01,2015-07-01
 */
var joi       = require('joi')
  , boom      = require('boom')
  , validator
  ;

validator = joi.array().items( joi.date().format('YYYY-MM-DD' )).length( 2 );

module.exports = function range(qb, field, term){
	var result;
	term = Array.isArray( term ) ? term : term.split(',');

	result = validator.validate( term );
	if( result.error ){
		throw result.error;
	} else if( result.value[0] > result.value[1] ){
		// do a real error
		throw boom.badData('Dates out of range');
	};

	return qb.whereBetween(field, term );
}
