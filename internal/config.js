var external = require(`${app.dirs.external}/config`);
external.routes = require(`${app.dirs.external}/controllers`);

var defaults = {
	name: "[name]",
	port: process.env.PORT || 3000,
	env: process.env.NODE_ENV || "development",
	path: "/"
};

var config = {
	name: external.name || defaults.name,
	port: external.port || defaults.port,
	env: (process.argv.length === 3) ? process.argv[2] : defaults.env,
	path: external.path || defaults.path,
	db: external.db,
	routes: external.routes
};


for (let env in external.env) {
	if (env === config.env) {
		for (let override in external.env[env]) {
			config[override] = external.env[env][override];
		}
	}
}

config.db = config.db[config.db.adapter];

server.set("name", config.name);
server.set("port", config.port);
server.set("env", config.env);
server.set("path", config.path);

module.exports = config;
