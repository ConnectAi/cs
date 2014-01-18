var external = require(`${app.dirs.external}/config`);

// This finagling is to avoid changing apps that use cs.
var environments = external.env || {};
external.env = (process.argv.length === 3) ? process.argv[2] : undefined;

var defaults = {
	name: "[name]",
	port: process.env.PORT || 3000,
	env: process.env.NODE_ENV || "development",
	path: "/",
	useRedis: false,
	useSockets: true
};

var override = function(setting) {
	return (typeof external[setting] !== "undefined") ? external[setting] : defaults[setting];
};

var config = {
	name: override("name"),
	port: override("port"),
	env:  override("env"),
	path: override("path"),
	db: external.db,
	useRedis: override("useRedis"),
	useSockets: override("useSockets")
};

for (let env in environments) {
	if (env === config.env) {
		for (let override in environments[env]) {
			config[override] = environments[env][override];
		}
	}
}

config.db = config.db[config.db.adapter];

server.set("name", config.name);
server.set("port", config.port);
server.set("env", config.env);
server.set("path", config.path);

module.exports = config;
