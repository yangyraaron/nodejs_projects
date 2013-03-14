var redis = require('./redis');

/*a user user1 follows anthoer user user2,the user2 email will be stored into
	a set which key is following:user1,and another set which key is followers:user2
	will store the user1 email.

	following:user1 user2
	follower:user2 user1

	*/

function FollowModel() {
	this.redisModel = new redis.redisModel();

	this.redisModel.connect();
	this.redis = this.redisModel.client;
}

FollowModel.prototype = {
	_userEmailsKey: 'users',
	_followingsKeyPrefix: 'following:',
	_followersKeyPrefix: 'followers:',
	_generateFollowingKey: function(email) {
		return this._followingsKeyPrefix + email;
	},
	_generateFollowersKey: function(email) {
		return this._followersKeyPrefix + email;
	},
	getUnfollowingUsers: function(email, callback) {
		var followingKey = this._generateFollowingKey(email);

		//todo: sort unfollowing users 
		this.redis.sdiff(this._userEmailsKey, followingKey, function(err, results) {
			callback(err, results);
		});
	},
	getFollowingUsers: function(email, callback) {
		var followingKey = this._generateFollowingKey(email);

		this.redis.sort(followingKey,'ALPHA', function(err, results) {
			callback(err, results);
		});
	},
	follow: function(userEmail, followingEmail, callback) {
		var followingKey = this._generateFollowingKey(userEmail),
			followersKey = this._generateFollowersKey(followingEmail);

		var multi = this.redis.multi();

		//add the following email into the following set of user
		multi.sadd(followingKey, followingEmail);
		//add the user email into the followers set of the following user the user following
		multi.sadd(followersKey, userEmail);

		multi.exec(function(err, replies) {
			callback(err, replies);
		});
	},
	unfollow:function(userEmail,followingEmail,callback){
		var followingKey = this._generateFollowingKey(userEmail),
			followersKey = this._generateFollowersKey(followingEmail);

		var multi = this.redis.multi();

		//remove the following email from the following set
		multi.srem(followingKey,followingEmail);
		//remove the user mail from the followers set
		multi.srem(followersKey,userEmail);

		multi.exec(function(err,replies){
			callback(err,replies);
		});
	},
	getFollowCount: function(email, callback) {
		var followingKey = this._generateFollowingKey(email),
			followersKey = this._generateFollowersKey(email),
			multi = this.redis.multi();

		multi.scard(followingKey);
		multi.scard(followersKey);

		multi.exec(function(err, result) {
			callback(err, result);
		});
	},
	getFollowers:function(email,callback){
		var followersKey = this._generateFollowersKey(email);

		this.redis.sort(followersKey,'ALPHA',function(err,emails){
			callback(err,emails);
		});
	}
};

exports.FollowModel = FollowModel;