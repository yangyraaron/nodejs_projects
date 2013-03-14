/*post constructor:
	fields: id,content,type,state,createtime,creator
	type 0:text 1:dynamic message
*/

var redis = require('./redis'),
	datetimeHelper = require('../helpers/datetimeHelper'),
	follow = require('./follow'),
	securityHelper = require('../helpers/securityHelper');

function PostModel() {
	this.redisModel = new redis.redisModel();

	this.redisModel.connect();
	this.redis = this.redisModel.client;
}

PostModel.prototype = {
	_userPostsKeyFormat: 'user:{email}:posts',
	_userSelfPostsKeyFormat:'user:{email}:self:posts',
	_getPostId: function() {
		return datetimeHelper.nowTime();
	},
	_generateUserPostsKey:function(email){
		return this._userPostsKeyFormat.replace('{email}',email);
	},
	_generateUserSelfPostsKey:function(email){
		return this._userSelfPostsKeyFormat.replace('{email}',email);
	},
	addPost: function(post, callback) {
		post.id = this._getPostId();
		post.createTime = datetimeHelper.now();
		post.type = post.type || 0;

		var userPostsKey = this._generateUserPostsKey(post.creator),
			userSelfPostsKey = this._generateUserSelfPostsKey(post.creator),
			postValue = securityHelper.toJsonString(post);

		var multi = this.redis.multi();

		multi.zadd(userPostsKey,post.id,postValue);
		multi.zadd(userSelfPostsKey,post.id,postValue);

		var followModel = new follow.FollowModel(),
			that = this;

		followModel.getFollowers(post.creator,function(err,emails){
			console.log('follower count: '+emails.length);
			if(emails && emails.length){
				emails.forEach(function(email){
					var followerPostKey = that._generateUserPostsKey(email);

					multi.zadd(followerPostKey,post.id,postValue);
				});
			}

			multi.exec(function(err,results){
				callback(err,results);
			});
		});

	},
	delPost:function(post,callback){
		var userPostsKey = this._generateUserPostsKey(post.creator),
			userSelfPostsKey = this._generateUserSelfPostsKey(post.creator);

		var multi = this.redis.multi();

		multi.zremrangebyrank(userPostsKey,post.id);
		multi.zremrangebyrank(userSelfPostsKey,post.id);

		multi.exec(function(err,results){
			callback(err,callback);
		});
	},
	getUserSelfPosts:function(email,lastPostId,callback){
		var userSelfPostsKey = this._generateUserSelfPostsKey(email);

		var bgScore = lastPostId || 1;

		this.redis.zrevrangebyscore(userSelfPostsKey,'+inf',bgScore,function(err,result){
			if(err){
				callback(err,null);
			}else{
				var posts = [];
				result.forEach(function(r){
					var post = securityHelper.toJson(r);

					posts.push(post);
				});

				callback(null,posts);
			}
		});
	},
	getUserPosts:function(email,lastPostId,callback){
		var userPostsKey = this._generateUserPostsKey(email);

		var bgScore = lastPostId || 1;

		this.redis.zrevrangebyscore(userPostsKey,'+inf',bgScore,function(err,result){
			if(err){
				callback(err,null);
			}else{
				var posts = [];
				result.forEach(function(r){
					var post = securityHelper.toJson(r);

					posts.push(post);
				});

				callback(null,posts);
			}
		});
	}

};

exports.PostModel = PostModel;