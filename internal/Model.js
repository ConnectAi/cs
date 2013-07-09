var mysql = require('mysql');
var pool;

class Model {
	get table() {
		return "";
	}

	get primaryKey() {
		return "id";
	}

	query(q, ...args) {
		var def = Q.defer();

		var query = [q];

		var fn;
		if (args.length === 0) {
			fn = ()=>{};
		}
		if (args.length === 1) {
			fn = args[0];
		}
		if (args.length === 2) {
			query.push(args[0]);
			fn = args[1];
		}

		pool.getConnection((err, connection) => {
			query.push((err, res) => {
				this.log(`${q}\n`);

				if (err) {
					this.log(err);
					this.error(err, q);
					def.reject(err);
				} else {
					fn(res);
					def.resolve(res);
				}

				connection.end();
			});

			connection.query(...query);
		});

		return def.promise;
	}

	save(data, table = this.table, primaryKey = this.primaryKey) {
		var def = Q.defer();
		var q = "";
		var id = 0;

		// if we have an id, update
		if (primaryKey in data) {

			q = "UPDATE `"+table+"` SET ? WHERE `"+primaryKey+"` = '"+data[primaryKey]+"'";

			// save this id so we can return it in the deferred
			id = data.id;

			// delete the id because we don't need to update our row with it
			delete data.id;

		// if we dont have an id, insert
		} else {
			q = "INSERT INTO `"+table+"` SET ?";
		}

		// log the query
		//this.log(q);

		// find any NOW()'s and convert them
		for (let key in data) {
			if (data[key] === "NOW()") {
				data[key] = new Date().toISOString();
			}
		};

		// run the query
		var rt = this.query(q, data, (result) => {
			def.resolve(result.insertId || id);
		});

		this.log(`${rt.sql}\n`);

		return def.promise;
	}

	find(where = "1 = 1", table = this.table) {
		var def = Q.defer();

		var q = "SELECT * FROM " + table + " WHERE " + where;
		this.querySingle(q, function(row) {
			def.resolve(row);
		});

		return def.promise;
	}


	findAll(where = "1 = 1", table = this.table) {
		var def = Q.defer();

		var q = "SELECT * FROM " + table + " WHERE " + where;
		this.queryMulti(q, function(row) {
			def.resolve(row);
		});

		return def.promise;
	}

	findById(id, fn = ()=>{}, table = this.table) {
		return this.find("id = " + id, fn, table);
	}

	// db query to get a single value
	queryValue(q, fn = ()=>{}) {
		var def = Q.defer();
		this.querySingle(q, function(row) {
			if (row) {
				for (let i in row) {
					fn(row[i]);
					def.resolve(row[i]);
					break;
				}
			} else {
				fn(false);
				def.resolve(false);
			}
		});

		return def.promise;
	}

	// db query to get a single array
	querySingle(q, fn = ()=>{}) {
		var def = Q.defer();

		this.query(q, function(rows) {
			fn(rows[0]);
			def.resolve(rows[0]);
		});

		return def.promise;
	}

	bulkInsert(keys = [], values = [], table = this.table) {
		var def = Q.defer();
		// handle keys
		keys = keys.join(",");

		var sql = "INSERT INTO `"+table+"` ("+keys+") VALUES ?";

		this.log(sql);

		this.query(sql, [values], (result) => {
			def.resolve(result);
		});
	}

	// db query to get many arrays of arrays of arrays of...
	queryMulti(q, fn = ()=>{}) {
		var def = Q.defer();

		this.query(q, function(res) {
			fn(res);
			def.resolve(res);
		});

		return def.promise;
	}

	log(line) {
		// Apend to the log file.
		app.utilities.log(line);
	}

	error() {
		console.error(...arguments);
	}
}

function connect() {
	pool = mysql.createPool(app.config.db);
}

// connect when done
app.loader.done(connect);

module.exports = Model;
