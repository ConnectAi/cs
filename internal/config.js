var hbs = require("hbs");

var external = require("../external/config");
external.routes = require("../external/routes");

var defaults = {
	name: "[name]",
	port: process.env.PORT || 3000,
	title: "{{name}} | {{action}} {{controller}} {{id}}"
};

var config = {
	name: external.name || defaults.name,
	port: external.port || defaults.port,
	title: hbs.compile(external.title || defaults.title),
	db: external.database[external.database.adapter],
	routes: external.routes
};

server.set("name", config.name);
server.set("port", config.port);

module.exports = config;
