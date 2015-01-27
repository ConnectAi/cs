require("harmony-reflect");
var mysql = require("mysql");


var copy = function(from, to) {
	for (let prop in from) {
		if (from.hasOwnProperty(prop)) {
			to[prop] = from[prop];
		}
	}
	return to;
};

var serializeClause = function(q, delimeter = " AND ", nulls = true) {
	var clause,
		where = [];

	// No need to serialize if the query is already a string
	if (typeof q === 'string') return q;

	for (let prop in q) {
		if (q.hasOwnProperty(prop)) {
			clause = (q[prop] === null && nulls)
				? `\`${prop}\` is NULL`
				: `\`${prop}\` = "${q[prop]}"`
			;
			where.push(clause);
		}
	}
	if (!where.length) {
		where.push("1 = 1");
	}

	return `${where.join(`${delimeter}`)}`;
};


class Model {
	constructor(data = {}) {
		copy(data, this);
	}

	save() {
		let Model = app.models[this.$model];
		if (this.$exists) {
			return Model.update(this.$cache, this);
		} else {
			return Model.insert(this);
		}
	}
}


var pool;

Model.query = function(q, ...args) {
	return new Promise((resolve, reject) => {
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
				reject(new Error(err));
			} else {
				query.push((err, res) => {
					if (err) {
						this.log(err);
						this.error(err, q);
						reject(new Error(err));
					} else {
						resolve(res);
					}

					connection.release();
				});

				var result = connection.query(...query);

				this.log(result.sql + "\n");
			}
		});
	});
};

Model.find = function(q = {}, filter = {}, limit = -1) {
	var select = "";
	var clause = serializeClause(q);

	if (Array.isArray(filter)) {
		select = filter.join(",");
	} else {
		for (let prop in filter) {
			if (filter[prop]) {
				select += prop;
			}
		}
	}
	if (!select.length) {
		select = "*";
	}

	var query = `SELECT ${select} FROM ${this.$collection} WHERE ${clause}`;
	if (limit > -1) query += ` LIMIT ${limit}`;

	return this.query(query)
		.then((results) => {
			return results.map((result) => {
				return new this(result, true);
			});
		});
};

Model.findOne = function(q = {}, filter = {}) {
	return this.find(q, filter, 1)
		.then((results) => results[0] || null);
};

Model.insert = function(data = {}) {
	var query = `INSERT INTO ${this.$collection} SET `;

	query += Object.keys(data)
		.filter(function(prop) {
			return prop !== "$" || typeof data[prop] !== "object";
		})
		.map(function(prop) {
			return `\`${prop}\`="${data[prop]}"`;
		})
		.join(", ");

	return this.query(query);
};

Model.update = function(q = {}, data = {}) {
	var fields = serializeClause(data, ",", false);
	var clause = serializeClause(q);
	return this.query(`UPDATE ${this.$collection} SET ${fields} WHERE ${clause}`);
};

// Get a single value
Model.queryValue = function(q) {
	return this.querySingle(q)
		.then(function(row) {
			if (row) {
				for (let i in row) {
					return row[i];
					break;
				}
			} else {
				return false;
			}
		});
};

// Get a single row
Model.querySingle = function(q) {
	return this.query(q)
		.then(function(rows) {
			return rows[0];
		});
};

Model.log = function(line) {
	// Apend to the log file.
	app.util.log(line);

	// TODO: Rework with new socket model
	/*if(app.config.sockets) {
		if(server.socket) {
			server.socket.emit("queries",line);
		} else {
			server.io.sockets.on("connection", function(socket) {
				server.socket = socket;
				socket.emit("queries",line);
			});
		}
	}*/
};

Model.error = function() {
	console.error(...arguments);
};

Model.change = function(options) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			connection.changeUser(options, (err) => {
				for (let option in options) {
					app.config.db[option] = options[option];
				}
				connection.release();
				if(err) reject(err);
				else resolve(options);
			});
		});
	});
};


function connect() {
	pool = mysql.createPool(app.config.db);
}

// connect when done
app.on("start", connect);


app.model = function(name, model, collection = name.toLowerCase()) {
	// Handle both construct and apply the same way
	var constructSpy = function(target, [data, exists], _args) {
		if (typeof data === "undefined" && typeof _args !== "undefined" && _args.length) {
			data = _args[0];
			exists = _args[1];
		}

		var instance = new target(data);

		// Get model name
		Object.defineProperty(instance, "$model", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: name
		});

		// Get collection name
		Object.defineProperty(instance, "$collection", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: collection
		});

		Object.defineProperty(instance, "$exists", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: exists || false
		});

		Object.defineProperty(instance, "$cache", {
			enumerable: false,
			configurable: false,
			writable: false,
			value: copy(data, {})
		});

		return instance;
		// return Reflect.construct(target, [data]);
	};

	return new Proxy(model, {
		// new proxy(...args)
		construct: constructSpy,

		// proxy(...args)
		apply: constructSpy,

		// proxy[name]
		get: function(target, name, receiver) {
			if (name === "$collection") return collection;
			return Reflect.get(target, name, receiver);
		},

		// proxy[name] = value
		set: function(target, name, value, receiver) {
			return Reflect.set(target, name, value, receiver);
		}
	});
};


module.exports = Model;
