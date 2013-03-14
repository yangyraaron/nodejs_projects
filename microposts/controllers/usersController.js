var render = require('../models/render'),
	user = require('../models/user'),
	follow = require('../models/follow'),
	sessionController = require('./sessionController'),
	homeController = require('./homeController');

//display all users

function index(httpContext) {
	var curUser = httpContext.user,
		renderModel = new render.RenderModel(curUser);

	//if not user signed in
	if(!curUser) {
		var userModel = new user.UserModel();
		userModel.getAllUsers(function(err, emails) {
			if(err) throw err;

			renderModel.setBody({
				users: emails
			});
			httpContext.res.render('user/users', renderModel);
		});
	} else {
		var followModel = new follow.FollowModel(),
			users = [];

		followModel.getUnfollowingUsers(curUser.email, function(err, results) {
			if(err) throw err;

			results.forEach(function(result) {
				users.push({
					email: result,
					isFollowing: false
				});
			});

			followModel.getFollowingUsers(curUser.email, function(err, results) {
				if(err) throw err;

				results.forEach(function(r) {
					users.push({
						email: r,
						isFollowing: true
					});
				});


				renderModel.setBody({
					users: users
				});
				httpContext.res.render('user/users', renderModel);
			});
		});
	}

}

//show an user's information 

function show(httpContext) {

}

//dispaly signup page

function xnew(httpContext) {
	var renderModel = new render.RenderModel(httpContext.user);

	httpContext.res.render('signup', renderModel);
}

//add a new user

function create(httpContext) {
	var userModel = new user.UserModel(),
		userParams = httpContext.req.body.user;

	var userEntity = {
		name: userParams.name,
		email: userParams.email,
		password: userParams.password
	};

	userModel.addUser(userEntity, function(err, user) {
		if(err) {
			var renderModel = new render.RenderModel(httpContext.user);
			renderModel.pushError(err);

			httpContext.res.render('signup', renderModel);
		} else {
			sessionController.signedIn(user, httpContext);
		}
	});
}

//display edit page

function edit(httpContext) {

}

//update an user

function update(httpContext) {

}
//delete an user

function destroy(httpContext) {

}


exports.index = index;
exports.show = show;
exports.new = xnew;
exports.create = create;
exports.edit = edit;
exports.update = update;
exports.destroy = destroy;