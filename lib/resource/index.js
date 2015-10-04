/*jshint laxcomma: true, smarttabs: true, node:true, mocha: true, esnext: true*/
'use strict';
/**
 * A tastypie resource type for the bookshelf orm
 * @module tastypie-bookshelf/lib/resource/bookshelf
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires async
 * @requires co
 * @requires util
 * @requires joi
 * @requires tastypie
 * @requires tastypie-jsonschema
 * @requires debug
 * @requires boom
 * @requires cage
 * @requires cage/class
 * @requires cage/lang/isNumber
 * @requires cage/lang/toArray
 */

var tastypie    = require('tastypie')
  , joi         = require('joi')
  , util        = require('util')
  , async       = require('async')
  , Boom        = require('boom')
  , merge       = require('mout/object/merge')
  , ApiField    = require('tastypie/lib/fields/api')
  , Class       = require('tastypie/lib/class')
  , typecast    = require('mout/string/typecast')
  , interpolate = require('mout/string/interpolate')
  , isNumber    = require('mout/lang/isNumber')
  , toArray     = require('mout/lang/toArray')
  , values      = require('mout/object/values')
  , validators  = require('tastypie/lib/resource/validator')
  , debug       = require('debug')('tastypie-bookshelf:resource')
  , constants   = require('./constants')
  , urljoin     = tastypie.urljoin
  , Resource    = tastypie.Resource
  , filterterms = require('./filters')
  , orderExp    = /^(\-)?([\w]+)/
  , BookshelfResource
  ;


const SEP          = '__';
const EMPTY_OBJECT = {};
const EMPTY_ARRAY  = [];
const ALLOW_ALL    = [constants.ALL, constants.ALL_WITH_RELATIONS];

ApiField.prototype.db_prop = function( table ){
  return ( table || this.resource.options.queryset.model.prototype.tableName ) + '.' + this.options.attribute;
};

/**
 * Bookshelf model resource type
 * @constructor
 * @alias module:tastypie-bookshelf/lib/resource/bookshelf
 * @extends module:tastypie/lib/resource
 * @param {Object} [options]
 * @param {Array} [!options.prefetch=null] an array of related objects to prefetch before the unerlying query is executed
 */
