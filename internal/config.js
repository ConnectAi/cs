var external = require("../external/config");
var defaults = {};

var config = {
	db: external.database[external.database.adapter],
	routes: external.routes,
	policies: external.policies
};

module.exports = config;
