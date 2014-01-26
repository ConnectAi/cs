var fs = require("fs");

var capitalize = function(word) {
	return word[0].toUpperCase() + word.substr(1);
};

var validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

var randomString = function(length = 8) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

var log = function(line) {
	var D = date.getDate(),
		M = date.getMonth() + 1,
		Y = date.getFullYear(),
		h = date.getHours(),
		m = date.getMinutes(),
		s = date.getSeconds();
	fs.appendFile("app.log", `${Y}-${M}-${D} | ${h}:${m}${s}:\t${line}\n`);
};

require("./helpers")();

module.exports = {
	capitalize,
	validateEmail,
	randomString,
	log,
	loader: require("./loader")
};
