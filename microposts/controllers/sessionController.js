var url = require('url'),
	user = require('../models/user'),
	follow = require('../models/follow'),
	util = require('util'),
	securityHelper = require('../helpers/securityHelper'),
	timeHelper = require('../helpers/datetimeHelper'),
	userHelper = require('../helpers/userHelper'),
	render = require('../models/render');


function signedIn(userInfo, httpContext) {
	var req = httpContext.req,
		res = httpContext.res;

	userInfo.createTime = timeHelper.format(user.createTime);

	userHelper.updateUserFollow(userInfo, function(err) {
		//set session
		req.session.user = userInfo;

		//update the http context
		httpContext.user = userInfo;

		res.redirect('/home');
	});
}

function verifyUser(userInfo, callback) {
	var userModel = new user.UserModel();

	userModel.getUser(userInfo.email, function(err, user) {
		if(err) {
			callback(false);
		} else {
			util.log('the user is signing in : ' + util.inspect(user, true, null));

			if(user) {
				if(user.password === securityHelper.hmac(userInfo.password)) {
					userInfo.name = user.name;
					delete user.password;
					callback('', user);
				} else {
					callback('the email or password is invalid');
				}
			} else {
				callback('you have not registered yet!please register first');
			}
		}
	});
}

var readableUrls = {
	'GET': {
		'/': 'root',
		'/signin': 'signinPage',
		'/home': 'homePage',
		'/signup': 'signupPage',
		'/users': 'usersPage'
	},
	'POST': {
		'/users': 'createUser'
	}
};

function validate(httpContext) {
	var req = httpContext.req,
		res = httpContext.res;

	var pathName = url.parse(req.url).pathname;

	if(httpContext.user) return true;

	var urlObj = readableUrls[req.method];

	if(urlObj[pathName]) return true;

	var reg = new RegExp('/session/{0,1}');
	if(reg.test(req.url)) return true;

	res.redirect('/signin');

	return false;
}


function create(httpContext) {
	var req = httpContext.req,
		res = httpContext.res;

	//get the parameters from body
	var paramUser = req.body.user,
		user = {
			email: paramUser.email,
			password: paramUser.password
		};

	verifyUser(user, function(err, user) {

		if(!err) {
			signedIn(user, httpContext);
		} else {
			var renderModel = new render.RenderModel();
			renderModel.pushError(err);
			res.render('signin', renderModel);
		}
	});

}

function destroy(httpContext) {
	var req = httpContext.req,
		res = httpContext.res;

	delete req.session.user;

	httpContext.user = undefined;

	res.redirect('/');
}

function xnew(httpContext) {
	var renderModel = new render.RenderModel(httpContext.user);

	httpContext.res.render('signin', renderModel);
}

exports.create = create;
exports.validate = validate;
exports.destroy = destroy;
exports.new = xnew;
exports.signedIn = signedIn;