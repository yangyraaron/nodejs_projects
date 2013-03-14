function now(){
	var now = new Date();

	return now.toJSON();
}

function format(jsonString){
	var time = new Date(jsonString);

	return time.toLocaleDateString();
}

function nowTime(){
	var now = new Date();
	return now.getTime();
}

exports.now = now;
exports.format = format;
exports.nowTime = nowTime;