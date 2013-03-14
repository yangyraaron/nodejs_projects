var follow = require('../models/follow');

//update user's follow count


function updateUserFollow(user, callback) {
	var followModel = new follow.FollowModel();

	var email = user && user.email;
	
	if(!email) {
		callback(null);
		return;
	}

	followModel.getFollowCount(user.email, function(err, result) {
		if(err) {
			console.log('get follow count of user ' + user.email + 'error!');
			console.log('error: ' + err);
		} else {
			user.following = result[0];
			user.followers = result[1];
		}

		callback(err);
	});
}

exports.updateUserFollow = updateUserFollow;