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
	var date = new Date().toISOString().replace("T", " | ").replace(/\.\d*Z$/, "");
	fs.appendFile("app.log", `${date}:\t${line}\n`);
};

private @date;
class Time {
	constructor(date = new Date()) {
		this.@date = date;
	}

	pad(input) {
		if (input < 10) {
			return "0" + input;
		}
		return "" + input;
	}

	get year() {
		return this.@date.getFullYear();
	}

	get month() {
		return this.@date.getMonth();
	}

	get day() {
		return this.@date.getDate();
	}

	get hour() {
		return this.@date.getHours();
	}

	get minute() {
		return this.@date.getMinutes();
	}

	get second() {
		return this.@date.getSeconds();
	}

	get years() {
		return this.pad(this.year);
	}

	get months() {
		return this.pad(this.month);
	}

	get days() {
		return this.pad(this.day);
	}

	get hours() {
		return this.pad(this.hour);
	}

	get minutes() {
		return this.pad(this.minute);
	}

	get seconds() {
		return this.pad(this.second);
	}
};

module.exports = {
	capitalize,
	validateEmail,
	randomString,
	log,
	Time
};
