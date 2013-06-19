class User extends app.Controller {
	_asdf() {
		return 4;
	}

	get(req, res) {
		res.json(this._asdf());

		// var User = app.models.User;
		// User.queryMulti("select * from ed", function(rows) {
		// 	res.json(rows);
		// });

		// User.getSomethingFromSeansHouse()

	}

	"post list"(req, res) {
		res.json([2, 4, 6, 8]);
	}
}

module.exports = User;
