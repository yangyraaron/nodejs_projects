var render = require('../models/render'),
	follow = require('../models/follow'),
	userHelper = require('../helpers/userHelper'),
	homeController = require('./homeController');

function create(httpContext) {
	var req = httpContext.req,
		res = httpContext.res,
		user = httpContext.user;

	var email = req.query.email,
		followModel = new follow.FollowModel();

	console.log('following email: ' + email);

	followModel.follow(user.email, email, function(err, result) {
		if(err) throw new Error(err);

		userHelper.updateUserFollow(user, function(err) {
			var renderModel = new render.RenderModel(user);

			res.redirect('/users');
		});
	});

}

function destroy(httpContext) {
	var req = httpContext.req,
		res = httpContext.res,
		user = httpContext.user;

	var email = req.query.email,
		followModel = new follow.FollowModel();

	console.log('unfollowing email: ' + email);

	followModel.unfollow(user.email, email, function(err, result) {
		if(err) throw new Error(err);

		userHelper.updateUserFollow(user, function(err) {
			var renderModel = new render.RenderModel(user);

			res.redirect('/users');
		});

	});
}

exports.create = create;
exports.destroy = destroy;