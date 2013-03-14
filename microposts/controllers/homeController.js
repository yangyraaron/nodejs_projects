var render = require('../models/render'),
	post = require('../models/post'),
	error = require('../error'),
	userHelper = require('../helpers/userHelper');


function error(err, httpContext) {
	var user = httpContext && httpContext.user;

	var renderModel = new render.RenderModel(user);

	renderModel.pushError(err);

	httpContext.res.render('error', renderModel);
}

function handle404(httpContext) {
	var renderModel = new render.RenderModel(httpContext.user);
	renderModel.setBody({
		url: httpContext.req.url
	});

	httpContext.res.status(404);
	httpContext.res.render('404', renderModel);
}

function handle500(err,httpContext) {
	var renderModel = new render.RenderModel(httpContext.user, err);

	renderModel.pushError(err);

	httpContext.res.status(500);

	httpContext.res.render('500', renderModel);
}

function index(httpContext) {
	var user = httpContext.user,
		res = httpContext.res;
		renderModel = new render.RenderModel(user);

	//if no user signed in
	if(!user){
		res.render('home', renderModel);
		return;
	}
	userHelper.updateUserFollow(user, function(err) {
		if(err) throw new error.HttpError(httpContext,'updateUserFollow',err);

		var postModel = new post.PostModel();

		postModel.getUserPosts(user.email, null, function(err, posts) {
			if(err) throw new error.HttpError(httpContext,'getUserPosts',err);

			console.log("posts count:"+posts.length);

			renderModel.setBody({posts:posts});

			res.render('home', renderModel);
		});

	});

}

exports.error = error;
exports.handle404 = handle404;
exports.handle500 = handle500;
exports.index = index;