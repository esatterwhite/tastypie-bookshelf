
exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('auth_user', function(table){
			table.engine('innodb');
			table.increments('auth_user_id');
			table.uuid('guid').unique().notNullable();
			table.boolean('isActive').notNullable();
			table.float('balance').notNullable();
			table.string('picture').notNullable();
			table.integer('age').notNullable();
			table.string('eyeColor').notNullable();
			table.enum('gender', ['male','female']).notNullable();
			table.string('name').notNullable();
			table.string('email').nullable();
			table.string('phone').notNullable();
			table.string('address').notNullable();
			table.text('about','longtext').notNullable();
			table.dateTime('registered').notNullable();
			table.string('greeting').notNullable();
			table.enum('favoriteFruit',['apple','strawberry','banana']).notNullable();
		})
	])
};

exports.down = function(knex, Promise) {
	return Promise.all([
		 knex.schema.dropTableIfExists('auth_user')
		,knex.truncate('knex_migrations')
	])
};
