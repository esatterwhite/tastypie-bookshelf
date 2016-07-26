'use strict';
var path = require("path")
function engine( ){
	let db;

	switch( process.env.DB ){
		case 'mysql':
		case 'sqlite':
			db = process.env.DB;
			break;

		case 'postgresql':
			db = 'pg';
			break;
		default:
			db = 'sqlite';
	}

	return db;
}

module.exports = {
	database:{
		client: engine()
		,connection:{
			filename:'test.sqlite'
		}
	}

	,seeds:{
		directory:path.join(__dirname, '..','test', 'seeds')	
	}
	,migrations:{
		directory:path.join(__dirname, '..','test', 'migrations')
	}
}
