var fs = require("fs");
var Time = require("./Time");

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
	var date = new Time().format("Y-M-D | h:m:s");
	fs.appendFile("app.log", `${date}:\t${line}\n`);
};

module.exports = {
	capitalize,
	validateEmail,
	randomString,
	log,
	Time
};
