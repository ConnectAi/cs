var dateformat = require("dateformat");

private @date;
class Time {
	constructor(date = new Date()) {
		this.@date = date;
	}

	pad(input) {
		if (input < 10) {
			return "0" + input;
		}
		return ""+input;
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
		return ""+this.year;
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

	get time() {
		return `${this.hours}:${this.hours}:${this.seconds}`;
	}

	get date() {
		return `${this.years}-${this.months}-${this.days}`;
	}

	format(...args) {
		return dateformat(this.@date, ...args);
	}

	toString() {
		return `${this.date} ${this.time}`;
	}
};

Time.format = dateformat;

module.exports = Time;
