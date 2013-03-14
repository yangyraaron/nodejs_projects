var crypto = require('crypto');

function hmac(value) {
	var md5 = crypto.createHmac('md5', 'SuperSecretKey');
	md5.update(value, 'utf-8');

	return md5.digest('hex');
}

function hash(value) {
	var sha = crypto.createHash('sha1');
	sha.update(value, 'utf-8');

	return sha.digest('hex');
}

function toJsonString(obj){
	var jsonText = JSON.stringify(obj);

	return escape(jsonText)
}

function toJson(strJson){
	var text = unescape(strJson);

	return JSON.parse(text);
}

exports.hmac = hmac;
exports.hash = hash;
exports.toJsonString = toJsonString;
exports.toJson = toJson;