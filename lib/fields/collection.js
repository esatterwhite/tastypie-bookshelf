/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true*/
'use strict';
/**
 * A Field for dealing with collection resources
 * @module tastypie-bookshelf/lib/fields/collection
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires tastypie
 * @requires async
 * @requires debug
 * @requires cage/class
 * @requires cage/object/get
 * @requires tastypie-bookshelf/lib/fields/related
 */

var tastypie     = require( 'tastypie' )
  , async        = require('async')
  , Class        = require('@fulfill/cage/class')
  , get          = require('@fulfill/cage/object').get
  , RelatedField = require('./related')
  , debug        = require('debug')('memphis:fields:collection')
  , CollectionField
  ;

const STRING   = 'string';
const FUNCTION = 'function';

function getattr( obj, attr ){

}

function fieldmap(){

}
/**
 * A field to handle collection resource
 * @constructor
 * @alias module:tastypie-bookshelf/lib/fields/collection
 * @extends module:tastypie-bookshelf/lib/fields/related
 * @param {String|Resoruce} [to] A Resource Class, or a string lookup path to the related resource class. Facilitates lazy Loading
 * @param {Object} [options]
   * @param {String|Resource} [options.to]
 * @example Resource.extend({
    fields:{
        company: {to:'/some/path/to/module.AResource', type:'collection', full: false, minimal: true }
    }
 });
 */
CollectionField = new Class({
    inherits: RelatedField
    ,options:{
        to: null
        ,minimal: false
        ,full: false
    }
    ,is_collection: true
    ,constructor: function( to, options ){
        this.parent('constructor', to, options );
    }

    /**
     * Function responsible preparing objects of serialization
     * @method module:tastypie-bookshelf/lib/fields#dehydrate
     * @param {Object} object The object to convert
     * @param {Function} callback A node style callback function which will be called when complete
     **/
    ,dehydrate: function( obj, cb ){
        var that = this
           , attribute = this.options.attribute
           , name = this.options.name
           , current
           ;

        if( !this.instance.options.apiname ){
            debug('setting related apiname - %s', this.resource.options.apiname );
            this.instance.setOptions({
                apiname: this.resource.options.apiname
            });
        }

        if( typeof attribute === STRING ){
            current = get( obj, attribute );
            if( current == null ){
                if( this.options.default ){
                    current = this.options.default;
                } else if( this.options.nullable ){
                    current = null;
                }
            }
            current = typeof current === FUNCTION ? current() : current;
        } else if( typeof attribute === FUNCTION ){
            current = attribute( name );
        }

        async.map(
            current
            , function( obj, callback ){
                if( that.options.full ){
                    debug("calling full_dehydrate")
                    that.instance.full_dehydrate(
                        obj[attribute] ? obj[attribute] : obj
                        , null
                        , callback
                    )
                } else if( that.options.minimal ){
                    that.to_minimal( obj[attribute] ? obj[attribute] : obj , callback )
                } else {
                    callback( null, obj && that.instance.to_uri( obj )  );
                }
            }
            , cb
        )
    }

});

debug('registering CollectionField as `collection`')
Object.defineProperty(tastypie.fields, 'collection',{
    get: function(){
        return CollectionField;
    }
});

module.exports = CollectionField;
