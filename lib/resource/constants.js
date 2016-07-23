/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * contains static values used through out the application
 * @module tastypie-bookshelf/lib/resource/constants
 * @author Eric Satterwhite
 * @since 1.0.0
 */

/**
 * @readonly
 * @name ALL
 * @memberof mempshis/lib/resource/constatns
 * @property {Number} Used to allow all filter types on resources
 **/
exports.ALL = 1;
/**
 * @readonly
 * @name ALL_WITH_RELATIONS
 * @memberof mempshis/lib/resource/constatns
 * @property {String[]} Used to allow relationship traversal on related resources fields
 **/
exports.ALL_WITH_RELATIONS = 2;

/**
 * @readonly
 * @name RANGE_FILTERS
 * @memberof mempshis/lib/resource/constatns
 * @property {String[]}
 **/
exports.RANGE_FILTERS = ['range', 'lt','lte','gt','gte', 'exact'];
/**
 * @readonly
 * @name NUMBER_FILTERS
 * @memberof mempshis/lib/resource/constatns
 * @property {String[]} Common filters used for number fieldsd on resources
 **/
exports.NUMBER_FILTERS = ['lt','lte','gt','gte', 'exact', 'in', 'nin'];
/**
 * @readonly
 * @name STRING_FILTERS
 * @memberof mempshis/lib/resource/constatns
 * @property {String[]} Commonly used filters on string fields
 **/
exports.STRING_FILTERS = ['startswith', 'istartswith', 'endswith', 'iendswith', 'exact'];
