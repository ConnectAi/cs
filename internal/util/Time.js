var dateformat = require("dateformat");

class Time {
	constructor(date = new Date()) {
		this.date = new Date(date);
	}

	toString() {
		return `${this.isoDate} ${this.isoTime}`;
	}

	// Utility.
		pad(input) {
			if (input < 10) {
				return "0" + input;
			}
			return ""+input;
		}

	// Convenience.
		format(...args) {
			return dateformat(this.date, ...args);
		}

	// Singular (numeric output).
		get year() {
			return this.date.getFullYear();
		}

		get month() {
			return this.date.getMonth();
		}

		get day() {
			return this.date.getDate();
		}

		get hour() {
			return this.date.getHours();
		}

		get minute() {
			return this.date.getMinutes();
		}

		get second() {
			return this.date.getSeconds();
		}

	// Plural (string output).
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

	// Standards.
		get iso() {
			return this.date.toISOString().replace(/Z.*$/, "");
		}

		get isoDate() {
			return this.iso.replace(/T.*$/, "");
		}

		get isoTime() {
			return this.iso.replace(/^.*T/, "");
		}
};

Time.format = dateformat;

module.exports = Time;
