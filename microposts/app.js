var express = require('express'),
	app = express(),
	ejs = require('ejs'),
	error = require('./error'),
	boot = require('./boot'),
	homeController = require('./controllers/homeController'),
	loginController = require('./controllers/sessionController'),
	httpContext = require('./models/httpContext'),
	domain = require('domain');

var viewDir = __dirname + '/web',
	context = undefined,
	globalDomain = domain.create();

//handle the error finally
globalDomain.on('error', function(err) {
	if(err instanceof error.HttpError) {

		console.log('global error: ' + err.message);

		homeController.error(err, err.context);
	} else {

		console.log('global error: ' + err);
	}
});

globalDomain.run(function() {

	app.configure(function() {
		//the body parser must be registered before method override,otherwise
		//it doesn't work.
		app.use(express.bodyParser());
		app.use(express.methodOverride());

		//app.use(app.router());
		app.engine('.html', ejs.__express);
		app.set('views', viewDir);
		app.set('view engine', 'html');
		app.use(express.static(viewDir));
		app.use(express.favicon());

		app.use(express.cookieParser('security'));
		app.use(express.session())

		//app.use(express.errorHandler({dumpExceptions:true,showStack:true}));
	});

	// app.configure('development', function  () {
	// 	app.use(express.errorHandler({dumpExceptions:true,showStack:true}));
	// });
	// app.configure('production', function () {
	// 	app.use(express.errorH00010andler());
	// });
	//register the error handler
	app.use(error);

	boot.addResources(['home', 'session', 'users', 'follow','post']);

	boot.addMapping('/', 'home', 'index');
	boot.addMapping('/signup', 'users', 'new');
	boot.addMapping('/signin', 'session', 'new');
	boot.addMapping('/signout', 'session', 'destroy');

	function error(err, req, res, next) {
		homeController.error(err, context);

		next();
	}

	app.all('*', function(req, res, next) {
		context = new httpContext.httpContext(req, res);

		var isValid = loginController.validate(context),
			isHandled = false;

		if(isValid) {
			console.log('routing request:method ' + req.method + ' request url:' + req.url);

			isHandled = boot.routing(context);
		}

		if(!isHandled) next();

	});

	app.all('*', function(req, res) {
		res.redirect('home');
	});

	app.listen(3000);

	console.log('the server is listening on 3000');
	console.log(process.version);

});