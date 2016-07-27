/*jshint node:true, mocha: true, laxcomma: true, esnext:true*/
'strict mode';
var assert             = require('assert')
  , should             = require('should')
  , path               = require('path')
  , tastypie           = require('tastypie')
  , os                 = require('os')
  , hapi               = require('hapi')
  , util               = require('util')
  , filters            = require('../lib/resource/filters')
  , BookshelfResource  = require('../lib/resource')
  , User           	   = require('./user')
  ;

function within( now, start, end){
	return ( now > start && now < end);
}

describe('Bookshelf Resource', function(){
    var server, loader, api, Resource;
	before(function( done ){
		server = new hapi.Server();
		api = new tastypie.Api('test');
		server.connection({host:'localhost'});
		Resource = BookshelfResource.extend({
			options:{
				name:'user'
				,queryset: User
				,pk:'auth_user_id'
				,allowed:{
					list:{ get: true },
					detail:{ get: true }
				}
				,filtering:{
					id:['lt','gt','lte','gte', 'exact', 'in','nin']
					,name:['isnull', 'startswith','istartswith','endswith','iendswith','contains','icontains', 'ne']
					,email:['isnull', 'startswith','istartswith','endswith','iendswith','contains','icontains', 'ne']
					,eyes:['isnull', 'startswith','istartswith','endswith','iendswith','contains','icontains', 'ne']
					,registered:['range','year','month']
				}
			}
			,fields:{
				registered:{type:'date', nullable: false, blank:false}
				,name:{type:'char', nullable: false, blank: false}
				,email:{type:'char', nullable: true, blank: false}
				,eyes:{type:'char', nullable:false, blank:false, attribute:'eyeColor'}
			}
		});

		api.use( new Resource );
		server.register([api], done )
	});

	after(function( done ){
		done();
	});


	describe('http querysring filters', function(){
		describe('gt', function(){
			it('should return data greater than the specified values', function( done ){
			
				server.inject({
					url:'/test/user?id__gt=300&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){
					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );;

					out.data.forEach(function( item ){
						item.id.should.be.greaterThan(300 )
					});

					done();
				});
			});

			it('should not return data greater than the specified values', function( done ){
				server.inject({
					url:'/test/user?id__gt=100&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );

					out.data.forEach(function( item ){
						item.id.should.not.be.lessThan(100 )
					});

					done();
				});
			});


		});
		describe('gte', function(){
			it('should return data greater than the specified values', function( done ){
				server.inject({
					url:'/test/user?id__gte=300&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );;

					out.data.forEach(function( item ){
						item.id.should.be.greaterThanOrEqual(300 )
					});

					done();
				});
			});

			it('should not return data less than the specified values', function( done ){
				server.inject({
					url:'/test/user?id__lte=200&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );;

					out.data.forEach(function( item ){
						item.id.should.be.lessThanOrEqual(200 )
					});

					done();
				});
			});

		});
		describe('lt', function(){
			it('should return data less than the specified values', function( done ){
				server.inject({
					url:'/test/user?id__lt=300&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );;

					out.data.forEach(function( item ){
						item.id.should.be.lessThan(300 )
					});

					done();
				});
			});

			it('should not return data greater than the specified values', function(  ){
			});
		});
		describe('lte', function(){
			it('should return data less than or equal to the specified values', function( done ){
				server.inject({
					url:'/test/user?id__lte=250&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );;

					out.data.forEach(function( item ){
						item.id.should.be.lessThanOrEqual(250 )
					});

					done();
				});
			});

			it('should not return data greater than or equal to the specified values', function( done ){
				server.inject({
					url:'/test/user?id__lte=250&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );;

					out.data.forEach(function( item ){
						item.id.should.not.be.greaterThan(250 )
					});

					done();
				});
			});
		});
		describe('isnull', function(){
			describe('is true', function(){
				it('should only return values where then value is null', function(done){
				
					server.inject({
						url:'/test/user?email__isnull=true&limit=10',
						method:'get',
						headers:{
							"Accept":"application/json"
						}
					},
					function( response ){

						assert.equal( typeof response.result, 'string' )
						var out = JSON.parse( response.result );
						
						out.data.forEach(function( item ){
							should.equal( item.email, null )
						});

						done();
					});
				});
			});
			describe('is false', function(){
				it('should only return value that are not null', function( done ){
					server.inject({
						url:'/test/user?email__isnull=false&limit=10',
						method:'get',
						headers:{
							"Accept":"application/json"
						}
					},
					function( response ){

						assert.equal( typeof response.result, 'string' )
						var out = JSON.parse( response.result );
						out.data.forEach(function( item ){
							assert.notEqual( item.email, null )
						});

						done();
					});
				
				});
			});
		});

		describe('contains', function(){
			it('should match values any where in a string in a case sensitive manner', function( done ){
				server.inject({
					url:'/test/user?name__contains=ri&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );

					out.data.forEach(function( item ){
						item.name.should.match(/ri/g)
						item.name.should.not.match(/RI/g)
					});

					done();
				});
				
			});
		});
		
		describe('icontains', function(){
			it('should match values any where in a string in a case insensitive manner', function( done ){
				server.inject({
					url:'/test/user?name__icontains=ri&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );

					out.data.forEach(function( item ){
						item.name.should.match(/ri/g)
					});

					done();
				});
				
			});
		});

		describe('startswith', function(){
			it('should match values at the beginning of a string in a case sensitive manner', function( done ){
				server.inject({
					url:'/test/user?name__startswith=Bi&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){
					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						item.name.should.match(/^Bi/)
						item.name.should.not.match(/^bi/)
					});

					done();
				});
				
			});
			it('should not match values at the end of a string in a case sensitive manner', function( done ){
				server.inject({
					url:'/test/user?name__startswith=Bi&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						item.name.should.not.match(/Bi$/)
						item.name.should.not.match(/bi$/)
					});

					done();
				});
				
			});
		});

		describe('istartswith', function(){
			it('should match values that startwith a string in a case sensitive manner', function( done ){
				server.inject({
					url:'/test/user?name__istartswith=Bi&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						item.name.should.match(/^Bi/i)
						item.name.should.match(/^bi/i)
					});

					done();
				});
				
			});
		});
		describe('endswith', function(){
			it('should match values that endswith a string in a case sensitive manner', function( done ){
				server.inject({
					url:'/test/user?name__endswith=ll&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						item.name.should.match(/ll$/)
						item.name.should.not.match(/LL$/)
					});

					done();
				});
			});
		});
		describe('iendswith', function(){
			it('should match values that endswith a string in a case insensitive manner', function( done ){
				server.inject({
					url:'/test/user?name__iendswith=ll&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						item.name.should.match(/ll$/i)
						item.name.should.match(/LL$/i)
					});

					done();
				});
			});

		});
		describe('range', function(){
			it('should should match dates between a given date range',function( done ){
				server.inject({
					url:'/test/user?registered__range=2015-04-01,2015-05-01&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){
					var start = new Date('2015-03-28');
					var end = new Date('2015-05-01')
					assert.equal( typeof response.result, 'string' )
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						assert.ok( within( item.registered,start,end) );	
					});

					done();
				});
			});

			it('should reject an invalid date range', function( done ){
				server.inject({
					url:'/test/user?registered__range=2015-05-01,2015-04-01&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){
					assert.equal(response.statusCode,422);
					done();
				});
			});
		});

		describe('ne', function(){
			it('should only include values not equal to a specified value', function( done ){
				server.inject({
					url:'/test/user?eyes__ne=blue&limit=10',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){

					assert.equal( typeof response.result, 'string' );
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						item.eyes.should.not.equal('blue');	
					});

					done();
				});
			});
		});

		describe('in', function(){
			it('should only include values not equal to a specified value', function( done ){
				var ids = [1,2,3]
				server.inject({
					url:'/test/user?id__in=1,2,3',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){
					assert.equal( typeof response.result, 'string' );
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						ids.should.containEql( item.id );
					});

					done();
				});
			});
		});
		describe('nin', function(){
			it('should exclude values not equal to a specified value', function( done ){
				server.inject({
					url:'/test/user?id__nin=4,5,6',
					method:'get',
					headers:{
						"Accept":"application/json"
					}
				},
				function( response ){
					assert.equal( typeof response.result, 'string' );
					var out = JSON.parse( response.result );
					assert(out.data.length,'Should return data');
					out.data.forEach(function( item ){
						[4,5,6].should.not.containEql( item.id );
					});
					done();
				});
			});
		});
		describe('exact', function(){

		});
	});

});
