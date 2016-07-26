/*jshint node:true, mocha: true, laxcomma: true, esnext:true*/
'strict mode';
var assert      = require('assert')
  , should      = require('should')
  , path        = require('path')
  , os          = require('os')
  , util        = require('util')
  , filters     = require('../lib/resource/filters')
  , date        = require('@fulfill/cage/date')
  , Movement    = require('@fulfill/cage').mySQL.models.Movement
  ;

describe('memphis', function(){

	before(function( done ){
		done();
	});

	after(function( done ){
		done();
	});


	describe('filters', function(){
		describe('gt', function(){
			it('should return data greater than the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.gt(qb, 'real_sold', 10 );
					qb.limit(10)
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.be.above( 10 );
							});
							done();
					  })
					  .catch(done);
				});
			});

			it('should not return data less than the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.gt(qb, 'real_sold', 10 );
					qb = qb.limit(10);
					qb
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.not.be.below( 10 );
							});
							done();
					  })
					  .catch(done);
				});
			});


		});
		describe('gte', function(){
			it('should return data greater than the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.gte(qb, 'real_sold', 10 );
					qb.limit(10)
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.be.aboveOrEqual( 10 );
							});
							done();
					  })
					  .catch(done);
				});
			});

			it('should not return data less than the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.gt(qb, 'real_sold', 10 );
					qb.limit(10)
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.not.be.belowOrEqual( 10 );
							});
							done();
					  })
					  .catch(done);
				});
			});

		});
		describe('lt', function(){
			it('should return data less than the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.lt(qb, 'real_sold', 10 );
					qb.limit(10)
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.be.below( 10 );
							});
							done();
					  })
					  .catch(done);
				});
			});

			it('should not return data greater than the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.lt(qb, 'real_sold', 10 );
					qb = qb.limit(10);
					qb
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.not.be.above( 10 );
							});
							done();
					  })
					  .catch(done);
				});
			});
		});
		describe('lte', function(){
			it('should return data less than or equal to the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.lte(qb, 'real_sold', 10 );
					qb.limit(10)
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.be.belowOrEqual( 10 );
							});
							done();
					  })
					  .catch(done);
				});
			});

			it('should not return data greater than or equal to the specified values', function( done ){
				Movement.collection().query(function(qb){
					qb = filters.lte(qb, 'real_sold', 10 );
					qb = qb.limit(10);
					qb
					  .then( function( data ){
							data.forEach(function( d ){
								d.real_sold.should.not.be.aboveOrEqual( 10 );
							});
							done();
					  })
					  .catch(done)
				});
			});
		});
		describe('isnull', function(){
			describe('is true', function(){
				it('should only return values where then value is null', function(done){
					Movement.collection().query(function( qb ){
						qb = filters.isnull(qb, 'issue', true );
						qb = qb.limit(10)
						  .then( function( data ){
						  	data.forEach( function( d ){
						  		should.equal(d.issue, null);
						  	});
						  	done();
						  });
					});
				});
			});

			describe('is false', function(){
				it('should only return value that are not null', function( done ){
					Movement.collection().query(function( qb ){
						qb = filters.isnull(qb, 'issue', false );
						qb = qb.limit(10)
						  .then( function( data ){
						  	data.forEach( function( d ){
						  		should.equal( d.issue );
						  	});
						  	done();
						  });
					});
				});
			});
		});

		describe('contains', function(){
			it('should match values any where in a string in a case sensitive manner', function( done ){
				Movement.collection().query(function( qb ){
					filters.contains(qb, 'url', 'ead' )
						   .limit(10)
						   .then( function( data ){
						   		data.forEach(function( item ){
						   			item.url.should.match(/ead/g);
						   			item.url.should.not.match(/EAD/g);
						   		});
						   		done();
						   })
						   .catch( done );
				});
			});
		});
		
		describe('icontains', function(){
			it('should match values any where in a string in a case insensitive manner', function( done ){
				Movement.collection().query(function( qb ){
					filters.contains(qb, 'url', 'ead' )
						   .limit(10)
						   .then( function( data ){
						   		data.forEach(function( item ){
						   			item.url.should.match(/ead/gi);
						   			item.url.should.match(/EAD/gi);
						   			item.url.should.not.match(/abacadaba/);
						   		});
						   		done();
						   })
						   .catch( done );
				});
			});
		});

		describe('startswith', function(){
			it('should match values at the beginning of a string in a case sensitive manner', function( done ){
				Movement.collection().query(function( qb ){
					filters.startswith(qb, 'url', 'thread' )
						   .limit(10)
						   .then( function( data ){
						   		data.forEach(function( item ){
						   			item.url.should.match(/^thread/);
						   			item.url.should.not.match(/^THREAD/);
						   		});
						   		done();
						   })
						   .catch( done );
				});
			});
			it('should not match values at the end of a string in a case sensitive manner', function( done ){
				Movement.collection().query(function( qb ){
					filters.startswith(qb, 'url', 'thread' )
						   .limit(10)
						   .then( function( data ){
						   		data.forEach(function( item ){
						   			item.url.should.not.match(/thread$/);
						   		});
						   		done()
						   })
						   .catch( done );
				});
			});
		});

		describe('istartswith', function(){
			it('should match values that startwith a string in a case sensitive manner', function( done ){
				Movement.collection().query(function( qb ){
					filters.istartswith(qb, 'url', 'THREAD' )
						   .limit(10)
						   .then( function( data ){
						   		data.forEach(function( item ){
						   			item.url.should.match(/^thread/);
						   		});
						   		done();
						   })
						   .catch( done );
				});
			});
		});
		describe('endswith', function(){
			it('should match values that endswith a string in a case sensitive manner', function( done ){
				Movement.collection().query(function( qb ){
					filters.endswith(qb, 'url', 'me' )
						   .limit(10)
						   .then( function( data ){
						   		assert.ok( data.length )
						   		data.forEach(function( item ){
						   			item.url.should.match(/me$/);
						   			item.url.should.not.match(/ME$/);
						   		});
						   		done();
						   })
						   .catch( done );
				});
			});
		});
		describe('iendswith', function(){
			it('should match values that endswith a string in a case insensitive manner', function( done ){
				Movement.collection().query(function( qb ){
					filters.iendswith(qb, 'url', 'me' )
						   .limit(10)
						   .then( function( data ){
						   		assert.ok( data.length )
						   		data.forEach(function( item ){
						   			item.url.should.match(/me$/i);
						   			item.url.should.match(/ME$/i);
						   		});
						   		done();
						   })
						   .catch( done );
				});
			});

		});
		describe('range', function(){
			it('should should match dates between a given date range',function(done){
				Movement.collection().query(function( qb ){
					var start, end;
					start = new Date(2015, 7, 1)
					end = new Date(2015, 8, 1)

					filters.range(qb, 'created_at', ['2015-08-01', '2015-09-01'] )
						   .limit(10)
						   .then( function( data ){
						   		assert.ok( data.length )
						   		data.forEach(function( item ){
						   			should.ok( date.within( item.created_at, start, end ))
						   		});
						   		done();
						   })
						   .catch( done );
				});
			});

			it('should reject an invalid date range', function(done){
				var start, end;
				start = new Date(2015, 7, 1)
				end = new Date(2015, 8, 1)
				assert.throws(function(){
					var qb = Movement.collection().query().clone()

					filters.range(qb, 'created_at', ['2015-09-01', '2015-08-01'] )
						   .limit(10)
						   .then( function( data ){
						   		done(new Error('Filter did not throw exception'));
						   })
						   .catch( done );
				})

				done();
			});
		});

		describe('ne', function(){
			it('should only include values not equal to a specified value', function( done ){
				Movement.collection().query(function( qb ){
					filters
						.ne( qb, 'id', 1)
						.limit( 10 )
						.then( function( data ){
							data.forEach( function( item ){
								item.id.should.be.a.number;
								item.id.should.not.equal( 1 );
							})
						});
						done();
				});
			});
		});

		describe('in', function(){
			it('should only include values not equal to a specified value', function( done ){
				var ids = [1,2,3,4,5,6,7,8];
				Movement.collection().query(function( qb ){
					filters
						.in( qb, 'id', ids )
						.limit( 10 )
						.then( function( data ){
							data.forEach( function( item ){
								ids.should.containEql( item.id );
							});
						});
						done();
				});
			});
		});
		describe('nin', function(){
			it('should exclude values not equal to a specified value', function( done ){
				var ids = [1,2,3,4,5,6,7,8];
				Movement.collection().query(function( qb ){
					filters
						.in( qb, 'id', ids )
						.limit( 10 )
						.then( function( data ){
							data.forEach( function( item ){
								ids.should.not.containEql( data.id );
							});
						});
						done();
				});
			});
		});
		describe('exact', function(){

		});
	});

});
