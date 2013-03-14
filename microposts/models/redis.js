var redis = require('redis'),
	events = require('events');

function redisModel(port, host) {
	this.port = port || 6379;
	this.host = host || '192.168.110.129';

	this.status = 'unconnect';
}

redisModel.prototype = {
	connect: function() {
		this.client = redis.createClient(this.port, this.host);

		this.client.on('ready', function() {
			this.status = 'ready';
		});

		this.client.on('connect', function() {
			this.status = 'connected';
		});

		var that = this;
		this.client.on('error', function(err) {
			this.status = 'error';

			that.client.end();
		});

		this.client.on('end', function() {
			this.status = 'end';
		});

		this.client.on('drain', function() {
			this.status = 'drain';
		});

		this.client.on('idle', function() {
			this.status = 'idle';
		});
	}
};

exports.redisModel = redisModel;