BookshelfResource = Resource.extend({
    options:{
        max: 1000
      , paginator: tastypie.Paginator.Remote
      , prefetch: null
    }
   
    ,constructor: function( options ){
        this.parent('constructor', options );
    }
    , base_urls: function base_urls( ){
        return [{
            path: interpolate( decodeURIComponent( urljoin(  '{{apiname}}', '{{name}}', 'schema' ) ), this.options ).replace( /\/\//g, '/' )
          , handler: this.get_schema.bind( this )
          , config:{ tags:['api'] }
          , method:'get'
          , name: 'schema'
        }
        , {
            path: interpolate( decodeURIComponent( urljoin(  '{{apiname}}', '{{name}}', '{pk}' ) ), this.options ).replace( /\/\//g, '/' )
          , handler: this.dispatch_detail.bind( this )
          , config:{ tags:['api'], validate:{params:{pk:joi.number().required()}}}
          , method:Object.keys( this.options.allowed.detail )
          , name: 'detail'
        }
        , {
            path: interpolate( decodeURIComponent( urljoin(  '{{apiname}}', '{{name}}' ) ), this.options ).replace( /\/\//g, '/' )
          , handler: this.dispatch_list.bind( this )
          , config:{ tags:['api'], validate:{ query: validators.query }}
          , method: Object.keys( this.options.allowed.list )
          , name: 'list'
        }];
    }
    ,get_list: function( bundle, opts ){
        var that = this;
        co( function*(){
            let results = yield that.get_objects( bundle, opts )
              , Paginator = that.options.paginator
              , to_serialize
              ;


            to_serialize = new Paginator({
                limit:bundle.req.query.limit
                ,req:bundle.req
                ,res:bundle.res
                ,collectionName:that.options.collection
                ,objects: results.objects
                ,count: results.count
                ,offset: bundle.req.query.offset || 0
            }).page();

            return to_serialize;
        })
        .then( function( response ){
            let collection = that.options.collection;
            response.meta.uri  = urljoin('/', that.options.apiname, that.options.name );
            async.map( 
                response[collection]
                , that.__remap.bind(that, bundle )
                , function(err, results){
                    response[ collection ] = results;
                    bundle.data = response;
                    return that.respond( bundle );
                }
            );
        })
        .catch( function( err ){
            // unhandled error
            // return to client
            err.req = bundle.req;
            err.res = bundle.res;
            if( typeof err.code === 'string' ){
              err.name = err.code;
              err.code = 500;
            }
            that.exception( err );
        });

    }
    ,__remap: function( bundle, item, done ){
        this.full_dehydrate( item, bundle, done );   
    }
    ,inject: function inject( query, opts ){
        return query;
    }
    /**
     * Method used to restrict the number of results returned from the unerlying query
     * @method module:tastypie-bookshelf/lib/resource/bookshelfce#limit
     * @param {Collection} queryset bookshelf collection query 
     * @param {Buneld} bundle tastypie bundle instance
     * @returns {Number} The number of results to return
     **/
    , limit: function limit( queryset , bundle ){
        var qs = bundle.req.query
          , lmt
          ;

        qs.limit = qs.hasOwnProperty( 'limit' ) ? parseInt( qs.limit, 10 ) : qs.limit;
        lmt = isNumber( qs.limit ) ? qs.limit ? qs.limit : this.options.max : this.options.limit ? this.options.limit : 25;
        lmt = Math.min( lmt, this.options.max );
        return lmt;
    }
    /**
     * Method used to apply sorting to the underlying query.
     * CHecks for an orderby property which can be an single string or an array of string
     * @method module:tastypie-bookshelf/lib/resource/bookshelf#sort
     * @param {Query} queryselt a knex query instance
     * @param {Object} querystring An object representing the querysting from the incoming requiest
       * @param {String|String[]} [orderby] The field to order the query by. A field nane prefiex with a negetive sign (`-`)
       will be sorted in a descending order 
     * @return {Query} A knex query object with the approriate ordering applied
     **/
    , sort: function sort( queryset, querystring ){
        var allowed = this.options.ordering || []
          , that = this
          , ordering
          ;


        ordering = toArray( querystring.orderby );
        
        for(let idx=0, len=ordering.length; idx<len; idx++ ){
            let bits // pats of the ordering params [dir, name]
              , dir // sort direction asc / desc
              ;

            bits = orderExp.exec( ordering[idx] );
            if(!bits){
                return;
            } else if( ~~bits[2] === 1 || allowed.indexOf( bits[2] ) === -1 ){
                throw Boom.create(400, 'Invalid sort parameter ' + bits[2] );
            }

            dir = bits[1] ? 'desc' : 'asc';
            debug( 'ordering %s - %s', bits[2], dir);
            queryset = queryset.orderBy( that.fields[ bits[2] ].options.attribute, dir );
        }
        ordering = allowed = null;
        return queryset;
    }

    /**
     * Applyes the number of records to off set the underlying query by
     * @method module:tastypie-bookshelf/lib/resource/bookshelf#offset
     * @param {Query} queryset A knex query object
     * @param {Bundle} bundle A tastypie Bundle Object
     * @return {Query} The modifield query object with an offset applied
     **/
    , offset: function offset( queryset, bundle ){
        return queryset.offset( ~~( bundle.req.query.offset || 0 ) );
    }


    /**
     * Method used to retrieve a primay key from an object.
     * If given a primitive object ( `number`, `string` ) it is assumed to be the pk, and returned
     * Searches through the bundle and deydrayed object for the pk field 
     * @method module:tastypie-bookshelf/lib/resource/bookshelf#pk
     * @param {Object} orig The original raw object or value being dehydrated
     * @param {Bundle} bundle The tastypie bundle being dehydrated
     * @param {Object} result a dehydrated object about to be serialized
     * @return {Mixed} The primay key of the current object
     **/
    ,pk: function pk( orig, bundle, result ){
        switch(typeof orig ){
          case 'string':
          case 'number':
          case 'boolean':
            return orig;
        }
        return this.parent('pk', orig, bundle, result );
    }
    /**
     * creates a resource uri for a specific object
     * @method module:tastypie/lib/resource#to_uri
     * @param {Object} obj A data object to check through
     * @param {Bundle} bundle The bundle for the current quest
     * @param {Object} result 
     * @return {String} A valid URI pointing to the passed in obj
     **/
    ,to_uri: function to_uri( obj, bundle, result ){
        return  this.options.apiname + '/' + this.options.name + '/' + this.pk( obj, bundle, result );
    }

    /**
     * Internal method callget by get_list that is used to retireve a list
     * of object for serialization
     * @method module:tastypie-bookshelf/lib/resource/bookshelf#get_objects
     * @param {module:tastypie/lib/resource~Bundle} bundle A tastypie bundle instance
     * @param {Object} opts Additional query paramters to pass allong 
     * @return {Promise} 
     **/
    ,get_objects: function get_objects( bundle, opts ){
        var that = this;

        return new Promise(function( resolve, reject ){
            let collection    // A model collection filtered with the requested query 
              , count_promise  // A promise to resolve a count of the size  filtered datat set
              , error         // An error to surface from the internal query so we can bail early
              ;

            // we need to get a new collection with the filters sub query applied toit
            // with out modifying the original.
            // ... this is surprisingly difficutlt to do.

            // this is a syncronous operation in knex even though it
            // asks for a callback.

          collection = that.options.queryset.query(function( qb ){
              // this property is to keep  track of which tables are joined
              // because Knex doesn't and will die if you call join on the same table more
              // than once...
              qb._joined = {};
              try{
                that.buildFilters( merge( bundle.req.query, opts || EMPTY_OBJECT ), qb );
              } catch( e ){
                error = e;
              }
          });

          // this is here because if an error occurs in the callback 
          // above, the query below still executes even though an
          // error is returned to the client. Which is needless.
          // just return 
          if( error ){
            return reject( error );
          }


          // we want a count before limis and sorting is applied.
          // so we have to clone the query so the count doesn't
          // get applied to the collection query above... Thanks.
          count_promise = collection.query().clone().count('*');
          // we want a collection object so we can
          // use the withRelated clause and not have to hard code joins.
          collection
            .query(function(qb){
                  that.inject( qb,  merge( bundle.req.query, opts || EMPTY_OBJECT ) );
                  debug('apply sorting');
                  qb = that.sort( qb, bundle.req.query );
                  debug('apply offsets');
                  qb = that.offset( qb , bundle );
                  debug('apply limits');
                  qb.limit( that.limit( qb, bundle ) );
            })
            .fetch( that.options.prefetch ? {withRelated:that.options.prefetch} : null)
            .then( function( objects ){
                count_promise.then(function( val ){
                  resolve( {count:values( val[0])[0], objects:objects.toJSON() });

                });
            }).catch(function( err ){
                err.res = bundle.res;
                err.req = bundle.req;
                err.name = err.code;
                delete err.code;
                debug('forwarding err', err.stack );
                that.emit('error', err );
            });
        });
    }

    /**
     * Internal method used by tastypie to retrieve individual objects by id
     * @method module:tastypie-bookshelf/lib/resource/bookshelf#get_object
     * @param {module:tastypie/lib/resource~Bundle} bundle A tastypie bundle instance
     * @param {Function} callback Node style callback function to be called when the object has been retrieved
     **/
    ,get_object: function get_object( bundle, cb ){
        let Model = this.options.queryset.model
          , params = {}
          ;

        params[ this.options.pk ]  = bundle.req.params.pk;
        new Model( params )
            .fetch( this.options.prefetch ? {withRelated:this.options.prefetch} : null)
            .then(function( obj ){
                cb( null, obj && obj.toJSON() );
            })
            .catch( cb );
    }

    // This needs a little love.
    // TODO: There is a little too much introspection into the filter query array
    // We can just run over the un modified version without having to do that.
    // Does that make it better / more efficient? maybe...
    ,buildFilters: function buildFilters( qs, querybuilder ){
        var remaining // the remaining compiled filter set
          , filters   // the allowable filter types on this resource
          , fields    // reference to the fields object on this resource
          , bits      // array of filter expression bits
          , filter    // the filter function we need to apply
          , fieldname // the the name of the field to filter by
          , num_bits  // 
          , value
          , field     // current field instance
          , attr
          , filtertype
          ;

        filters    = this.options.filtering || EMPTY_OBJECT;
        fields     = this.fields;
        remaining  = [];

        for( let key in qs ){
            value      = qs[ key ];
            bits       = key.split( SEP );
            fieldname  = bits.shift();
            num_bits   = bits.length -1;
            filtertype = 'exact';  // accounts for no filter ( field=value )

            // known casses we check for before proceeding 
            if(!fields[ fieldname ] ){
                continue;
            } 

            // if bits, there is filter or a relation
            if( bits.length ){ 

              // check for filters
              if( filterterms.hasOwnProperty(  bits[ num_bits ] ) ) {
                filtertype = bits.pop();
              } 
            }
            
            // if we still have a query after pull off the field and the filter
            // we have a related lookup to deal with; 
            if( bits.length ){

              // the field name is a relation we need to travers / join
              bits.unshift( fieldname );
              attr     = this.buildJoins( querybuilder, bits, filtertype );    
              filter    = filterterms[filtertype]; 
            } else {
              // if we are not traersion a rrelation ship we can just the the field 
              // give use the column to query against. 
              field = fields[ fieldname ];
              this.checkFiltering( fieldname, filtertype, bits );
              filter    = filterterms[ filtertype ];

              // if the field is a relational field, we can use the attribute as it should be a unique column
              // other wise, we should get a tablespaced column name `table`.`column` becuase knex won't
              // figure it out. and book shelk is dumb
              attr      = field.is_related ? field.options.attribute : field.db_prop() || fieldname;
              fieldname = bits.unshift( attr ) && bits.join( SEP );
            }

            field = null;
            // if it isn't a filter... move on!
            filter && filter( querybuilder, attr, typecast( value ));
          } 
          return remaining;
    }

    /**
     * For related look ups, A join must be created. Book shelf doesn't do this
     * So we have to create the join for each relation in the query
     * so we can correctly filter on this correct fields 
     * @method module:tastypie-bookshelf/lib/resource/bookshelf#buildJoins
     * @param {QueryBuilder} querybuilder a query builder instance to apply filters to
     * @param {String[]} bits the remaining parts of the filter query for the request 
     * @param {String} filter a filter type to checkFilters
     * @return {module:tastypie/lib/fields/api} A field instance representing the terminal field of the query
     **/
    , buildJoins:function( qb, bits, filter ){
        var next
          , is_related
          , related
          , current
          , current_model
          , related_model
          ;

      current = this;

      // end condition for relatied field chain
      if( !( bits && bits.length ) ){
        return;
      }

      next          = bits.shift();
      is_related    = current.fields[ next ].is_related;
      related       = current.fields[ next ].instance;
      current_model = current.options.queryset.model.prototype;
      related_model = related && related.options.queryset.model.prototype;

      if( is_related && !qb._joined[ related_model.tableName ]){
          qb.innerJoin(
            // next.table
            related_model.tableName

            // current.fk
            ,util.format('%s.%s', current_model.tableName, current.fields[ next ].options.attribute )

            // next.tableName + next.pk
            ,util.format('%s.%s', related_model.tableName, related_model.idAttribute )
          );
          qb._joined[ related_model.tableName ] = true;
      }
      // clean up
      is_related= related_model  = null;
      this.checkFiltering( next, filter, bits);
      return related && related.buildJoins( qb, bits, filter ) || current.fields[ next ].db_prop( current_model.tableName );
    }

    /**
     * A filter type against a given field to validate the incomming query
     * @method tastypie-bookshelf/lib/resource/bookshelf#checkFiltering
     * @private
     * @param {String} field the field to validate
     * @param {String} filter The terminal filter type
     * @return {String[]} query an array containing the remaining parts of the filter query for the field 
     * @example resource.checkFiltering('foo', 'gt', ['baz','bar'] )
     **/
    , checkFiltering: function( fieldname, filtername, query_array ){
        var filters = this.options.filtering
          , query_array = query_array || EMPTY_ARRAY
          ;

        if(!filters[ fieldname ]){
            // attempt to use a filter type we don't allow
            // TODO: Custom Exception class w/ error type / code to relay to client
            throw Boom.create(422,'filtering on ' + fieldname + ' is not allowed');
        }

        // if not a catchall
        if( ALLOW_ALL.indexOf( filters[fieldname] ) === -1 ){

          // must be explicitly defined
          if( ( filters[ fieldname ] || EMPTY_ARRAY).indexOf( filtername ) === -1 ){
              throw Boom.create(422, filtername + ' filtering is not allowed on field ' + fieldname );
          }
        }

        // 2+ indicates we have a pending relation
        if( query_array.length >=2 ){
          if( !this.fields[fieldname].is_related || filters[fieldname] !== constants.ALL_WITH_RELATIONS ){
            throw Boom.create(422, fieldname, ' does not support related look ups');
          }
        }
    }

    // TODO: implament the functions.
    // Resources return a 501 NOT IMPLEMENTED OR A 405 by default

    // , create_object: function(){}
    // , update_object: function(){}
    // , delete_object: function(){}
    // , replace_object: function(){}
});


/**
 * Creates a new class which inherits from the Bookshelf resource
 * @static
 * @function extend
 * @memberof module:tastypie-bookshelf/lib/resource/bookshelf
 * @param {Object} proto The object to use as the new resource prototype
 * @return {BookshelfResource} A new class inheriting from the Bookshelf resource
 **/
BookshelfResource.extend = function( proto ){
    proto.inherits = BookshelfResource;
    return new Class( proto );
};

module.exports = BookshelfResource;
