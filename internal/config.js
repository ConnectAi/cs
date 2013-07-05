var external = require("../external/config");
var defaults = {};

var config = {
	port: external.port,
	db: external.database[external.database.adapter],
	routes: require("../external/routes")
};

module.exports = config;
