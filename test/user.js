'use strict';
var bookshelf = require('bookshelf')(require('./database'))
  , User
  , UserFriend

UserFriend = bookshelf.Model.extend({
    tableName: 'auth_user_friend',
    idAttribute:'auth_user_friend_id'
});

User = bookshelf.Model.extend({
    tableName: 'auth_user',
    idAttribute:'auth_user_id',
    friends: function(){
        return this.belongsToMany(User, 'auth_user_id')
                    .through(UserFriend,'auth_friend_id','auth_user_id');
    }
});


module.exports = User;
