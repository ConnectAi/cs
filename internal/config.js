var external = "../external/config";

var db = require(external + "/db"),
	routes = require(external + "/routes");

module.exports = {
	db: db[db.adapter],
	routes
};
