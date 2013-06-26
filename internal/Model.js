var mysql = require('mysql');
var db;
var moment = require('moment');

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
		var q = "";
		var def = Q.defer();
		var id = 0;

		// if we have an id, update
		if("id" in data) {

			q = "UPDATE `"+table+"` SET ? WHERE id = '"+data.id+"'";

			// save this id so we can return it in the deferred
			id = data.id;

			// delete the id because we don't need to update our row with it
			delete data.id;

		// if we dont have an id, insert
		} else {
			q = "INSERT INTO `"+table+"` SET ?";
		}

		// log the query
		this.log(q);

		// find any NOW()'s and convert them
		for(var key in data) {
			if(data[key] === "NOW()") {
				data[key] = moment().format("YYYY-MM-DD HH:MM:SS");
			}
		};

		// run the query
		db.query(q, data, (err, result) => {
			// if error
			if(err) this.log(err);

			// resolve the defered with our stuff
			def.resolve(result.insertId || id);
		});

		return def.promise;
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
