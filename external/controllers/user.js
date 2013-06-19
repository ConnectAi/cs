class User extends app.Controller {
	get(req, res) {
		var Cycle = app.models.cycle;
		res.json([2, 4, 6]);
	}

	"post list"(req, res) {
		res.json([2, 4, 6, 8]);
	}
}

module.exports = User;
