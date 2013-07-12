var mysql = require("mysql");
var pool;

class Model {
	get table() {
		return "";
	}

	get primaryKey() {
		return "id";
	}

	query(q, ...args) {
		var def = when.defer();

		var query = [q];

		if (args.length === 0) {
		}
		if (args.length === 1) {
			query.push(args[0]);
		}

		pool.getConnection((err, connection) => {
			if (err) {
				this.log(err);
				this.error(err, q);
				def.reject(err);
			} else {
				query.push((err, res) => {
					this.log(`${q}\n`);

					if (err) {
						this.log(err);
						this.error(err, q);
						def.reject(err);
					} else {
						def.resolve(res);
					}

					connection.end();
				});

				connection.query(...query);
			}
		});

		return def.promise;
	}

	save(data, table = this.table, primaryKey = this.primaryKey) {
		var def = when.defer();
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
		var rt = this.query(q, data)
			.then((result) => {
				def.resolve(result.insertId || id);
			});

		this.log(`${rt.sql}\n`);

		return def.promise;
	}

	find(where = "1 = 1", table = this.table) {
		var q = "SELECT * FROM " + table + " WHERE " + where;
		return this.querySingle(q);
	}

	findAll(where = "1 = 1", table = this.table) {
		var q = "SELECT * FROM " + table + " WHERE " + where;
		return this.queryMulti(q);
	}

	findById(id, table = this.table) {
		return this.find("id = " + id, table);
	}

	// db query to get a single value
	queryValue(q) {
		var def = when.defer();

		this
		.querySingle(q)
		.then(function(row) {
			if (row) {
				for (let i in row) {
					def.resolve(row[i]);
					break;
				}
			} else {
				def.resolve(false);
			}
		});

		return def.promise;
	}

	// db query to get a single array
	querySingle(q) {
		var def = when.defer();

		this
		.query(q)
		.then(function(rows) {
			def.resolve(rows[0]);
		});

		return def.promise;
	}

	bulkInsert(keys = [], values = [], table = this.table) {
		// handle keys
		keys = keys.join(",");

		var sql = "INSERT INTO `"+table+"` ("+keys+") VALUES ?";

		this.log(sql);

		return this.query(sql, [values]);
	}

	// db query to get many arrays of arrays of arrays of...
	queryMulti(q) {
		return this.query(q);
	}

	log(line) {
		// Apend to the log file.
		app.util.log(line);
	}

	error() {
		console.error(...arguments);
	}
}

function connect() {
	pool = mysql.createPool(app.config.db);
}

// connect when done
app.loader.then(connect);

module.exports = Model;
