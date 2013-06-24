var mysql = require('mysql');
var db;

class Model {
	constructor() {
		this.primaryKey = "id";
		this.table = "";
	}

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

	save(data, table = this.table, primaryKey = this.primaryKey) {
		return {data, table, primaryKey};
	}

	find(where, fn, table = this.table) {
		var q = "SELECT * FROM " + table + " WHERE 1 = 1 && " + where;
		this.querySingle(q, function(row) {
			fn(row);
		});
	}

	findById(id, fn, table = this.table) {
		this.find("id = " + id, fn, table);
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

app.loader.done(function() {
	db = mysql.createConnection(app.config.db)
	db.connect();
});

module.exports = Model;
