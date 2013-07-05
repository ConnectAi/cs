var external = require("../external/config");
var defaults = {};

var config = {
	name: external.name,
	port: external.port || process.env.PORT || 3000,
	db: external.database[external.database.adapter],
	routes: require("../external/routes")
};

server.set("name", config.name);
server.set("port", config.port);

module.exports = config;
