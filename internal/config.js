var external = require("../external/config");
external.routes = require("../external/routes");

var defaults = {
	name: "[name]",
	port: process.env.PORT || 3000,
	env: process.env.NODE_ENV || "development"
};

var config = {
	name: external.name || defaults.name,
	port: external.port || defaults.port,
	env: (process.argv.length === 3) ? process.argv[2] : defaults.env,
	db: external.database[external.database.adapter],
	routes: external.routes
};

server.set("name", config.name);
server.set("port", config.port);
server.set("env", config.env);

module.exports = config;
