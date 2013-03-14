var cluster = require('cluster');
var http = require('http');
var os = require('os');

var rssWarn = [12 * 1024 * 1024],
	heapWarn = [10 * 1024 * 1024];

var workers = {};

if (cluster.isMaster) {
	var numCpus = os.cpus().length;

	console.log('the server has ' + numCpus + ' cores');

	for (var i =0; i < numCpus; i++) {
		createWorker();

	}

	//every second master process checks if has any child process 
	//gets stuck in long running task,and kill it,create a new one.
	setInterval(function monitor() {
		var time = new Date().getTime();

		for (var pid in workers) {
			var workerInfo = workers[pid];

			if (workerInfo && workerInfo.lastCb + 5000 < time) {
				console.log('long running worker ' + pid + ' is going to be killed');

				workerInfo.worker.kill();

				delete workerInfo;

				createWorker();

				console.log('a new worker process has been created');
			}
		}
	}, 1000);

	cluster.on('death', function close(worker) {
		console.log('the worker ' + worker.id + ' died.try to fork a new one.');
		cluster.fork();
	});
} else {
	http.Server(function handleRequest(req, res) {
		var curPid = process.pid;

		if (Math.floor(Math.random()) * 200 == 4) {
			console.log('stopped ' + curPid + 'from ever finishing');
			while (true) {
				continue;
			}
		}

		res.writeHead(200);
		res.end('hello world! from ' + curPid + '\n');
	}).listen(8000);

	console.log('server is listening to 8000');

	//every second the child worker reports its state to master process
	setInterval(function report() {
		process.send({
			cmd: 'reportMem',
			memory: process.memoryUsage(),
			process: process.pid
		});
	}, 1000);
}

function createWorker() {
	var worker = cluster.fork();
	var	pid = worker.process.pid;

	console.log('created worker ' + pid);

	workers[pid] = {
		worker: worker,
		lastCb: new Date().getTime() - 1000
	};

	worker.on('message', function onMessage(msg) {
		if (msg.cmd === 'reportMem') {
			var processId = msg.process;
			workers[processId].lastCb = new Date().getTime();

			if (msg.memory.rss > rssWarn) {
				console.log('worker ' + processId + 'using too much memory');
			}
		}
	});
}