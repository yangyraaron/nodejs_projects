function RenderModel(user, body, footer) {
	this.header = {
		user: user
	};
	this.body = body||{};
	this.footer = footer||{};
	this.errors = [];
}

RenderModel.prototype = {
	setBody: function(body) {
		if(!body) return;

		for(var key in body) {
			this.body[key] = body[key];
		}
	},
	pushError: function(error) {
		this.errors.push(error);
	},
	clearErrors:function(){
		this.errors.clear();
	}
}

exports.RenderModel = RenderModel;