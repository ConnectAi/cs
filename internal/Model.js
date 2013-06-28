var mysql = require('mysql');
var db;

class Model {
	constructor() {
		this.primaryKey = "id";
		this.table = "";
	}

	query(q, fn = ()=>{}) {
		var def = Q.defer();

		db.query(q, (err, res) => {
			this.log(q); 
			this.log(`
			`);
			
			if(err) this.log(err);
			if(err) {
				this.log(err);
				this.error(err, q);
				def.reject(err);
			} else {
				fn(res);
				def.resolve(res);
			}
		});

		return def.promise;
	}

	save(data, table = this.table, primaryKey = this.primaryKey) {
		var def = Q.defer();
		var q = "";
		var id = 0;

		// if we have an id, update
		if(primaryKey in data) {

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
		for(var key in data) {
			if(data[key] === "NOW()") {
				data[key] = new Date().toISOString();
			}
		};

		// run the query
		var rt = db.query(q, data, (err, result) => {
			// if error
			if (err) {
				this.log(err);
				def.reject(err);
			} else {
				// otherwise resolve the defered with our stuff
				def.resolve(result.insertId || id);
			}
		});
		
		this.log(rt.sql);
		this.log(`
		`);

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
			if(row) {
				for(var i in row) {
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
	
	bulkInsert(keys=[],values=[],table = this.table) {
		var def = Q.defer();
		// handle keys
		keys = keys.join(",");
		
		var sql = "INSERT INTO `"+table+"` ("+keys+") VALUES ?";
		
		this.log(sql);
		
		db.query(sql,[values], (err,result) => {
			if (err) {
				this.log(err);
				def.reject(err);
			} else {
				// otherwise resolve the defered with our stuff
				def.resolve(result);
			}
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
