'use strict';
var co = require('co')
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return co(function*(){
    yield knex('auth_user_friend').del()
    yield knex('auth_user').del()
    yield knex.batchInsert('auth_user',require('./users'),5000)
    yield knex.batchInsert('auth_user_friend',require('./friends'),5000)
  })
  .catch(function(err){
    console.error( err )
    process.exit(1)
  })
};
