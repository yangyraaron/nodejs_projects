
function httpContext(req,res){
	this.req = req;
	this.res = res;

	var user = this.req && this.req.session && this.req.session.user;
	this.user = user;
}

httpContext.prototype = {
	update:function(req,res){
		this.req = req;
		this.res = res;
	}
};

exports.httpContext = httpContext;


