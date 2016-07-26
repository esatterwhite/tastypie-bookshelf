
exports.up = function(knex, Promise) {
  return knex.schema.createTable('auth_user_friend', function( table ){
  	table.engine('innodb');
  	table.increments('id');
  	table.integer('auth_user_id').notNullable().unsigned();
  	table.integer('auth_friend_id').notNullable().unsigned();
  	table.foreign('auth_user_id').references('auth_user.auth_user_id');
  	table.foreign('auth_friend_id').references('auth_user.auth_user_id');
  })
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTableIfExists('auth_user_friend')
};
