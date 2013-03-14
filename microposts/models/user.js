var domain = require('domain'),
	crypto = require('crypto'),
	util = require('util'),
	securityHelper = require('../helpers/securityHelper'),
	timeHelper = require('../helpers/datetimeHelper'),
	redis = require('./redis');

function UserModel() {
	this.redisModel = new redis.redisModel();

	this.redisModel.connect();
	this.redis = this.redisModel.client;
}

UserModel.prototype = {
	usersKeyPrefix: 'user:',
	userEmailsKey:'users',
	verifyUser: function(user) {
		var email = user && user.email || '';

		return email ? true : false;
	},
	getUserKey: function(email) {
		return this.usersKeyPrefix + email;
	},
	getUser: function(email, callback) {
		if(!email) {
			callback(new Error('the email can not be empty'));
			return;
		}

		this.redis.hmget(this.getUserKey(email), 'id', 'name', 'email', 'password','create_time', function(err, reply) {
			if(err) {
				callback(err);
			} else {
				var user = {
					id: reply[0],
					name: reply[1],
					email: reply[2],
					password: reply[3],
					createTime:reply[4]
				};
				var result = user.email ? user : null;
				callback(null, result);
			}
		});
	},

	addUser: function(user, callback) {
		var isVerfied = this.verifyUser(user);

		if(!isVerfied) {
			callback(new Error('the email can not be empty'));
			return;
		}

		var that = this;
		this.getUser(user.email, function(err, reply) {
			if(err) {
				callback(err);
				return;
			}
			//if the user has been registed!;
			if(reply) {
				callback('the user already has been registered!');
				return;
			}

			user.id = securityHelper.hash(user.email);
			user.password = securityHelper.hmac(user.password);
			user.createTime = timeHelper.now();
			user.updateTime = timeHelper.now();

			util.log('the user to be added is : ' + util.inspect(user, true, null));

			var multi = that.redis.multi();

			multi.sadd(that.userEmailsKey,user.email);
			multi.hmset(that.getUserKey(user.email), 'id', user.id, 'name', user.name, 'email', user.email, 'password', user.password, 'create_time', user.createTime, 'update_time', user.updateTime);

			multi.exec(function(err, results) {
				if(err){
					callback(err);
				}else{
					delete user.password;
					callback(null,user);
				}
			});
		});

	},

	editUser: function(user, callback) {
		var userKey = this.getUserKey(user.email);

		var isVerified = this.verifyUser(user);
		if(!isVerified) {
			callback(new Error('the email can not be empty'));
			return;
		}

		var that = this;

		user.password = securityHelper.hmac(user.password);
		user.updateTime = timeHelper.now();

		util.log('the user to be edited is : ' + util.inspect(user, true, null));

		this.redis.hmset(userKey, 'name', user.name, 'password', user.password,'update_time',user.updateTime, function(err, reply) {
			if(err){
				callback(err);
			}else{
				delete user.password;

				callback(null,user);
			}
		});
	},

	delUser: function(email, callback) {
		if(!email) {
			callback(new Error('the email can not be empty'));
			return;
		}

		this.redis.hdel(this.getUserKey(email), function(err, reply) {
			callback(err, reply);
		});
	 },
	getAllUsers:function(callback){
		this.redis.sort(this.userEmailsKey,'ALPHA',function(err,results){
			callback(err,results);
		});
	}
};

exports.UserModel = UserModel;