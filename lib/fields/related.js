/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * A Field for dealing with related resources
 * @module tastypie-mongoose/lib/fields/related
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires tastypie
 */

var tastypie = require( 'tastypie' )
  , ApiField = require('tastypie/lib/fields/api')
  , Class = require('tastypie/lib/class')
  , debug    = require('debug')('tastypie-bookshelf:fields:related')
  , RelatedField
  ;

/**
 * A field to handle related resource
 * @constructor
 * @alias module:tastypie-mongoose/lib/fields/related
 * @extends module:tastypie/fields/api
 * @param {String|Resoruce} [to] A Resource Class, or a string lookup path to the related resource class. Facilitates lazy Loading
 * @param {Object} [options]
   * @param {String|Resource} [options.to]
 * @example Resource.extend({
    fields:{
        company: {to:'/some/path/to/module.AResource', type:'knex', full: false, minimal: true }
    }
 });
 */
RelatedField = new Class({
    inherits: ApiField
    ,options:{
        to: null
        ,minimal: false
        ,full: false
    }
    ,is_related: true
    ,constructor: function( to, options ){

        // fields can be defined as an options object
        // check for it
        if( !options ){
            options = to;
            to = options.to;
        }

        this.parent('constructor', options);
        this.options.to = to;
        this.instance = new this.cls();
        this.options.to = null;
    }

    ,type: function(){
        return this.instance.options.name || 'related';
    }

    /**
     * Function responsible preparing objects of serialization
     * @method module:tastypie-mongoose/lib/fields#dehydrate
     * @param {Object} object The object to convert
     * @param {Function} callback A node style callback function which will be called when complete
     **/
    ,dehydrate: function( obj,cb ){
        if( !this.instance.options.apiname ){
            debug('setting related apiname - %s', this.resource.options.apiname );
            this.instance.setOptions({
                apiname: this.resource.options.apiname
            });
        }

        // calls _dehydrate
        // avoids creating a closure on every call
        this.parent('dehydrate', obj, this._dehydrate.bind( this, obj, cb ) );
    }

    ,_dehydrate: function( obj, cb, err, value ){
        var attribute = this.options.name;
        if( err || !value ){
            return cb && cb( err, null );
        }

        if( this.options.full ){
            this.instance.full_dehydrate( obj[attribute] ? obj[attribute] : value , null, cb );
        } else if( this.options.minimal ){
            this.to_minimal( obj[attribute] ? obj[attribute] : value , cb );
        } else{
            cb( err, value && this.instance.to_uri( value )  );
        }
        
    }
    /**
     * converts a full object in to a minimal representation
     * @method module:tastypie/lib/field/related#to_minimal
     * @param {Object} obj A template object instance to introspect
     * @return {String} DESCRIPTION
     **/
    ,to_minimal: function( obj, cb ){
        var label = this.instance.options.labelField || 'display'
          , related_field
          ;

        related_field = this.instance.fields[label];
        related_field.dehydrate( obj, this._to_minimal.bind(this, obj, related_field, label, cb ));
    }

    ,_to_minimal: function( obj, related_field, label, cb, err, value ){
        var out = {};
        out.uri =  this.instance.to_uri( obj );
        out[this.instance.options.pk] = this.instance.pk( obj );
        out[  label ] = value;
        label = related_field = null;
        cb( null, out );
    }

    ,db_prop: function( table ){
        let attr
          , model = this.instance.options.queryset.model.prototype
          ;

        if( table ){
            attr = table + '.' + this.options.attribute;
        } else {
            attr  = model.tableName + '.' + model.idAttribute || this.options.attribute || this.options.name;
        }
        return attr;
    }
});

Object.defineProperties(RelatedField.prototype,{
    cls:{
        enumerable:false
        ,writeable: false
        ,get: function(){
            var bits  // require path string ( /path/to/module.Class )
              , mod   // the required module
              , cls   // the related class object
              , _to = this.options.to
              , lastBit
              , dotPosition
              , hasClass
              , module_bits
              ;

            if( typeof _to === 'string' ){
                bits = _to.split('/');
                lastBit = bits[bits.length-1];
                dotPosition = lastBit.indexOf('.');
                hasCls =  dotPosition !== -1;

                if( hasCls ){
                    module_bits = lastBit.split('.');
                    bits[ bits.length-1 ] = module_bits[0];
                    cls = module_bits[1];

                    _to = path.resolve( bits.join('/') );


                }
                mod = require( _to );
                cls = mod[ cls ];
                this.options.to = cls;
            }

            return this.options.to;
        }
    }
});

debug('registering Related field as `knex`');
Object.defineProperty(tastypie.fields, 'knex',{
    get: function(){
        return RelatedField;
    }
});

module.exports = RelatedField;
