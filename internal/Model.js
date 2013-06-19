var mysql = require('mysql');
	db = mysql.createConnection(app.config.db);

db.connect();

class Model {
	constructor() {}

	query(q, fn = ()=>{}) {
		db.query(q, (err, res) => {
			this.log(q); if(err) this.log(err);
			if(err) {
				this.log(err);
				this.error(err, q);
			} else {
				fn(res);
			}
		});
	}

	// db query to get a single value
	queryValue(q, fn) {
		this.querySingle(q, function(row) {
			for(var i in row) {
				fn(row[i]);
				break;
			}
		});
	}

	// db query to get a single array
	querySingle(q, fn) {
		this.query(q, function(rows) {
			fn(rows[0]);
		});
	}

	// db query to get many arrays of arrays of arrays of...
	queryMulti(q, fn) {
		this.query(q, function(res) {
			fn(res);
		});
	}

	log() {
		console.log(...arguments);
	}

	error() {
		console.error(...arguments);
	}
}

module.exports = Model;
