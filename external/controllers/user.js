class User extends app.Controller {
	index(req, res) {
		res.json("aoeu")
	}

	get(req, res) {
		var Cycle = app.models.cycle;

		res.json({});
	}

	empty() {}

	"post list"(req, res) {
		res.json([2, 4, 6, 8]);
	}
}

module.exports = User;
