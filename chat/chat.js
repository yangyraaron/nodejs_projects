var net = require('net');

var chatServer = net.createServer(),
	clients = [];

chatServer.on('connection', function(client) {
	client.name = client.remoteAddress + ':' + client.remotePort;
	client.write('hi ' + client.name + ' !, this is telnet server \n');

	clients.push(client);

	client.on('data', function(data) {
		broadcast(data, client);
	});

	client.on('end', function() {
		removeClient(client);
	});

	client.on('error',function (error) {
		console.log(error);
	});
});

function broadcast(message, client) {
	var cleanup = [];

	clients.forEach(function(item) {
		if (item !== client) {

			if (item.writable) {
				item.write(client.name + ' says: ' + message);
			}else{
				cleanup.push(item);
				item.destroy();
			}
		}
	});

	cleanup.forEach(function (item) {
		removeClient(client);
	});
}

function removeClient(client){
	clients.splice(clients.indexOf(client),1);
}

chatServer.listen(9000);
console.log('telnet server is listening to 9000');