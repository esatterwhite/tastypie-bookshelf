'use strict';

var knex = require('knex')
  , conf = require('keef')
  , db_config = conf.get('database') 
  , debug = require('debug')('tastypie-bookshelf:test:database')

const connection = knex(db_config, conf.get('migrations'))

module.exports = connection;
