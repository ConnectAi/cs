class User extends app.Controller {
	get(req, res) {
		res.view();
	}

	"post list"(req, res) {
		res.json([2, 4, 6, 8]);
	}
}

module.exports = User;
