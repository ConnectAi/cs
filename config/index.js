var db = require("./db");

module.exports = {
	db: db[db.adapter]
};
