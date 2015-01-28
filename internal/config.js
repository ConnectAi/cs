let external = require(`${app.dirs.external}/config`);

// This finagling is to avoid changing apps that use cs.
let environments = external.env || {};
external.env = (process.argv.length === 3) ? process.argv[2] : undefined;

// Default config values.
let defaults = {
	name: "[name]",
	port: process.env.PORT || 3000,
	env: process.env.NODE_ENV || "development",
	path: "/",
	session: "memory",
	sockets: false,
	cacheBuster: "none"
};

let override = function(setting) {
	return (typeof external[setting] !== "undefined") ? external[setting] : defaults[setting];
};

// Set core values.
let config = {
	name: override("name"),
	port: override("port"),
	env: override("env"),
	path: override("path"),
	db: external.db,
	session: override("session"),
	sockets: override("sockets"),
	cacheBuster: override("cacheBuster")
};

// Environment-specific overrides.
for (let env in environments) {
	if (env === config.env) {
		for (let override in environments[env]) {
			config[override] = environments[env][override];
		}
	}
}

config.db = config.db[config.db.adapter];

// Handle non-colliding arbitrary config settings.
let settings = Object.keys(config);
for (let setting in external) {
	if (!~settings.indexOf(setting)) {
		config[setting] = external[setting];
	}
}

// Set accessible settings in express.
server.set("name", config.name);
server.set("port", config.port);
server.set("env", config.env);
server.set("path", config.path);

module.exports = config;
