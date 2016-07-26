#!/usr/bin/env node
/*jshint laxcomma: true, smarttabs: true, exnext: true*/
'use strict';
/**
 * sets up the database before tests are run
 * @module bootstrap.js
 * @author 
 * @since 0.0.1
 * @requires moduleA
 * @requires moduleB
 * @requires moduleC
 */

const conf = require('keef')
   , db = require('../test/database')

console.log( conf.get('migrations'))

db
	.migrate
	.latest(conf.get('migrations'))
	.then( function( ){
		db
			.seed
			.run( conf.get('seeds') )
			.then(function(){
				process.exit(0)
			})
			.catch(function(err){
				console.error( err )
				process.exit(1)
			})

	})
	.catch((err)=>{
		console.error(err)
		process.exit(1)
	})
