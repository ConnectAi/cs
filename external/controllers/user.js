class User extends app.Controller {
	get() {}

	"post list"(req, res) {
		res.json([2, 4, 6, 8]);
	}
}

module.exports = User;
