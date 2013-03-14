var postModule = require('../models/post'),
	error = require('../error'),
	render = require('../models/render');

function create(httpContext){
	var req = httpContext.req,
		res = httpContext.res,
		user = httpContext.user,
		postModel = new postModule.PostModel();


	var post = req.body.post;

	post.creator = user.email;

	postModel.addPost(post, function(err,result){
		if(err) throw new error.HttpError(httpContext,'addPost',err);

		var renderModel = new render.RenderModel(user);

		res.redirect('/home');
	});
}

exports.create = create;