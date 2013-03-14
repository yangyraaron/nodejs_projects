function HttpError(httpContext,name,message){
	this.context = httpContext;
	this.name = name;
	this.message = message;
}

HttpError.prototype = new Error();
HttpError.prototype.constructor = HttpError;

exports.HttpError = HttpError;