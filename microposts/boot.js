/*
		rest style
		pathName:/users/1/action
		resource=>users
		id=>1
		action=>controller method
		
		-------------------------------------------------------------------
		http request    uri            action      purpose
		-------------------------------------------------------------------
		    GET        /users          index      page to list all users
		    GET        /users/1        show       page to show user with id=1
		    GET        /users/new      new        page to make a new user
		    POST       /users          create     create a new user
			GET        /users/1/edit   edit       page to edit user with id=1
			PUT        /users/1        update     update user with id=1
			DELETE     /users/1        destroy    delete user with id=1 
		
	*/


var url = require('url'),
	util = require('util');

var actions = {
	index: 'index',
	show: 'show',
	new: 'new',
	create: 'create',
	edit: 'edit',
	update: 'update',
	destroy: 'destroy'
},
	controllersCache = {};

function getControllerFromCache(key) {
	return controllersCache[key];
}

function cacheController(key, value) {
	controllersCache[key] = value;
}

var SUFFIX_CONTROLLER = "controller";

function addResources(resources) {
	resources.forEach(function(resource) {
		addResource(resource);

	});
}

function addResource(resource) {
	var controllerName = resource + SUFFIX_CONTROLLER,
		controller = undefined;

	controller = getControllerFromCache(resource);

	if(!controller) {
		controller = require('./controllers/' + controllerName);
		cacheController(resource, controller);
	}

	return controller;
}

function execute(controller, action, httpContext) {

	var fun = controller[action];

	if(fun) {
		fun(httpContext);
		return true;
	}

	return false;
}

function routing(httpContext) {
	var req = httpContext.req,
		pathName = url.parse(req.url).pathname,
		paths = pathName.split('/'),
		mapping = mappings[pathName];

	if(mapping) {
		mapping.controller[mapping.action](httpContext);

		return true;
	}

	var resource = paths[1],
		controller = getControllerFromCache(resource),
		action = resolveAction(req, paths);

	console.log('resource is : ' + resource + ' action is : ' + action);

	if(controller && action) {
		return execute(controller, action, httpContext);
	}

	return false;
}

// function resolveAction(req, paths) {
// 	var len = paths.length;
// 	switch(len) {
// 	case 2:
// 		//handle the  display list page request,eg. /users
// 		if(req.method === 'GET') {
// 			return actions.index;
// 		} else if(req.method === 'POST') { //handle the create request eg. /users
// 			return actions.create;
// 		} else {
// 			return undefined;
// 		}
// 	case 3:
// 		switch(req.method) {
// 		case 'GET':
// 			var action = paths[len - 1];
// 			//handle the request of display new page eg. users/new
// 			if(action == actions.new) {
// 				return actions.new;
// 			} else { //handle the request of display show page eg. /users/1
// 				return actions.show;
// 			}
// 		case 'PUT':
// 			//handle the request of update 
// 			return actions.update;
// 		case 'DELETE':
// 			//handle the request of delete
// 			return actions.destroy;
// 		default:
// 			return undefined;
// 		}
// 	case 4:
// 		var action = paths[len - 1];
// 		//handle the request of show edit page
// 		if(action == actions.edit) {
// 			return actions.edit;
// 		}
// 		return undefined;
// 	default:
// 		return undefined;
// 	}
// }

function resolveAction(req, paths) {
	var len = paths.length,
		action = paths[len - 1];

	switch(req.method) {
	case 'POST':
		return actions.create;
	case 'PUT':
		return actions.update;
	case 'DELETE':
		return actions.destroy;
	case 'GET':
		if(len == 2) return actions.index;

		return actions[action];
	default:
		return undefined;

	}
}

var mappings = {};

function addMapping(path, resource, action) {

	var controller = addResource(resource);

	if(!controller) return;

	mappings[path] = {
		controller: controller,
		action: action
	};
}

exports.addResources = addResources;
exports.routing = routing;
exports.addMapping = addMapping;