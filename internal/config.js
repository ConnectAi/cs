var path = "../external/config/";

var db = require(path + "db"),
	routes = require(path + "routes");

module.exports = {
	db: db[db.adapter],
	routes
};
