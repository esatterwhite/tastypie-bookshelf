/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * Allows for filtering greather or equal to a given value
 * @module tastypie-bookshelf/lib/resource/filters/active
 * @author Eric Satterwhite
 * @since 1.0.0
 * @example ?foobar__active=true
 * @example ?foobar__active=false
 */
var date = require('@fulfill/cage/date')
  , lt = require('./lt')
  , gt = require('./gt')
  ;

module.exports = function active(qb, field, term){
    let now = date.utc().format('YYYY-MM-DD');
    qb.where('is_draft', Number(!!term) );
	return term ? qb.where( field, '<', now ) : qb.where(field, '>', now);

};
